<script setup>
import { ref, watch } from 'vue'
import { scrollTo } from '@/helpers/ui'
import { useDisplay } from 'vuetify'
import { PAGE_SIZE} from '@/components/Search/commons/Search.helper'
import Pagination from '@/components/Pagination/Pagination.vue'
import ResultCarusel from '@/components/Search/Results/ResultCarusel.vue'
import ResultGrid from '@/components/Search/Results/ResultGrid.vue'
import IconLink from '@/components/IconLink/IconLink.vue'
import { getAuthorizationData  } from '@/stores/authorization'
import { getLastViewedMaterials, getLastVisitedByPage, getTotalElements } from '@/stores/lastVisited'

const props = defineProps({
  materialToIgnore: {}
})

const { mdAndUp } = useDisplay()
const showMore = ref(false)
const allMaterials = ref([])
const totalElements = ref(0)
const page = ref(1)
const materials = ref([])

const init = async () => {
  if(getAuthorizationData().authorized.value) {
    await getLastVisitedByPage(0)
  }
  allMaterials.value = getLastViewedMaterials().value
  let indexFound = false
  if (props.materialToIgnore) {
    indexFound = allMaterials.value.findIndex(mat => mat.title === props.materialToIgnore.title)
    if (indexFound > -1) {
      allMaterials.value.splice(indexFound, 1)
    }
  }

  if(getAuthorizationData().authorized.value) {
    totalElements.value = indexFound ? getTotalElements().value - 1 : getTotalElements().value
  } else {
    totalElements.value  = allMaterials.value.length
  }
  if (totalElements.value < 0) totalElements.value = 0
  materials.value = allMaterials.value.slice(0, 8)
}

init()

watch(page, async () => {
  if(getAuthorizationData().authorized.value) {
    await getLastVisitedByPage(page.value - 1)
    materials.value = getLastViewedMaterials().value
  }
  else if (page.value === 1) {
    materials.value = allMaterials.value.slice(0, PAGE_SIZE - 1)
  } else {
    materials.value = allMaterials.value.slice(PAGE_SIZE * (page.value - 1), PAGE_SIZE * page.value)
  }

  scrollTo('.last-viewed-carusel', !mdAndUp.value)
})

watch(showMore, () => {
  materials.value = allMaterials.value.slice(0, PAGE_SIZE - 1)
})

watch(getAuthorizationData().authorized, () => {
  init()
})

</script>

<template>
  <div>
    <div class="flex flex-wrap justify-space-between align-end mb-6 mb-md-16">
      <div aria-live="polite" class="last-viewed-carusel">
        <h2
          class="header-md-6 header-sm-2 color-black d-block d-md-inline-block"
        >
            {{ $t('search.lastViewed') }}
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
        class="align-self-start uppercase"
        v-if="totalElements > 8 && showMore === false"
        icon="right"
        @click="() => showMore = true"
      >
        {{ $t('search.showMore') }}
      </IconLink>
    </div>

    <template v-if="showMore === false">
      <ResultCarusel :items="materials"/>
    </template>
    <template v-else>
      <ResultGrid
        :items="materials"
      />
      <div>
        <Pagination v-model="page" :maxPages="totalElements ? Math.ceil(totalElements / PAGE_SIZE) : 0"/>
      </div>

    </template>
  </div>
</template>

<style lang="scss">
</style>
