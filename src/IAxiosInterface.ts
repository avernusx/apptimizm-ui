import { AxiosRequestConfig, AxiosResponse } from 'axios'

export default interface IAxiosInterface {
  get: (url: string, config?: AxiosRequestConfig) => Promise<any>
  post: (url: string, data: any, config?: AxiosRequestConfig) => Promise<any>
  put: (url: string, data: any, config?: AxiosRequestConfig) => Promise<any>
  patch: (url: string, data: any, config?: AxiosRequestConfig) => Promise<any>
  delete: (url: string, config?: AxiosRequestConfig) => Promise<any>
}
