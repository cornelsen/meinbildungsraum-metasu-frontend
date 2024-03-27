import axios from 'axios'
import qs from 'qs'
import { login } from '@/stores/authorization'


const service = axios.create({
  baseURL: '/api',
  timeout: 25000,
  paramsSerializer: {
    indexes: false,
    serialize: (params) => qs.stringify(params, { arrayFormat: 'comma' })
  }
})

service.interceptors.response.use(
  resp => resp,
  async (error) => {
    if (import.meta.env.PROD && error.config.url === 'user-info') {
      return Promise.reject(error)
    }
    if (error.response.status === 401) {
      login()
    }
    return Promise.reject(error)
  }
)

const uploadAttachment = async (file) => {
  const formData= new FormData()
  formData.append('file', file)
  const { data }  = await service.post('/attachments', formData)
  return data.id
}

const getAttachmentUrlById = (id) => {
  return `${window.origin}/api/attachments/${id}`
}

export { service, uploadAttachment, getAttachmentUrlById }
