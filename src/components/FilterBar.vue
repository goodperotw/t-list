<script setup lang="ts">
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
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap gap-3">
      <select
        :value="selectedPlatforms.length ? selectedPlatforms[selectedPlatforms.length - 1] : ''"
        class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        @change="
          toggleMulti(
            selectedPlatforms,
            ($event.target as HTMLSelectElement).value,
            (v) => emit('update:selectedPlatforms', v)
          )
        ">
        <option value="">全部</option>
        <option v-for="p in platforms" :key="p" :value="p">{{ p }}</option>
      </select>

      <select
        :value="selectedSources.length ? selectedSources[selectedSources.length - 1] : ''"
        class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        @change="
          toggleSource(
            selectedSources,
            ($event.target as HTMLSelectElement).value as URLSource,
            (v) => emit('update:selectedSources', v)
          )
        ">
        <option value="">全部</option>
        <option v-for="s in sources" :key="s" :value="s">{{ sourceLabel(s) }}</option>
      </select>

      <select
        :value="selectedYears.length ? selectedYears[selectedYears.length - 1] : ''"
        class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        @change="
          toggleMulti(
            selectedYears,
            ($event.target as HTMLSelectElement).value,
            (v) => emit('update:selectedYears', v)
          )
        "
      >
        <option value="">全部</option>
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>

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
