import { reactive, toRefs } from 'vue'
import { service } from '@/helpers/api'
import { getLastVisitedInit } from '@/stores/lastVisited'

const authorizationData = reactive({
  authorized: false,
  isAdmin: false,
  firstName: '',
  lastName: '',
  email: '',
  loaded: false,
  firstLogin: false,
  hasDw: false,
  hasDwRelation: false,
  dataWalletStatus: ''
})

export const initAuthorization = async () => {
  try {
    const { data } = await service.get('user-info')
    authorizationData.firstName = data.firstName
    authorizationData.lastName = data.lastName
    authorizationData.email = data.email
    authorizationData.isAdmin = data.admin
    authorizationData.hasDw = data.hasDw
    authorizationData.hasDwRelation = data.hasDwRelation
    authorizationData.dataWalletStatus = data.dataWalletStatus
    authorizationData.firstLogin = data.firstLogin
    authorizationData.authorized = true
    getLastVisitedInit()
  } catch (e) {
    console.log(e)
  }
  authorizationData.loaded = true
}

export const checkDataWalletConnection = async () => {
  try {
    const { data } = await service.get('user-info')
    authorizationData.firstName = data.firstName
    authorizationData.lastName = data.lastName
    authorizationData.email = data.email
    authorizationData.hasDw = data.hasDw
    authorizationData.hasDwRelation = data.hasDwRelation
  } catch (e) {
    console.log(e)
  }
}

export const getAuthorizationData = () => {
  return {...toRefs(authorizationData) }
}

export const login = () => {
  if (authorizationData.isAdmin) {
    window.location = `${window.origin}/admin/login`
  } else {
    window.location = `${window.origin}/oauth2/authorization/keycloak`
  }
}