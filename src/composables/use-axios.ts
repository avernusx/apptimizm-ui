import axios, { AxiosRequestConfig, Method } from 'axios'

export default function useAxios (
  setConfig?: (config: AxiosRequestConfig) => AxiosRequestConfig
) {
  async function request (method: Method, url: string, config?: AxiosRequestConfig) {
    if (!config) config = {}
    if (setConfig) config = setConfig(config)

    let response = null

    try {
      response = await axios.request({ url, method, ...config })
      return response
    } catch (e) {
      const error = e as any

      if (error.response?.status === 400) return error.response
      if (error.response?.status === 401) window.dispatchEvent(new Event('401 Unauthorized'))
      if (error.response?.status && typeof (window) !== 'undefined') {
        console.log(`Error ${error.response?.status}`)
        const event = new Event(`Error ${error.response?.status}`, { bubbles: true })
        window.dispatchEvent(event)
      }

      throw e
    }
  }

  async function get (url: string, config?: AxiosRequestConfig) {
    return request('GET', url, config)
  }

  async function post (url: string, data?: any, config?: AxiosRequestConfig) {
    return request('POST', url, {
      data,
      ...config
    })
  }

  async function put (url: string, data?: any, config?: AxiosRequestConfig) {
    return request('PUT', url, {
      data,
      ...config
    })
  }

  async function patch (url: string, data?: any, config?: AxiosRequestConfig) {
    return request('PATCH', url, {
      data,
      ...config
    })
  }

  async function remove (url: string, config?: AxiosRequestConfig) {
    return request('DELETE', url, config)
  }

  return { get, post, put, delete: remove, patch, request }
}
