import { AxiosRequestConfig, AxiosResponse } from 'axios'

export default interface IAxiosInterface {
  get: (url: string, config?: AxiosRequestConfig) => AxiosResponse
  post: (url: string, data: any, config?: AxiosRequestConfig) => AxiosResponse
  put: (url: string, data: any, config?: AxiosRequestConfig) => AxiosResponse
  patch: (url: string, data: any, config?: AxiosRequestConfig) => AxiosResponse
  delete: (url: string, config?: AxiosRequestConfig) => AxiosResponse
}
