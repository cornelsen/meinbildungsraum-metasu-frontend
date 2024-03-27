<script setup>
import { ref, watch, onMounted } from 'vue'
import { scrollTo } from '@/helpers/ui'
import { useDisplay } from 'vuetify'
import Loader from '@/components/Loader/Loader.vue'
import { fetch, PAGE_SIZE, mapRawSearchData } from '@/components/Search/commons/Search.helper'
import Pagination from '@/components/Pagination/Pagination.vue'
import ResultCarusel from '@/components/Search/Results/ResultCarusel.vue'
import ResultGrid from '@/components/Search/Results/ResultGrid.vue'
import { getFiltersDataState } from '@/stores/filters'
import IconLink from '@/components/IconLink/IconLink.vue'

const props = defineProps({
  subjects: {type: Array, default: () => []},
  publisher: {type: Object, default: () => null}
})

const { mdAndUp } = useDisplay()
const fetchingResults = ref(false)
const items = ref([])
const showMore = ref(false)
const totalElements = ref(0)
const page = ref(1)

const mapSubjects = () => {
  const filteredSubjects = []
  for(let i = 0; i < props.subjects.length; i += 1) {
    for(let j = 0; j < getFiltersDataState().rawSubjects.length; j += 1) {
      const rawSubs = getFiltersDataState().rawSubjects[j].items
      const found = rawSubs.find(el => el.label === props.subjects[i])
      if (found) {
        filteredSubjects.push(found.key)
        break
      }
    }
  }
  return filteredSubjects
}

const doSearch = async () => {
  showLoader()
  const params = {
    subject: mapSubjects(), page: page.value, sortType: ['publishDate-desc'],
    publisher: props.publisher?.id ? [props.publisher.id ] : undefined
  }
  try {
    const response = await fetch(params, 'related')
    items.value = mapRawSearchData(response.content)
    totalElements.value = response.totalElements
  } catch (e) {
    console.log('error %o', e)
  }
  hideLoader()
}

onMounted(() => {
  doSearch()
})

const showLoader = () => {
  fetchingResults.value = true
}

const hideLoader = () => {
  fetchingResults.value = false
}

watch(page, () => {
  doSearch()
  scrollTo('.preview-carusel', !mdAndUp.value)
})
</script>

<template>
  <div>
    <div class="flex flex-wrap justify-space-between align-end mb-6 mb-md-16">
      <div aria-live="polite" class="preview-carusel">
        <h2
          class="header-md-6 header-sm-2 color-black d-block d-md-inline-block"
        >
          {{ $t('search.suggestions') }}
        </h2>
        <span
          v-if="showMore === false"
          class="header-md-7 font-type-sm-b2 color-grey-4 ml-0 ml-md-4 d-block d-md-inline-block"
        >
          {{ totalElements }}
          {{ totalElements === 1 ? $t('search.result') : $t('search.results') }}
        </span>
        <span
          v-else
          class="header-md-7 font-type-sm-b2 color-grey-4 ml-0 ml-md-4 d-block d-md-inline-block"
        >
          {{ totalElements !== 0 ? page * PAGE_SIZE - PAGE_SIZE + 1 : 0}}-{{  page * PAGE_SIZE > totalElements ? totalElements : page * PAGE_SIZE }}
          {{ $t('search.of') }} {{ totalElements }}  {{ $t('search.results') }}
        </span>
      </div>
      <IconLink
        v-if="items.length && showMore === false"
        class="align-self-start align-self-md-auto uppercase"
        icon="right"
        @click="() => showMore = true"
      >
        {{ $t('search.showMore') }}
      </IconLink>
    </div>
    <!-- PROGRESS BAR-->
    <Loader v-if="fetchingResults"/>

    <template v-if="showMore === false">
      <ResultCarusel :items="items"/>
    </template>
    <template v-else>
      <ResultGrid
        :items="items"
      />
      <div>
        <Pagination v-model="page" :maxPages="totalElements ? Math.ceil(totalElements / PAGE_SIZE) : 0"/>
      </div>

    </template>
  </div>
</template>

<style lang="scss">
</style>
