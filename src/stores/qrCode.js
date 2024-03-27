import { reactive, watch,  watchEffect, toRefs } from 'vue'
import { getAuthorizationData } from '@/stores/authorization'
import { service } from '@/helpers/api'

const { authorized, isAdmin, hasDw, hasDwRelation } = getAuthorizationData()

const TIMEOUT = 10000
let timeoutId = null
let i = null
const state = reactive({
  display: false,
  showModal: false,
  isPolling: false,
  error: false
})

watchEffect(async ()=> {
  if (authorized.value && (!hasDw.value || !hasDwRelation.value) && !isAdmin.value) {
    state.display = true
  }
})

export const polling = async () => {
  if (isAdmin.value) return
  state.isPolling = true
  if (i === null) i = 0
  try {
    const { data } = await service.get('/relationship/status')
    if( i === 11) {
      state.showModal = true
      state.error = true
      state.isPolling = false
      clearTimeout(timeoutId)
      i = null
      return
    }

    if (data !== 'ACTIVE') {
      timeoutId = setTimeout(polling, TIMEOUT)
    } else {
      state.display = false
      state.showModal = true
      state.isPolling = false
    }
    i += 1
  } catch (e) {
    console.log(e)
    state.isPolling = false
  }
}

watch (() => state.showModal, (val) => {
  if (val && timeoutId) clearTimeout(timeoutId)
})

watch (() => state.display, (val) => {
  if(!val) clearTimeout(timeoutId)
})

export const showQrModal = () => {
  state.showModal = true
}

export const hideQrModal = () => {
  state.showModal = false
}

export const getQrState = () => {
  return {
    ...toRefs(state)
  }
}
