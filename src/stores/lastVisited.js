import { reactive, toRef } from 'vue'
import { service } from '@/helpers/api'
import { mapRawSearchData } from '@/components/Search/commons/Search.helper'
import { getAuthorizationData  } from '@/stores/authorization'
import {
  init as sessionStorageInit,
  addMaterialAsLastViewed as sessionStorageAddMaterial,
  getLastViewedMaterials as sessionStorageGetMaterials,
  addSubjectAsLastUsed as sessionStorageAddSubject,
  getLastUsedSubjects as sessionStorageGetSubjects
} from '@/stores/sessionStorage'

const MAX_LAST_USED_SUBJECTS = 5

const LAST_VISITED = reactive({
  loaded: false,
  lastViewedMaterials: [],
  lastSelectedSubjects: [],
  totalElements: 0
})

export const getLastVisitedInit = async () => {
  try {
    {
      const { data } = await service.get('/history/search/own?page=0&size=20')
      LAST_VISITED.lastViewedMaterials = mapRawSearchData(data.content)
      LAST_VISITED.totalElements = data.totalElements
    }
    {
      const { data } = await service.get('/history/subject/own?page=0&size=5')
      LAST_VISITED.lastSelectedSubjects = data.map(item => ({ key: item, lastUsed: true }))
    }
  } catch (e) {
    console.log(e)
  }
  LAST_VISITED.loaded = true
}

export const getLastVisitedByPage = async (page) => {
  try {
    const { data } = await service.get(`/history/search/own?page=${page}&size=20`)
    LAST_VISITED.lastViewedMaterials = mapRawSearchData(data.content)
    LAST_VISITED.totalElements = data.totalElements
  } catch (e) {
    console.log(e)
  }
}

export const clearLastVisited = () => {
  LAST_VISITED.lastViewedMaterials = []
}

export const addMaterialAsLastViewed = (material) => {
  if (getAuthorizationData().authorized.value) {
    postLastVisitedApi(material)
    const indexFound = LAST_VISITED.lastViewedMaterials.findIndex(mat => mat.title === material.title)
    if (indexFound > -1) {
      LAST_VISITED.lastViewedMaterials.splice(indexFound, 1)
    }
    LAST_VISITED.lastViewedMaterials = [ material, ...LAST_VISITED.lastViewedMaterials ]
  } else {
    sessionStorageAddMaterial(material)
  }
}

export const init = () => {
  sessionStorageInit()
}

export const getLastViewedMaterials = () => {
  if (getAuthorizationData().authorized.value) {
    return toRef(LAST_VISITED, 'lastViewedMaterials')
  }
  return sessionStorageGetMaterials()
}

export const addSubjectAsLastUsed = (subject) => {
  if (getAuthorizationData().authorized.value) {
    postSubjectApi(subject)
    const indexFound = LAST_VISITED.lastSelectedSubjects.findIndex(sub => sub.key === subject.key)
    if (indexFound > -1) {
      LAST_VISITED.lastSelectedSubjects.splice(indexFound, 1)
    }
    LAST_VISITED.lastSelectedSubjects = [ subject, ...LAST_VISITED.lastSelectedSubjects ].splice(0, MAX_LAST_USED_SUBJECTS)
  } else {
    sessionStorageAddSubject(subject)
  }
}

export const getLastUsedSubjects = () => {
  if (getAuthorizationData().authorized.value) {
    return toRef(LAST_VISITED, 'lastSelectedSubjects')
  }
  return sessionStorageGetSubjects()
}

export const getTotalElements = () => {
  return toRef(LAST_VISITED, 'totalElements')
}

const postLastVisitedApi = (material) => {
  try {
    service.post('/history/search',
      {
        id: material.id,
        publisherId: material.publisher.id
      }
    )
  } catch (e) {
    console.log(e)
  }
}

const postSubjectApi = (subject) => {
  try {
    service.post('/history/subject',
      { key: subject.key }
    )
  } catch (e) {
    console.log(e)
  }
}