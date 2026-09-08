import { ref, computed, reactive } from 'vue'
import ky from 'ky'
import Fuse from 'fuse.js'
import type { Stream, StreamURL, URLSource, URLType, FilterState } from '../types'

const SHEETS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1O0UMu-EMvgm5JPCyKQk_R-5sQOK7DQSEWhi0G47J9YQ/export?format=csv&gid=0'

function parseCSV(raw: string): string[][] {
  return raw
    .split('\n')
    .map((line) => line.split(','))
    .filter((row) => row.length > 1)
}

function detectSource(rawUrl: string): URLSource {
  if (/youtube\.com|youtu\.be/.test(rawUrl)) return 'youtube'
  if (/twitch\.tv/.test(rawUrl)) return 'twitch'
  return 'other'
}

function extractTitleInURL(rawUrl: string): [string | null, string] {
  const match = rawUrl.match(/\(.+\)/)
  if (match) {
    const title = match[0].slice(1, -1)
    const cleaned = rawUrl.replace(match[0], '')
    return [title, cleaned]
  }
  return [null, rawUrl]
}

function parseURL(rawUrl: string): StreamURL | null {
  const trimmed = rawUrl.replace(/\r/g, '').trim()
  if (!trimmed) return null

  const source = detectSource(trimmed)
  let title: string
  let type: URLType

  if (trimmed.includes('playlist')) {
    title = '實況清單'
    type = '實況清單'
  } else if (
    /youtube\.com\/live\/[a-zA-Z0-9\-_]+/.test(trimmed) ||
    /twitch\.tv\/videos\/\d+/.test(trimmed)
  ) {
    const [extracted, cleaned] = extractTitleInURL(trimmed)
    title = extracted || '實況存檔'
    type = '實況存檔'
    return { title, url: cleaned, source, type }
  } else if (
    /youtube\.com\/watch\?v=[a-zA-Z0-9\-_]+/.test(trimmed) ||
    /youtu\.be\/[a-zA-Z\-_]+/.test(trimmed)
  ) {
    const [extracted] = extractTitleInURL(trimmed)
    title = extracted || '實況影片'
    type = '實況影片'
  } else {
    title = '這啥'
    type = '這啥'
  }

  return { title, url: trimmed, source, type }
}

function parseStreamRow(cells: string[]): Stream {
  const [streamTitle, platform, streamedAt, isPopularRaw, isCollabRaw, ...urlCells] = cells
  return {
    streamTitle: streamTitle?.trim() ?? '',
    platform: platform?.trim() ?? '',
    streamedAt: streamedAt?.trim() ?? '',
    isPopular: isPopularRaw?.trim() === '√',
    isCollab: isCollabRaw?.trim() === '√',
    urls: urlCells.map(parseURL).filter((u): u is StreamURL => u !== null),
  }
}

export function useStreamData() {
  const rawData = ref<Stream[]>([])
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  const filters = reactive<FilterState>({
    platforms: [],
    sources: [],
    years: [],
    isPopular: null,
    isCollab: null,
  })

  const searchQuery = ref('')

  const availablePlatforms = computed(() => {
    const set = new Set(rawData.value.map((s) => s.platform).filter(Boolean))
    return [...set].sort()
  })

  const availableYears = computed(() => {
    const set = new Set(rawData.value.map((s) => s.streamedAt).filter(Boolean))
    return [...set].sort().reverse()
  })

  const availableSources = computed<URLSource[]>(() => {
    const set = new Set<URLSource>()
    for (const stream of rawData.value) {
      for (const u of stream.urls) set.add(u.source)
    }
    return [...set].sort()
  })

  let fuse: Fuse<Stream> | null = null

  const filteredData = computed(() => {
    let result = rawData.value

    if (filters.platforms.length > 0) {
      result = result.filter((s) => filters.platforms.includes(s.platform))
    }

    if (filters.sources.length > 0) {
      result = result.filter((s) =>
        s.urls.some((u) => filters.sources.includes(u.source))
      )
    }

    if (filters.years.length > 0) {
      result = result.filter((s) => filters.years.includes(s.streamedAt))
    }

    if (filters.isPopular !== null) {
      result = result.filter((s) => s.isPopular === filters.isPopular)
    }

    if (filters.isCollab !== null) {
      result = result.filter((s) => s.isCollab === filters.isCollab)
    }

    if (searchQuery.value.trim() && fuse) {
      const searchResults = fuse.search(searchQuery.value)
      const searchSet = new Set(searchResults.map((r) => r.item))
      result = result.filter((s) => searchSet.has(s))
    }

    return result
  })

  const activeChips = computed(() => {
    const chips: { key: string; label: string; clear: () => void }[] = []

    for (const p of filters.platforms) {
      chips.push({
        key: `platform-${p}`,
        label: p,
        clear: () => {
          filters.platforms = filters.platforms.filter((x) => x !== p)
        },
      })
    }

    for (const s of filters.sources) {
      chips.push({
        key: `source-${s}`,
        label: s === 'youtube' ? 'YouTube' : s === 'twitch' ? 'Twitch' : s,
        clear: () => {
          filters.sources = filters.sources.filter((x) => x !== s)
        },
      })
    }

    for (const y of filters.years) {
      chips.push({
        key: `year-${y}`,
        label: y,
        clear: () => {
          filters.years = filters.years.filter((x) => x !== y)
        },
      })
    }

    if (filters.isPopular === true) {
      chips.push({
        key: 'popular',
        label: '紅的',
        clear: () => { filters.isPopular = null },
      })
    }

    if (filters.isCollab === true) {
      chips.push({
        key: 'collab',
        label: '聯動',
        clear: () => { filters.isCollab = null },
      })
    }

    return chips
  })

  function clearAllFilters() {
    filters.platforms = []
    filters.sources = []
    filters.years = []
    filters.isPopular = null
    filters.isCollab = null
    searchQuery.value = ''
  }

  async function fetchAndParse() {
    isLoading.value = true
    error.value = null
    try {
      const raw = await ky.get(SHEETS_CSV_URL).text()
      const rows = parseCSV(raw)
      const firstRowFirstCell = rows[0]?.[0] ?? ''
      const headerRows = firstRowFirstCell.includes('標題') ? 2 : 1
      const dataRows = rows.slice(headerRows)
      rawData.value = dataRows.map(parseStreamRow).filter((s) => s.streamTitle)

      fuse = new Fuse(rawData.value, {
        keys: ['streamTitle'],
        threshold: 0.4,
        includeScore: true,
      })
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      isLoading.value = false
    }
  }

  return {
    rawData,
    filteredData,
    isLoading,
    error,
    filters,
    searchQuery,
    availablePlatforms,
    availableYears,
    availableSources,
    activeChips,
    clearAllFilters,
    fetchAndParse,
  }
}
