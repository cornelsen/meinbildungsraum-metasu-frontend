<script setup>
import { shallowRef, ref, reactive, onBeforeMount, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import Button from '@/components/Button/Button.vue'
import AdvanceSearch from '@/components/Search/AdvanceSearch.vue'
import SearchResults from '@/components/Search/SearchResults.vue'
import SimpleSearch from '@/components/Search/SimpleSearch.vue'
import Filters from '@/components/Search/Filters.vue'
import Loader from '@/components/Loader/Loader.vue'
import * as SearchStore from '@/stores/search'
import { fetchResults } from '@/components/Search/commons/Search.helper'
import { getFiltersDataState } from '@/stores/filters'
import { addSubjectAsLastUsed } from '@/stores/lastVisited'
import { scrollTo } from '@/helpers/ui'


const ERROR_TYPES = {'FETCHING_ERROR': 0, 'SEACH_ERROR': 1}

const emit = defineEmits(['searchInProgress'])
defineProps({
  materialPreview: {},
})

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const { mdAndUp } = useDisplay()
const activeComponent = shallowRef(SimpleSearch)
const searchInProgress = ref(false) // Mode not fetching
const fetchingResults = ref(false) // Fetching results, show loader
const loadingData = ref(false)
const error = ref(false)
const errorType = ref('')
const subjectRequiredError = ref(false)
const refreshButton = ref(null)

const { createDefault, copySearchStateValues, setFilterState, resetSearchControl, getErrorParams } = SearchStore

const rawSearchResults = reactive({mostRelevant: {}, related: {}})

const formData = reactive(createDefault())
const filtersData = reactive(createDefault())
const formItems = reactive(createDefault())

watch(() => locale.value, () => {
  formItems.subject = mapSubjects(getFiltersDataState().rawSubjects)
  formItems.mediaType = mapFilter(getFiltersDataState().rawMediaTypes, 'mediaTypes')
  formItems.schoolType = mapFilter(getFiltersDataState().rawSchoolTypes, 'schoolTypes')
  formItems.studyYear = mapFilter(getFiltersDataState().rawStudyYears, 'studyYears')
  formItems.learningResourceType = mapFilter(getFiltersDataState().rawLearningResourceTypes, 'learningResourceTypes')
  formItems.federalState = mapFilter(getFiltersDataState().rawFederalStates, 'federalStates')
  formItems.grade = mapFilter(getFiltersDataState().rawGrades, 'grades')
  formItems.differentiation = mapFilter(getFiltersDataState().rawDifferentiations, 'differentiations'),
  formItems.schoolBook = mapFilter(getFiltersDataState().rawSchoolBooks, 'schoolBooks'),
  formItems.publisher = mapPublishers(getFiltersDataState().rawPublishers)
})

watch(formData, () => {
  if(error.value && errorType.value === ERROR_TYPES.SEACH_ERROR) {
    error.value = false
  }
})

watch(() => formData.subject, () => {
  if (formData.subject.length) {
    subjectRequiredError.value = false
  }
})

const loadData = async () => {
  loadingData.value = true
  error.value = false
  try {
    const data = getFiltersDataState()
    formItems.subject = mapSubjects(data.rawSubjects)
    formItems.mediaType = mapFilter(data.rawMediaTypes, 'mediaTypes')
    formItems.schoolType = mapFilter(data.rawSchoolTypes, 'schoolTypes')
    formItems.studyYear = mapFilter(data.rawStudyYears, 'studyYears')
    formItems.learningResourceType = mapFilter(data.rawLearningResourceTypes, 'learningResourceTypes')
    formItems.federalState = mapFilter(data.rawFederalStates, 'federalStates')
    formItems.grade = mapFilter(getFiltersDataState().rawGrades, 'grades')
    formItems.differentiation = mapFilter(getFiltersDataState().rawDifferentiations, 'differentiations'),
    formItems.schoolBook = mapFilter(getFiltersDataState().rawSchoolBooks, 'schoolBooks'),
    formItems.publisher = mapPublishers(getFiltersDataState().rawPublishers)

    mapFormQueryParameters()
  } catch (e) {
    error.value = true
    errorType.value = ERROR_TYPES.FETCHING_ERROR
    nextTick(focusOnError)
    console.log('error %o', e)
  }
  loadingData.value = false
}

const mapFormQueryParameters = () => {
  // subjects
  if (route.query.subject) {
    if(Array.isArray(route.query.subject)) {
      formData.subject = (formItems.subject.filter(
        value => route.query.subject.includes(value.key))|| []
      ).map(el => el.key)
    } else {
      formData.subject = (formItems.subject.filter(
        value => value.key === route.query.subject) || []
      ).map(el => el.key)
    }
  }
  // search
  if (route.query.search) {
    formData.search = route.query.search
  }
  // school type
  if (route.query.schoolType) {
    formData.schoolType = (formItems.schoolType.filter(
      value => value.key === route.query.schoolType) || []
    ).map(el => el.key)
  }
  // age range
  if (route.query.studyYear) {
    formData.studyYear = (formItems.studyYear.filter(
      value => value.key === route.query.studyYear) || []
    ).map(el => el.key)
  }
  // learning resource type
  if (route.query.learningResourceType) {
    formData.learningResourceType = (formItems.learningResourceType.filter(
      value => value.key === route.query.learningResourceType) || []
    ).map(el => el.key)
  }
  // media type (bubbles)
  if (route.query.mediaType) {
    if(Array.isArray(route.query.mediaType)) {
      formData.mediaType = (formItems.mediaType.filter(
        value => route.query.mediaType.includes(value.key))|| []
      ).map(el => el.key)
    } else {
      formData.mediaType = (formItems.mediaType.filter(
        value => value.key === route.query.mediaType) || []
      ).map(el => el.key)
    }
  }

  if (formData.subject.length) {
    doNewSearch()
  }
}
const mapSubjects = (subjects) => {
  const filteredSubjects = []
  for(let i = 0; i < subjects.length; i += 1) {
    filteredSubjects.push({
      header: true, label: t(`search.subjects.${subjects[i].label}`)
    })
    filteredSubjects.push(...mapFilter(subjects[i].items, 'subjects'))
  }
  return filteredSubjects
}

const mapFilter = (lrt, key) => {
  return lrt.map(el => ({
    key: el,
    label: t(`search.${key}.${el}`)
  }))
}

const mapPublishers = (pub) => {
  return pub.map(el => ({
    key: el.id,
    label: el.title
  }))
}

const doSearch = async (filterParams) => {
  if (formData.subject.length === 0 && filterParams === undefined) {
    subjectRequiredError.value = true
    scrollTo('.search-container', !mdAndUp.value)
    return
  }
  subjectRequiredError.value = false
  emit('searchInProgress', true)
  error.value = false
  searchInProgress.value = true
  const params = getSearchParams(filterParams)
  try {
    const data = await fetchResults(params)
    rawSearchResults.mostRelevant = data.mostRelevant
    rawSearchResults.related = data.related
  } catch (e) {
    error.value = true
    nextTick(focusOnError)
    errorType.value = ERROR_TYPES.SEACH_ERROR
    console.log('error %o', e)
  }
  scrollTo('.progress-bar', !mdAndUp.value)
}

const getSearchParams = (filterParams) => {
  if (filterParams) {
    return filterParams
  } else {
    let params = {...createDefault(),
      subject: formData.subject,
      search: formData.search
    }
    if (activeComponent.value === AdvanceSearch) {
      copySearchStateValues(params, formData)
    } else {
      copySearchStateValues(formData, params)
    }
    for(let i = 0 ; i < params.subject.length; i += 1) {
      let foundSubject = formItems.subject.find(el => el.key === params.subject[i])
      if (foundSubject) addSubjectAsLastUsed({...foundSubject, lastUsed: true})
    }
    return params
  }
}

const doFilterSearch = async (data)  => {
  showLoader()
  await doSearch(data)
  hideLoader()
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

const doSearchAfterError = async () => {
  showLoader()
  await doSearch(getErrorParams())
  if (!searchInProgress.value) {
    setFilterState(formData)
    copySearchStateValues(filtersData, formData)
  }
  hideLoader()
}

onBeforeMount(() => {
  resetSearchControl()
  parseQueryParameters()
  loadData()
})

const parseQueryParameters = () => {
  if (route.query.adv === '1') {
    activeComponent.value = AdvanceSearch
  }
}

watch(() => route.query, () => {
  if (Object.keys(route.query).length === 0) {
    resetSearchControl()
    emit('searchInProgress', false)
    searchInProgress.value = false
    copySearchStateValues(formData, createDefault())
    copySearchStateValues(filtersData, createDefault())
    activeComponent.value = SimpleSearch
    error.value = false
  }
})

const changeSearch = (type) => {
  activeComponent.value = type === 'stdSearch' ? AdvanceSearch : SimpleSearch
  if (type==='stdSearch') {
    router.replace({ query: {...route.query, adv: 1 }})
  } else {
    router.replace({ query: {...route.query, adv: 0 }})
  }
}

const showLoader = () => {
  fetchingResults.value = true
}

const hideLoader = () => {
  fetchingResults.value = false
}

const focusOnError = () => {
  if (refreshButton.value?.$el) {
    refreshButton.value?.$el.focus()
  }
}

</script>

<template>
  <div>
    <v-snackbar
        v-model="error"
        multi-line
        location="top"
        position="sticky"
        variant="flat"
        color="#D4323C"
        timeout="-1"
      >
      <div class="font-type-b5" aria-live="assertive">
        {{ $t('errors.engine') }}
      </div>

      <template v-slot:actions>
        <Button
            ref="refreshButton"
            @click="errorType === ERROR_TYPES.FETCHING_ERROR ?
              loadData() : doSearchAfterError()"
            :text="$t('errors.refresh')"
            variant="black"
            compact
        />
      </template>
    </v-snackbar>

    <div class="search-container">
      <div class="limited-width ">
        <Transition class="search-slider" name="search" mode="out-in">
          <component
            :is="activeComponent"
            :searchInProgress="searchInProgress"
            :subjectRequiredError="subjectRequiredError"
            :loading="loadingData"
            v-model="formData"
            :formItems="formItems"
            @changeSearch="changeSearch"
            @search="doNewSearch"/>
        </Transition>
      </div>
    </div>
    <!-- PROGRESS BAR-->
    <Loader v-if="fetchingResults"/>
    <Filters
      v-if="searchInProgress"
      :formItems="formItems"
      :pFormData="filtersData"
      :searchStore="SearchStore"
      @filterSearch="doFilterSearch"
    />
    <div class="limited-width">
      <SearchResults
        v-if="searchInProgress"
        :rawResults="rawSearchResults"
        :searchStore="SearchStore"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>

  .search-container {
    width: 100%;
    min-height: 400px;
    width: 100%;
    overflow: auto;
    background: $color-primary-100;
    border-top: 1px solid $color-primary-80;

    @media (max-width: $MAX-WIDTH-MOBILE) {
      border-top: none;
      min-height: auto;
    }
  }

  @media (min-width: $MAX-WIDTH-PC) {
    :deep(.search-filters) {
      margin: 44px 48px 16px 48px;
    }
  }

</style>
