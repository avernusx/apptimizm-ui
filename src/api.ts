// Классы библиотеки
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

export interface Type<T> extends Function {
  new (...args: any[]): T
}

interface ErrorResponseType<T> extends Type<T> {
  load(data: AxiosResponse) : T
}

export type Nullable<T> = T | null

export class Model {

}

export class BaseResponse<T> {
  page!: number
  perPage!: number
  pages!: number
  items: T[] = []
  constructor (data: AxiosResponse) {}
}

export class ErrorResponse extends Error {
  common: string[] = []
  fields: { [ code: string ]: string[] } = {}

  constructor (common: string[], fields: { [ code: string ]: string[] } = {}) {
    super()
    this.common = common
    this.fields = fields
  }

  static load (data: AxiosResponse) : ErrorResponse {
    return new ErrorResponse([], {})
  }
}

export class ApiEndpoint {
  $axios!: AxiosInstance
  axiosConfig: AxiosRequestConfig = {}
  responseType: Type<BaseResponse<Model>> = BaseResponse
  defaultErrorMessages: { [ code: number ]: string | Type<ErrorResponse>} = {
    404: 'Эндпойнт не найден',
    500: 'Ошибка сервера'
  }

  defaultErrorMessage = 'Произошла неизвестная ошибка'

  payload: any

  constructor () {
    this.$axios = axios.create(this.axiosConfig)
  }

  async request () : Promise<BaseResponse<Model>> {
    let response = null
    try {
      response = await this.$axios.request(this.axiosConfig)
    } catch (e) {
      if (e.response?.status) {
        if (typeof this.defaultErrorMessages[e.response.status] === 'string') {
          const error = this.defaultErrorMessages[e.response.status] as string
          throw new ErrorResponse([error])
        }

        if (typeof this.defaultErrorMessages[e.response.status] === 'undefined') {
          throw new ErrorResponse([this.defaultErrorMessage])
        }

        const error = this.defaultErrorMessages[e.response.status] as ErrorResponseType<ErrorResponse>

        throw error.load(e.response)
      }

      throw e
    }

    return new this.responseType(response)
  }
}
