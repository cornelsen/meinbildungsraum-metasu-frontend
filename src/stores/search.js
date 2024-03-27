import { reactive, toRefs } from 'vue'

export const showMoreTypes = {
  NONE: 0,
  RELEVANT: 1,
  RELATED: 2
}

const SEARCH_CONTROL_STATE = {
  mode: showMoreTypes.NONE
}

export const DEFAULT_SEARCH_STATE = {
  subject: [],
  mediaType: [],
  learningResourceType: [],
  schoolType: [],
  studyYear: [],
  publisher: [],
  federalState: [],
  grade: [],
  differentiation: [],
  schoolBook: [],
  search: '',
  sortType: ['publishDate-desc'],
  page: 1
}

export const createDefault = () => ({
  subject: [],
  mediaType: [],
  learningResourceType: [],
  schoolType: [],
  studyYear: [],
  publisher: [],
  federalState: [],
  grade: [],
  differentiation: [],
  schoolBook: [],
  search: '',
  sortType: ['publishDate-desc'],
  page: 1
})

const stateFilters = reactive({...DEFAULT_SEARCH_STATE})
const stateControl = reactive({...SEARCH_CONTROL_STATE})
const errorParams = {}

export const copySearchStateValues = (to, from) => {
  Object.assign(to, JSON.parse(JSON.stringify(from)))
}

export const setFilterState = (newState) => {
  Object.assign(stateFilters, {...newState})
}

export const setFilterMode = () => {
  return stateFilters
}

export const setErrorParams = (params) => {
  copySearchStateValues(errorParams, params)
}

export const resetSearchControl = () => {
  Object.assign(stateControl, {...SEARCH_CONTROL_STATE})
}

export const setSearchMode = (mode) => {
  stateControl.mode = mode
}

export const getFilterState = () => {
  return stateFilters
}

export const getSearchControlState = () => {
  return {
    ...toRefs(stateControl)
  }
}

export const getErrorParams = () => {
  return errorParams
}
