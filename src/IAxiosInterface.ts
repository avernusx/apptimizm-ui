import { AxiosRequestConfig, AxiosResponse } from 'axios'

export default interface IAxiosInterface {
  get: (url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse>
  post: (url: string, data: any, config?: AxiosRequestConfig) => Promise<AxiosResponse>
  put: (url: string, data: any, config?: AxiosRequestConfig) => Promise<AxiosResponse>
  patch: (url: string, data: any, config?: AxiosRequestConfig) => Promise<AxiosResponse>
  delete: (url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse>
}
