import { ApiEndpoint, BaseResponse, ErrorResponse, Model, Type, Validator, Required, IsEmail } from './api'
import { AxiosRequestConfig, AxiosResponse } from 'axios'

export class Newsentry {
  id!: string
  name!: string
  createdAt!: string

  constructor (data: any) {
    this.id = data.id
    this.name = data.name
    this.createdAt = data.createdAt
  }

  static load (data: any) : Newsentry {
    return new Newsentry({
      id: data.id,
      name: data.name,
      createdAt: data.created_at
    })
  }
}

export class NewsentryListResponse extends BaseResponse<Newsentry> {
  constructor (data: AxiosResponse) {
    super(data)
    this.page = data.data.page
    this.perPage = data.data.perPage
    this.pages = data.data.pages
    this.items = data.data.items.map((i: any) => Newsentry.load(i))
  }
}

export class ProjectErrorResponse extends ErrorResponse {
  static load (data: AxiosResponse) : ProjectErrorResponse {
    const response = new ProjectErrorResponse([], data.data.errors)
    return response
  }
}

export class PlainProjectErrorResponse extends ErrorResponse {
  static load (data: AxiosResponse) : ProjectErrorResponse {
    const errors: { [code: string]: string[] } = {}

    data.data.errors_text.forEach((e: string) => {
      const error = e.split(':')
      if (!errors[error[0]]) errors[error[0]] = []
      errors[error[0]].push(error[1])
    })

    return new ProjectErrorResponse([], errors)
  }
}

export class ProjectApiEndpoint extends ApiEndpoint {
  axiosConfig: AxiosRequestConfig = {
    url: '/mail-recipients/',
    baseURL: 'https://api-dev-afinara.apptimizm.pro/api/v1',
    method: 'POST'
  }

  responseType: Type<NewsentryListResponse> = NewsentryListResponse

  defaultErrorMessages: { [ code: number ]: string | Type<ErrorResponse>} = {
    400: PlainProjectErrorResponse,
    404: 'Эндпойнт не найден в классе новостей'
  }
}

export const FeedbackFormValidator = new Validator({
  email: [
    [Required, 'Это кастомное сообщение'],
    IsEmail
  ]
}, (
  validator: Validator,
  form: any,
  flag: boolean,
  checks: { [ code: string ]: { [ code: string ] : boolean } },
  errors: { [ code: string ]: string[] }
) => {
  const customErrors = []

  if (!checks.email?.Required && !checks.email?.IsEmail) {
    flag = true
    customErrors.push('Вы не можете отправить форму, потому что заполнили ее верно')
  }

  return { flag, errors, commonErrors: customErrors }
})
