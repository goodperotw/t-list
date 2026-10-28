<script setup lang="ts">
import type { Stream, StreamURL } from '../types'
import { ExternalLink } from '@lucide/vue'

const props = defineProps<{ stream: Stream }>()

function sourceLabel(source: string): string {
  if (source === 'youtube') return 'YouTube'
  if (source === 'twitch') return 'Twitch'
  return source
}

function sourceColor(source: string): string {
  if (source === 'youtube') return 'bg-red-100 text-red-700'
  if (source === 'twitch') return 'bg-purple-100 text-purple-700'
  return 'bg-gray-100 text-gray-700'
}

function typeColor(type: string): string {
  if (type === '實況存檔') return 'bg-blue-100 text-blue-700'
  if (type === '實況影片') return 'bg-green-100 text-green-700'
  if (type === '實況清單') return 'bg-amber-100 text-amber-700'
  return 'bg-gray-100 text-gray-500'
}
function thumbnail(urls: StreamURL[]): string | undefined {
  // twitch thumbnail can't be inferenced by url, only youtube offered here
  const firstYoutubeUrl = urls.find(url => url.url.includes('youtu'))?.url
  if (!firstYoutubeUrl) return undefined

  const youtubeVideoIdPattern = '[0-9a-zA-Z_-]+'
  let youtubeVideoID
  if (/youtu\.be/.test(firstYoutubeUrl)) {
    // it might be youtube short firstYoutubeUrl
    const shortUrlPattern = new RegExp(`(?<=be\/)${youtubeVideoIdPattern}`)
    youtubeVideoID = firstYoutubeUrl.match(shortUrlPattern)?.[0]
  } else if (/\/live\//.test(firstYoutubeUrl)) {
    // it might be youtube live vod
    const liveUrlPattern = new RegExp(`(?<=live\/)${youtubeVideoIdPattern}`)
    youtubeVideoID = firstYoutubeUrl.match(liveUrlPattern)?.[0]
  } else if (/youtube\.com/.test(firstYoutubeUrl)) {
    // check if that's youtube standard video url
    const longUrlPattern = new RegExp(`(?<=v=)${youtubeVideoIdPattern}`)
    youtubeVideoID = firstYoutubeUrl.match(longUrlPattern)?.[0]
  }

  return youtubeVideoID ? `https://i.ytimg.com/vi/${youtubeVideoID}/hqdefault.jpg` : undefined
}
</script>


<template>
  <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
    <h2 class="mb-2 text-lg font-bold text-gray-900 leading-snug">
      {{ stream.streamTitle }}
    </h2>

    <div class="mb-3 flex flex-wrap items-center gap-2 text-sm">
      <span class="rounded-full bg-gray-100 px-2.5 py-0.5 font-medium text-gray-700 cursor-default select-none">
        {{ stream.platform }}
      </span>
      <span class="rounded-full bg-gray-100 px-2.5 py-0.5 font-medium text-gray-700 cursor-default select-none">
        {{ stream.streamedAt }}
      </span>
      <span
        v-if="stream.isPopular"
        class="rounded-full bg-rose-100 px-2.5 py-0.5 font-medium text-rose-700 cursor-default select-none"
      >
        🔥 人氣
      </span>
      <span
        v-if="stream.isCollab"
        class="rounded-full bg-sky-100 px-2.5 py-0.5 font-medium text-sky-700 cursor-default select-none"
      >
        🤝 聯動
      </span>
    </div>

    <div v-if="stream.urls.length" class="flex flex-col gap-1.5">
      <img v-if="thumbnail(stream.urls)" :src="thumbnail(stream.urls)">
      <a
        v-for="(u, i) in stream.urls"
        :key="i"
        :href="u.url"
        target="_blank"
        rel="noopener noreferrer"
        class="group flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm transition hover:border-gray-200 hover:bg-gray-100"
      >
        <span
          :class="sourceColor(u.source)"
          class="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
        >
          {{ sourceLabel(u.source) }}
        </span>
        <span
          :class="typeColor(u.type)"
          class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
        >
          {{ u.type }}
        </span>
        <span class="truncate text-gray-600 group-hover:text-gray-900">
          {{ u.title !== u.type ? u.title : '' }}
        </span>
        <ExternalLink class="ml-auto size-4 shrink-0 text-gray-400 group-hover:text-gray-600" />
      </a>
    </div>
    <p v-else class="text-sm text-gray-400">無連結</p>
  </div>
</template>
