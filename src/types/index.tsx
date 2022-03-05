import { camelCase, snakeCase } from 'lodash'

type BackendFormErrors = { [code: string] : string|string[]|Array<BackendFormErrors>|BackendFormErrors }

export class FormErrors {
  data: { [code: string] : string|string[]|Array<FormErrors>|FormErrors } = {}

  constructor (data: BackendFormErrors) {
    for (const key in data) {
      if (typeof (data[key]) === 'string') this.data[key] = (data[key] as string)
      else if (
        Array.isArray(data[key]) &&
        data[key].length > 0 &&
        typeof ((data[key] as string[])[0]) === 'string'
      ) this.data[key] = (data[key] as string[])
      else if (
        Array.isArray(data[key]) &&
        data[key].length > 0 &&
        typeof ((data[key] as BackendFormErrors[])[0]) === 'object'
      ) this.data[key] = (data[key] as BackendFormErrors[]).map((i: any) => new FormErrors(i))
      else if (typeof (data[key]) === 'object') this.data[key] = new FormErrors(data[key] as BackendFormErrors)
    }
  }

  getErrors (key: string): string[]|undefined {
    if (typeof (this.data[key]) === 'string') return [String(this.data[key])]
    else if (
      Array.isArray(this.data[key]) &&
      (this.data[key] as string[]).length > 0 &&
      typeof ((this.data[key] as string[])[0]) === 'string'
    ) return this.data[key] as string[]
  }

  getNested (key: string, index: number = -1): FormErrors|undefined {
    if (
      index >= 0 &&
      Array.isArray(this.data[key]) &&
      typeof ((this.data[key] as FormErrors[])[index]) !== 'undefined'
    ) return (this.data[key] as FormErrors[])[index]

    if (
      index === -1 &&
      this.data[key] instanceof FormErrors
    ) return this.data[key] as FormErrors
  }

  forField (key: string): string[]|undefined {
    if (typeof (this.data[key]) === 'string') return [String(this.data[key])]
    else if (
      Array.isArray(this.data[key]) &&
      (this.data[key] as string[]).length > 0 &&
      typeof ((this.data[key] as string[])[0]) === 'string'
    ) return this.data[key] as string[]
  }
}

export class Entity {
  id: string|number = 0
}

type FieldMeta = {
  // eslint-disable-next-line @typescript-eslint/ban-types, no-use-before-define
  type: Function | EntityMeta<Entity>,
  backendKey?: string,
  many?: boolean
}

export class EntityMeta<T> {
  endpoint = ''
  entity = Entity

  fields: { [code: string] : FieldMeta } = {}

  static load (data: any) {
    const meta = new this()
    return meta.load(data)
  }

  static dump (item: any) {
    const meta = new this()
    return meta.dump(item)
  }

  static errors (errors: BackendFormErrors) {
    const meta = new this()
    return meta.errors(errors)
  }

  getInstance () {
    return new this.entity()
  }

  load (data: any) {
    const result = new this.entity() as { [code: string] : any }

    Object.keys(this.fields).forEach((frontendKey: string) => {
      const field = this.fields[frontendKey]
      const backendKey = field.backendKey ?? frontendKey

      if (!data[backendKey]) return

      // eslint-disable-next-line @typescript-eslint/ban-types
      const type = field.type as any
      const call = (typeof (type.load) !== 'undefined' ? (data: any) => type.load(data) : type)
      field.many === true ? result[frontendKey] = data[backendKey].map((i: any) => call(i)) : result[frontendKey] = call(data[backendKey])
    })

    return result as T
  }

  dump (item: T) {
    const result = {} as { [code: string] : any }
    const data = item as { [code: string] : any }

    Object.keys(this.fields).forEach((frontendKey: string) => {
      const field = this.fields[frontendKey]
      const backendKey = this.fields[frontendKey].backendKey ?? frontendKey

      if (data[frontendKey] === undefined) return

      // eslint-disable-next-line @typescript-eslint/ban-types
      const type = field.type as any
      const call = type.dump ? (data: any) => type.dump(data) : type
      field.many === true ? result[backendKey] = data[frontendKey].map((i: any) => call(i)) : result[backendKey] = call(data[frontendKey])
    })

    if (result.id === 0 || result.id === '') delete result.id

    return result
  }

  extractErrors (errors: BackendFormErrors) {
    const result = {} as BackendFormErrors

    Object.keys(this.fields).forEach((frontendKey: string) => {
      const field = this.fields[frontendKey]
      const backendKey = field.backendKey ?? frontendKey

      if (errors[backendKey]) {
        result[frontendKey] = errors[backendKey]

        if (typeof ((field.type as any).extractErrors) !== 'undefined') {
          if (field.many === true) {
            result[frontendKey] = (result[frontendKey] as BackendFormErrors[]).map((i: BackendFormErrors) => (field.type as any).extractErrors(i))
          } else {
            result[frontendKey] = (field.type as any).errors(result[frontendKey])
          }
        }
      }
    })

    return result
  }

  errors (errors: BackendFormErrors): FormErrors {
    return new FormErrors(this.extractErrors(errors))
  }
}
