<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ChevronDown } from '@lucide/vue'
import type { URLSource } from '../types'

const props = defineProps<{
  platforms: string[]
  years: string[]
  sources: URLSource[]
  selectedPlatforms: string[]
  selectedYears: string[]
  selectedSources: URLSource[]
  isPopular: boolean | null
  isCollab: boolean | null
  chips: { key: string; label: string }[]
}>()

const emit = defineEmits<{
  'update:selectedPlatforms': [value: string[]]
  'update:selectedYears': [value: string[]]
  'update:selectedSources': [value: URLSource[]]
  'update:isPopular': [value: boolean | null]
  'update:isCollab': [value: boolean | null]
  'removeChip': [key: string]
  'clearAll': []
}>()

const openDropdown = ref<string | null>(null)

function toggleDropdown(name: string) {
  openDropdown.value = openDropdown.value === name ? null : name
}

function closeDropdown() {
  openDropdown.value = null
}

const rootEl = ref<HTMLElement | null>(null)

function onDocumentClick(e: MouseEvent) {
  if (rootEl.value && !rootEl.value.contains(e.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))

function toggleMulti(
  current: string[],
  value: string,
  emitUpdate: (v: string[]) => void
) {
  if (value === '') {
    emitUpdate([])
  } else if (current.includes(value)) {
    emitUpdate(current.filter((x) => x !== value))
  } else {
    emitUpdate([...current, value])
  }
}

function toggleSource(
  current: URLSource[],
  value: URLSource | '',
  emitUpdate: (v: URLSource[]) => void
) {
  if (value === '') {
    emitUpdate([])
  } else if (current.includes(value)) {
    emitUpdate(current.filter((x) => x !== value))
  } else {
    emitUpdate([...current, value])
  }
}

function sourceLabel(s: URLSource): string {
  if (s === 'youtube') return 'YouTube'
  if (s === 'twitch') return 'Twitch'
  return s
}

const platformLabel = computed(() =>
  props.selectedPlatforms.length
    ? `部分主機平臺 (${props.selectedPlatforms.length})`
    : '全部主機平臺'
)

const sourceLabelDrop = computed(() =>
  props.selectedSources.length
    ? `部分直播平臺 (${props.selectedSources.length})`
    : '全部直播平臺'
)

const yearLabel = computed(() =>
  props.selectedYears.length
    ? `部分年份 (${props.selectedYears.length})`
    : '全部年份'
)

const dropdownBaseClass =
  'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition'
const dropdownStateClass = (open: boolean) =>
  open
    ? 'border-indigo-400 text-indigo-700 bg-indigo-50'
    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
const panelClass =
  'absolute z-10 mt-1 max-h-60 min-w-44 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg'
</script>

<template>
  <div ref="rootEl" class="space-y-3">
    <div class="flex flex-wrap gap-3">
      <div class="relative">
        <button
          :class="[dropdownBaseClass, dropdownStateClass(openDropdown === 'platform')]"
          @click="toggleDropdown('platform')"
        >
          {{ platformLabel }}
          <ChevronDown class="h-4 w-4" />
        </button>
        <div
          v-show="openDropdown === 'platform'"
          :class="panelClass"
        >
          <label
            v-for="p in platforms"
            :key="p"
            class="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <input
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              :checked="selectedPlatforms.includes(p)"
              @change="toggleMulti(selectedPlatforms, p, (v) => emit('update:selectedPlatforms', v))"
            >
            {{ p }}
          </label>
        </div>
      </div>

      <div class="relative">
        <button
          :class="[dropdownBaseClass, dropdownStateClass(openDropdown === 'source')]"
          @click="toggleDropdown('source')"
        >
          {{ sourceLabelDrop }}
          <ChevronDown class="h-4 w-4" />
        </button>
        <div
          v-show="openDropdown === 'source'"
          :class="panelClass"
        >
          <label
            v-for="s in sources"
            :key="s"
            class="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <input
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              :checked="selectedSources.includes(s)"
              @change="toggleSource(selectedSources, s, (v) => emit('update:selectedSources', v))"
            >
            {{ sourceLabel(s) }}
          </label>
        </div>
      </div>

      <div class="relative">
        <button
          :class="[dropdownBaseClass, dropdownStateClass(openDropdown === 'year')]"
          @click="toggleDropdown('year')"
        >
          {{ yearLabel }}
          <ChevronDown class="h-4 w-4" />
        </button>
        <div
          v-show="openDropdown === 'year'"
          :class="panelClass"
        >
          <label
            v-for="y in years"
            :key="y"
            class="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <input
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              :checked="selectedYears.includes(y)"
              @change="toggleMulti(selectedYears, y, (v) => emit('update:selectedYears', v))"
            >
            {{ y }}
          </label>
        </div>
      </div>

      <button
        class="rounded-lg border px-3 py-2 text-sm font-medium transition"
        :class="
          isPopular === true
            ? 'border-rose-300 bg-rose-100 text-rose-700'
            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
        "
        @click="emit('update:isPopular', isPopular === true ? null : true)"
      >
        🔥 紅的
      </button>

      <button
        class="rounded-lg border px-3 py-2 text-sm font-medium transition"
        :class="
          isCollab === true
            ? 'border-sky-300 bg-sky-100 text-sky-700'
            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
        "
        @click="emit('update:isCollab', isCollab === true ? null : true)"
      >
        🤝 聯動
      </button>
    </div>

    <div v-if="chips.length > 0" class="flex flex-wrap items-center gap-2">
      <span
        v-for="chip in chips"
        :key="chip.key"
        class="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700"
      >
        {{ chip.label }}
        <button
          class="ml-0.5 rounded-full p-0.5 hover:bg-indigo-200"
          @click="emit('removeChip', chip.key)"
        >
          <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </span>
      <button
        class="text-xs text-gray-400 underline transition hover:text-gray-600"
        @click="emit('clearAll')"
      >
        全部清除
      </button>
    </div>
  </div>
</template>