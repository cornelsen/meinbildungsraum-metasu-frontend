import { reactive } from 'vue'
import { service } from '@/helpers/api'

export const createDefaultFiltersData = () => ({
  rawSubjects: [],
  rawMediaTypes: [],
  rawSchoolTypes: [],
  rawStudyYears: [],
  rawLearningResourceTypes: [],
  rawPublishers: [],
  rawFederalStates: [],
  fetched: false
})

export const DEFAULT_FILTERS_STATE = {
  ...createDefaultFiltersData()
}

const stateFilters = reactive({...DEFAULT_FILTERS_STATE})

export const fetchFiltersDataState = async () => {
  if (stateFilters.fetched) {
    return stateFilters
  } else {
    const { data } = await service.get('/filters')
    stateFilters.rawSubjects = data.subjects
    stateFilters.rawMediaTypes = data.mediaTypes
    stateFilters.rawSchoolTypes = data.schoolTypes
    stateFilters.rawStudyYears = data.studyYears
    stateFilters.rawLearningResourceTypes = data.learningResourceTypes
    stateFilters.rawPublishers = data.publishers
    stateFilters.rawFederalStates = data.federalStates
    stateFilters.rawGrades = data.grades
    stateFilters.rawDifferentiations = data.differentiations
    stateFilters.rawSchoolBooks = data.schoolBooks
    if (data.subjects.length) stateFilters.fetched = true
    return stateFilters
  }
}

export const getFiltersDataState = () => {
  return stateFilters
}
