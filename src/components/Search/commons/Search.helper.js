import { service } from '@/helpers/api'
import { getSearchControlState, showMoreTypes, setErrorParams  } from '@/stores/search.js'
import { getFiltersDataState } from '@/stores/filters'

export const PAGE_SIZE = 20

export const fetchResults = async (formData) => {
  const { mode } = getSearchControlState()
  const related = (mode.value === showMoreTypes.RELATED || mode.value === showMoreTypes.NONE ) ?
    await fetch(formData, 'related') : {}
  const mostRelevant = (mode.value === showMoreTypes.RELEVANT || mode.value === showMoreTypes.NONE ) ?
    await fetch(formData, 'most-relevant') : {}

  return {
    mostRelevant,
    related
  }
}

export const fetch = async (formData, type) => {
  let response
  try {
    const sortType = formData.sortType[0].split('-')
    response = await service.get(`/search/${type}?page=${formData.page - 1}&size=${PAGE_SIZE}`, {
      params: {
        sort: [ sortType[0], sortType[1] ],
        search: formData.search ? formData.search : undefined,
        subject: formData.subject,
        schoolType: formData.schoolType?.length ? formData.schoolType[0] : undefined,
        typicalAgeRange: formData.studyYear?.length ? formData.studyYear[0] : undefined,
        learningResourceType: formData.learningResourceType?.length ? formData.learningResourceType[0] : undefined,
        publisher: formData.publisher?.length ? formData.publisher[0] : undefined,
        technicalFormat: formData.mediaType?.length ? formData.mediaType : undefined,
        federalStates: formData.federalState?.length ? formData.federalState : undefined,
        grade: formData.grade?.length ? formData.grade : undefined,
        differentiation: formData.differentiation?.length ? formData.differentiation : undefined,
        schoolBook: formData.schoolBook?.length ? formData.schoolBook : undefined
      }
    })
    if (!response.data) {
      throw 'NO_RESPONSE'
    }
  } catch (e) {
    setErrorParams(formData)
    throw e
  }
  return response.data
}

export const mapSearchModelsToQueries = (router, route, formData) => {
  router.replace({
    query: {
      ...route.query,
      subject: formData.subject,
      search: formData.search || undefined,
      schoolType: formData.schoolType.length ? formData.schoolType[0] : undefined,
      studyYear: formData.studyYear.length ? formData.studyYear[0] : undefined,
      learningResourceType: formData.learningResourceType.length ? formData.learningResourceType[0] : undefined,
      mediaType: formData.mediaType.length ? formData.mediaType : undefined,
    }
  })
}

export const mapRawSearchData = (results) => {
  return results.map(el => mapRawResult(el))
}

export const mapRawResult = (result) => {
  return {
    title: result.name,
    id: result.id,
    image: result.thumbnailUrl,
    publisher: getPublisherById(result.publisherId),
    productId: result.id,
    age: result.typicalAgeRange,
    subjects: result.subject,
    type: result.technicalFormat,
    description: result.description,
    materialUrl: result.url,
  }
}

export const getPublisherById = (id) => (
  getFiltersDataState().rawPublishers.find(pub => pub.id === id)
)