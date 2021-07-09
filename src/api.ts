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

  async request (data?: any) : Promise<BaseResponse<Model>> {
    let response = null
    try {
      // TODO: сделать глубокое клонирование
      const config = this.axiosConfig
      if (data?.data) config.data = data.data
      response = await this.$axios.request(config)
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

export class ValidationRule {
  message?: string

  constructor (message?: string) {
    this.message = message
  }

  error (value: any) : string | null {
    return null
  }

  errorMessage (message: string) {
    return this.message ? this.message : message
  }
}

export class Required extends ValidationRule {
  error (value: any) : string | null {
    if (value === undefined || value === null || value === '') return this.errorMessage('Поле должно быть заполнено')
    return null
  }
}

export class IsEmail extends ValidationRule {
  error (value: any) : string | null {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (!re.test(String(value).toLowerCase())) return this.errorMessage('Поле должно являться корректным адресом электронной почты')
    return null
  }
}

type ValidationRulesCollection = {
  [ code: string ]: Array<Type<ValidationRule> | Array<Type<ValidationRule> | string>>
}

export class Validator {
  rules: ValidationRulesCollection = {}
  customValidation?: (
    validator: Validator,
    form: any,
    flag: boolean,
    checks: { [ code: string ]: { [ code: string ] : boolean } },
    errors: { [ code: string ]: string[] }
  ) => { flag: boolean, errors: { [ code: string ]: string[] }, commonErrors: string[] }

  constructor (rules: ValidationRulesCollection, customValidation?: any) {
    this.rules = rules
    this.customValidation = customValidation
  }

  errors (form: any) : { errors: { [ code: string ]: string[] }, commonErrors: string[] } | null {
    let flag = false
    const errors = {} as { [ code: string ]: string[] }
    const checks = {} as { [ code: string ]: { [ code: string ] : boolean } }

    for (const key in this.rules) {
      checks[key] = {}
      this.rules[key].forEach(rule => {
        let r = null

        if (Array.isArray(rule)) {
          const r2 = rule[0] as unknown as Type<ValidationRule>
          r = new r2(rule[1] as unknown as string)
        } else {
          r = new rule()
        }

        const error = r.error(form[key])
        if (error) {
          flag = true
          if (!errors[key]) errors[key] = []
          errors[key].push(error)
          checks[key][r.constructor.name] = true
        }
      })
    }

    const commonErrors: string[] = []
    let result = {
      flag,
      errors,
      commonErrors
    }

    if (typeof this.customValidation !== 'undefined') {
      result = this.customValidation(this, form, flag, checks, errors)
    }

    return result.flag ? { errors: result.errors, commonErrors: result.commonErrors } : null
  }
}
