<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { scrollTo } from '@/helpers/ui'
import { fetch, getPublisherById } from '@/components/Search/commons/Search.helper'
import { getFiltersDataState } from '@/stores/filters'
import Select from '@/components/Forms/Select.vue'
import InputText from '@/components/Forms/InputText.vue'
import SearchIcon from '@/assets/icons/Search.svg'
import Button from '@/components/Button/Button.vue'
import SearchResults from '@/components/Search/SearchResults.vue'
import Filters from '@/components/Search/Filters.vue'
import Loader from '@/components/Loader/Loader.vue'
import * as PublisherStore from '@/stores/publisherSearch'
import HistoryCrumb from '@/components/HistoryCrumb/HistoryCrumb.vue'

const ERROR_TYPES = {'FETCHING_ERROR': 0, 'SEACH_ERROR': 1}

const props = defineProps({
  publisherId: { type: String }
})
const router = useRouter()
const publisher = getPublisherById(props.publisherId)
const { mdAndUp } = useDisplay()

if (!publisher) {
  router.push('/')
}

const { t, locale } = useI18n()
const searchInProgress = ref(false) // Mode not fetching
const fetchingResults = ref(false) // Fetching results, show loader
const error = ref(false)
const errorType = ref('')
const rawSearchResults = reactive({mostRelevant: {}, related: {}})

const {
  createDefault, showMoreTypes, copySearchStateValues,
  getSearchControlState, setFilterState, resetSearchControl, getErrorParams, setErrorParams } = PublisherStore


const mapFilter = (lrt, key) => {
  return lrt.map(el => ({
    key: el,
    label: t(`search.${key}.${el}`)
  }))
}

const mapPublishers = (pub) => pub.map(el => ({ key: el.id, label: el.title }))

const formData = reactive(createDefault())
const filtersData = reactive(createDefault())
const formItems = reactive({
  schoolType: mapFilter(getFiltersDataState().rawSchoolTypes, 'schoolTypes'),
  studyYear: mapFilter(getFiltersDataState().rawStudyYears, 'studyYears'),
  learningResourceType: mapFilter(getFiltersDataState().rawLearningResourceTypes, 'learningResourceTypes'),
  federalState: mapFilter(getFiltersDataState().rawFederalStates, 'federalStates'),
  grade: mapFilter(getFiltersDataState().rawGrades, 'grades'),
  differentiation: mapFilter(getFiltersDataState().rawDifferentiations, 'differentiations'),
  schoolBook: mapFilter(getFiltersDataState().rawSchoolBooks, 'schoolBooks'),
  publisher: mapPublishers(getFiltersDataState().rawPublishers)
})

watch(() => locale.value, () => {
  formItems.schoolType = mapFilter(getFiltersDataState().rawSchoolTypes, 'schoolTypes')
  formItems.studyYear = mapFilter(getFiltersDataState().rawStudyYears, 'studyYears')
  formItems.learningResourceType = mapFilter(getFiltersDataState().rawLearningResourceTypes, 'learningResourceTypes')
  formItems.federalState = mapFilter(getFiltersDataState().rawFederalStates, 'federalStates')
  formItems.grade = mapFilter(getFiltersDataState().rawGrades, 'grades')
  formItems.differentiation = mapFilter(getFiltersDataState().rawDifferentiations, 'differentiations'),
  formItems.schoolBook = mapFilter(getFiltersDataState().rawSchoolBooks, 'schoolBooks'),
  formItems.publisher = mapPublishers(getFiltersDataState().rawPublishers)
})

const sortBy = computed(() => ([
  { key: 'name-asc', label: t('search.filters.sortTypes.alphabetic') },
  { key: 'relevance-desc', label: t('search.filters.sortTypes.mostViewed') },
  { key: 'publishDate-desc', label: t('search.filters.sortTypes.newest') },
  { key: 'publishDate-asc', label: t('search.filters.sortTypes.oldest') }
]))

watch(formData, () => {
  if(error.value && errorType.value === ERROR_TYPES.SEACH_ERROR) {
    error.value = false
  }
})

watch(() => formData.search, () => {
  debounceSearch()
})

watch(() => formData.sortType, () => {
  doNewSearch()
})

const mapSubjects = (subjects) => {
  const filteredSubjects = []
  for(let i = 0; i < subjects.length; i += 1) {
    filteredSubjects.push(...subjects[i].items)
  }
  return filteredSubjects
}

const doSearch = async (filterParams) => {
  searchInProgress.value = true
  error.value = false
  const subject = mapSubjects(getFiltersDataState().rawSubjects)
  const { mode } = getSearchControlState()

  const params = filterParams ? {...filterParams, subject, publisher: [publisher.id] } : {
    ...formData,
    subject: subject,
    publisher: [ props.publisherId ]
  }
  try {
    if (mode.value === showMoreTypes.RELATED || mode.value === showMoreTypes.NONE ) {
      rawSearchResults.related = await fetch(params, 'related')
    }
    if (mode.value === showMoreTypes.RELEVANT || mode.value === showMoreTypes.NONE ) {
      rawSearchResults.mostRelevant = await fetch(params, 'most-relevant')
    }
  } catch (e) {
    error.value = true
    errorType.value = ERROR_TYPES.SEACH_ERROR
    setErrorParams(params)
    console.log('error %o', e)
  }
  scrollTo('.progress-bar', !mdAndUp.value)
}

