<script setup>
import {  ref, reactive, watch, watchEffect } from 'vue'
import { useDisplay } from 'vuetify'
import { scrollTo } from '@/helpers/ui'
import IconLink from '@/components/IconLink/IconLink.vue'
import Pagination from '@/components/Pagination/Pagination.vue'
import ResultCarusel from '@/components/Search/Results/ResultCarusel.vue'
import ResultGrid from '@/components/Search/Results/ResultGrid.vue'
import { PAGE_SIZE, mapRawSearchData } from '@/components/Search/commons/Search.helper'

const props = defineProps({
  rawResults: { type: Object, default: () => {} },
  searchStore: {type: Object}
})

// eslint-disable-next-line vue/no-setup-props-destructure
const { getSearchControlState, showMoreTypes, setFilterState } = props.searchStore

const { mdAndUp } = useDisplay()
const { mode } = getSearchControlState()
const maxPages = ref(0)
const pageVal = ref(1)

watch(pageVal, () => {
  setFilterState({page: pageVal})
})

const showMore = reactive({ data: [], all: 0})
const mostRelevant = ref([])
const mostRelevantAll = ref(0)
const related = ref([])
const relatedAll = ref(0)

const showMoreClick = (type) => {
  mode.value = type
  showMore.data = type === showMoreTypes.RELEVANT ? [...mostRelevant.value] : [...related.value]
  showMore.all = type === showMoreTypes.RELEVANT ? mostRelevantAll.value : relatedAll.value
  maxPages.value = showMore.all ? Math.ceil(showMore.all / PAGE_SIZE) : 0
  scrollTo('.search-results', !mdAndUp.value)
}

watchEffect(() => {
  // TODO
  mostRelevant.value = mapRawSearchData(props.rawResults.mostRelevant?.content || [])
  mostRelevantAll.value =  props.rawResults.mostRelevant?.totalElements || 0
  related.value = mapRawSearchData(props.rawResults.related?.content || [])
  relatedAll.value =  props.rawResults.related?.totalElements || 0
  if (mode !== showMoreTypes.NONE) {
    // TODO
    showMore.data = mode.value === showMoreTypes.RELEVANT ? [...mostRelevant.value] : [...related.value]
    showMore.all = mode.value === showMoreTypes.RELEVANT ? mostRelevantAll.value : relatedAll.value
    maxPages.value = showMore.all ? Math.ceil(showMore.all / PAGE_SIZE) : 0
  }
})

</script>

<template>
  <div>
    <div class="search-results">
      <template v-if="mode === showMoreTypes.NONE">
        <!-- MOST RELEVANT -->
        <div class="mb-md-80 mt-md-80 mt-6 mb-8">
          <div class="flex flex-wrap justify-space-between align-end mb-6 mb-md-16">
            <div aria-live="polite">
              <h2
                class="header-md-6 header-sm-2 color-black d-block d-md-inline-block"
              >
                {{ $t('search.mostRelevant') }}
              </h2>
              <div
                class="header-md-7 font-type-sm-b2 color-grey-4 ml-0 ml-md-4 d-block d-md-inline-block"
              >
                {{ mostRelevantAll }} {{ $t('search.results') }}
              </div>
            </div>
            <IconLink
              class="align-self-start align-self-md-auto uppercase"
              v-if="related.length"
              icon="right"
              @click="() => showMoreClick(showMoreTypes.RELEVANT)"
            >
              {{ $t('search.showMore') }}
            </IconLink>
          </div>

          <ResultGrid
            :items="mostRelevant.length > 8 ? mostRelevant.slice(0, 8) : mostRelevant"
          />
        </div>
        <!-- RELATED -->
        <div class="mt-md-80 mb-md-160 mt-6 mb-8">
          <div class="flex flex-wrap justify-space-between align-end mb-6 mb-md-16">
            <div aria-live="polite">
              <h2
                class="header-md-6 header-sm-2 color-black d-block d-md-inline-block"
              >
                {{ $t('search.related') }}
              </h2>
              <div
                class="header-md-7 font-type-sm-b2 color-grey-4 ml-0 ml-md-4 d-block d-md-inline-block"
              >
                {{ relatedAll }}
                {{ relatedAll === 1 ? $t('search.result') : $t('search.results') }}
              </div>
            </div>

            <IconLink
              v-if="related.length"
              class="align-self-start align-self-md-auto uppercase"
              icon="right"
              @click="() => showMoreClick(showMoreTypes.RELATED)"
            >
              {{ $t('search.showMore') }}
            </IconLink>
          </div>

          <ResultCarusel :items="related"/>
        </div>

      </template>

      <!-- VIEW WITH PAGINATION -->
      <div v-else>
        <div>
          <div aria-live="polite" class="mb-9 mt-8">
            <h2 class="header-md-6 header-sm-2 color-black d-block d-md-inline-block">
              {{ mode === showMoreTypes.RELEVANT ? $t('search.mostRelevant') : $t('search.related')}}
            </h2>
            <span class="header-md-7 font-type-sm-b2 color-grey-4 ml-0 ml-md-4 d-block d-md-inline-block">
              {{ showMore.all !== 0 ? pageVal * PAGE_SIZE - PAGE_SIZE + 1 : 0}}-{{  pageVal * PAGE_SIZE > showMore.all ? showMore.all : pageVal * PAGE_SIZE }}
              {{ $t('search.of') }} {{ showMore.all }}  {{ $t('search.results') }}
            </span>
          </div>
        </div>

        <ResultGrid
          :items="showMore.data"
        />
        <div v-if="showMore.data?.length">
          <Pagination v-model="pageVal" :maxPages="maxPages"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .search-results {
    margin: 4px 48px 0 48px;
    display: flex;
    flex-direction: column;
  }

  @media (max-width: $MAX-WIDTH-MOBILE) {
    .search-results {
      margin: 0 16px;
      display: flex;
      flex-direction: column;
    }
  }
</style>
