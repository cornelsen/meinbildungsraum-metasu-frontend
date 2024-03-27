import { reactive, toRef } from 'vue'

const MAX_LAST_USED_SUBJECTS = 5

const SESSION_STORAGE = reactive({
  lastViewedMaterials: [],
  lastSelectedSubjects: []
})

export const init = () => {
  if (localStorage ) {
    let materials
    let subjects
    try {
      materials = JSON.parse(localStorage.getItem('lastViewedMaterials')) || []
    } catch (e) {
      materials = []
    }
    try {
      subjects = JSON.parse(localStorage.getItem('lastSelectedSubjects')) || []
    } catch (e) {
      subjects = []
    }

    SESSION_STORAGE.lastViewedMaterials = materials
    SESSION_STORAGE.lastSelectedSubjects = subjects
  }
}

export const addMaterialAsLastViewed = (material) => {
  const indexFound = SESSION_STORAGE.lastViewedMaterials.findIndex(mat => mat.title === material.title)
  if (indexFound > -1) {
    SESSION_STORAGE.lastViewedMaterials.splice(indexFound, 1)
  }
  SESSION_STORAGE.lastViewedMaterials = [ material, ...SESSION_STORAGE.lastViewedMaterials ]
  localStorage.setItem('lastViewedMaterials', JSON.stringify(SESSION_STORAGE.lastViewedMaterials))
}

export const getLastViewedMaterials = () => {
  return toRef(SESSION_STORAGE, 'lastViewedMaterials')
}

export const addSubjectAsLastUsed = (subject) => {
  const indexFound = SESSION_STORAGE.lastSelectedSubjects.findIndex(sub => sub.key === subject.key)
  if (indexFound > -1) {
    SESSION_STORAGE.lastSelectedSubjects.splice(indexFound, 1)
  }
  SESSION_STORAGE.lastSelectedSubjects = [ subject, ...SESSION_STORAGE.lastSelectedSubjects ].splice(0, MAX_LAST_USED_SUBJECTS)
  localStorage.setItem('lastSelectedSubjects', JSON.stringify(SESSION_STORAGE.lastSelectedSubjects))
}

export const getLastUsedSubjects = () => {
  return toRef(SESSION_STORAGE, 'lastSelectedSubjects')
}