<script setup lang="ts">
import { onMounted } from 'vue'
import SearchBar from './components/SearchBar.vue'
import FilterBar from './components/FilterBar.vue'
import StreamCard from './components/StreamCard.vue'
import { useStreamData } from './composables/useStreamData'
import type { URLSource } from './types'

const {
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
} = useStreamData()

onMounted(fetchAndParse)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="border-b border-gray-200 bg-white">
      <div class="mx-auto max-w-6xl px-4 py-6">
        <h1 class="mb-5 text-2xl font-bold text-gray-900">直播清單</h1>

        <div class="flex flex-col gap-4">
          <SearchBar v-model:query="searchQuery" />
          <FilterBar
            :platforms="availablePlatforms"
            :years="availableYears"
            :sources="availableSources"
            :selected-platforms="filters.platforms"
            :selected-years="filters.years"
            :selected-sources="filters.sources"
            :is-popular="filters.isPopular"
            :is-collab="filters.isCollab"
            :chips="activeChips"
            @update:selected-platforms="(v: string[]) => (filters.platforms = v)"
            @update:selected-years="(v: string[]) => (filters.years = v)"
            @update:selected-sources="(v: URLSource[]) => (filters.sources = v)"
            @update:is-popular="(v: boolean | null) => (filters.isPopular = v)"
            @update:is-collab="(v: boolean | null) => (filters.isCollab = v)"
            @remove-chip="(key: string) => {
              const chip = activeChips.find((c) => c.key === key)
              chip?.clear()
            }"
            @clear-all="clearAllFilters"
          />
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-8">
      <p v-if="isLoading" class="text-center text-gray-500">載入中...</p>

      <div
        v-else-if="error"
        class="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-700"
      >
        載入失敗：{{ error }}
      </div>

      <template v-else>
        <p class="mb-4 text-sm text-gray-500">
          共 {{ filteredData.length }} 筆
        </p>

        <TransitionGroup
          v-if="filteredData.length"
          tag="div"
          name="card"
          class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <StreamCard
            v-for="stream in filteredData"
            :key="stream.streamTitle + stream.streamedAt"
            :stream="stream"
          />
        </TransitionGroup>

        <Transition
          v-else
          name="fade"
          appear
        >
          <div
            class="rounded-xl border border-dashed border-gray-300 p-16 text-center text-gray-400"
          >
            沒有符合條件的直播
          </div>
        </Transition>
      </template>
    </main>
  </div>
</template>