let searchDebounceTimer
const debounceSearch = () => {
  if(searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  searchDebounceTimer = setTimeout(() => {
    doNewSearch()
  }, 1000)
}

const doNewSearch = async () => {
  resetSearchControl()
  showLoader()
  formData.page = 1
  await doSearch()
  setFilterState(formData)
  copySearchStateValues(filtersData, formData)
  hideLoader()
}

const doFilterSearch = async (data) => {
  showLoader()
  await doSearch(data)
  hideLoader()
}

const doSearchAfterError = async () => {
  showLoader()
  await doSearch(getErrorParams())
  if (!searchInProgress.value) {
    setFilterState(formData)
    copySearchStateValues(filtersData, formData)
  }
  hideLoader()
}

onMounted(() => {
  if (publisher) {
    doNewSearch()
  }
})

const showLoader = () => {
  fetchingResults.value = true
}

const hideLoader = () => {
  fetchingResults.value = false
}

</script>

<template>
  <div v-if="publisher">
    <v-snackbar
        v-model="error" multi-line
        location="top"
        position="fixed"
        variant="flat"
        color="#D4323C"
        timeout="-1"
      >
      <div class="font-type-b5">
        {{ $t('errors.engine') }}
      </div>

      <template v-slot:actions>
        <Button
            @click="doSearchAfterError"
            :text="$t('errors.refresh')"
            variant="black"
            compact
        />
      </template>
    </v-snackbar>
    <!-- PROGRESS BAR-->
    <Loader v-if="fetchingResults"/>
    <div class="publisher-search limited-width pl-4 pr-4 pl-md-12 pr-md-12 w-100 pt-8 pt-md-0">
      <HistoryCrumb :variant="mdAndUp ? 'black' : 'white'"/>

      <!-- PC -->
      <template v-if="mdAndUp">
        <div class="flex flex-wrap justify-space-between align-center mt-12">
          <h2 class="header-6 color-black align-self-center">
            {{ $t("publisher.search.allAvMaterialsBy") }} {{ publisher.title }}
          </h2>
          <div class="mb-4">
            <v-form
              @submit.prevent="doNewSearch"
              class="flex flex-wrap form-container"
              :class="{ 'flex-row': searchInProgress }"
            >
              <div class="form-input">
                <v-text-field
                  class="input input-search"
                  :placeholder="$t('search.searchPlaceholder')"
                  :items="[]"
                  v-model="formData.search"
                  :append-inner-icon="SearchIcon"
                  variant="underlined"
                  density="default"
                  hide-details
                  persistent-placeholder
                >
                <template v-slot:prepend>
                  <div class="color-black input-label">
                    {{ $t("search.search") }}:
                  </div>
                </template>
                </v-text-field>
              </div>
              <div class="sort-by flex ml-14">
                <div class="sort-by-label font-type-b5 color-black">
                  {{ $t('search.filters.sortBy') }}:
                </div>
                <Select
                  class="sort-by-select ml-4"
                  :items="sortBy"
                  noEmpty
                  :aria-label="$t('search.filters.sortBy')"
                  v-model="formData.sortType"/>
              </div>
              <v-btn class="d-none" type="submit"/>
            </v-form>
          </div>
        </div>
      </template>
      <template v-else>
        <v-form
          @submit.prevent="doNewSearch"
          class="flex flex-wrap form-container mt-4"
          :class="{ 'flex-row': searchInProgress }"
        >
          <div class="form-input w-100">
            <input-text
              :placeholder="$t('search.searchPlaceholder')"
              v-model="formData.search"
              :icon="SearchIcon"
              variant="underlined"
              density="default"
            />
          </div>
        </v-form>
      </template>
      <Filters
        v-if="searchInProgress && mdAndUp"
        :isPublisher="true"
        :formItems="formItems"
        :pFormData="filtersData"
        :searchStore="PublisherStore"
        @filterSearch="doFilterSearch"
      />
    </div>
    <Filters
        v-if="searchInProgress && !mdAndUp"
        :isPublisher="true"
        :formItems="formItems"
        :pFormData="filtersData"
        :searchStore="PublisherStore"
        @filterSearch="doFilterSearch"
      />
    <div class="limited-width">
      <SearchResults
        v-if="searchInProgress"
        :searchStore="PublisherStore"
        :rawResults="rawSearchResults"
        />
    </div>
  </div>
</template>

<style lang="scss" scoped>

  :deep(.search-filters) {
    margin-top: 44px;
    padding-bottom: 80px;
  }
  .sort-by {
    flex-shrink: 0;
    &-label {
      margin-top: 39px;
    }
    &-select {
      display: inline-block;
      min-width: 184px;
    }
  }

  .input-search {
    width: 359px;

    .input-label {
      margin-top: 18px;
    }
  }

  .search-leave-active,
  .search-enter-active {
    transition: opacity 0.2s ease;
  }

  .search-leave-to {
    opacity: 0;
  }

  @media (max-width: $MAX-WIDTH-MOBILE) {
    :deep(.search-filters) {
      padding-bottom: 0;
      margin-bottom: 0;
    }
    .publisher-search {
      padding: 32px 16px 16px 16px;
      background-color: $color-primary-100;

      .form-container {
        padding: 0 20px 20px 20px;
        background-color: #FFF;
      }
    }
  }
</style>
