import { defineComponent, PropType, Ref, ref, computed, watch, onMounted } from 'vue'
import { LocationAsRelativeRaw } from 'vue-router'
import PaginationElement from './pagination'
import LineLoader from '../line-loader.vue'
import IAxiosInterface from '../../IAxiosInterface'
import usePaginatedApi from '../../composables/use-paginated-api'
import useScrollPagination from '../../composables/use-scroll-pagination'
import RelationSelect from '../relation-select/relation-select'
import MultipleRelationSelect from '../relation-select/multiple-relation-select'

import './default-table.sass'

export enum SearchTypes { String, Relation, MultipleRelation }

type TableParamElement = { id: string, name: string }

export type TableHeader = {
  name: string,
  search?: string,
  searchType?: SearchTypes
  endpoint?: string
  itemConverter?: (v: any) => TableParamElement
}

type TableFilter = { name: string, key: string, value: string, id: string }

type TableParam = string|TableParamElement|Array<TableParamElement>

type TableParams = {
  [ code: string ]: TableParam
}

export type TableContext = {
  remove: (id: string) => void
}

function paramIsString (param: TableParam): param is string {
  return typeof param === 'string'
}

function paramIsObject (param: TableParam): param is TableParamElement {
  return typeof param === 'object' && !Array.isArray(param)
}

function paramIsArray (param: TableParam): param is Array<TableParamElement> {
  return Array.isArray(param)
}

export default defineComponent({
  props: {
    add: {
      type: Object as PropType<LocationAsRelativeRaw>
    },
    additionalButtons: {
      type: Function as PropType<(c: any) => JSX.Element>,
    },
    axios: {
      type: Object as PropType<IAxiosInterface>,
      required: true
    },
    defaultFilter: {
      type: Object as PropType<{ [code: string]: string }>,
      default: () => ({})
    },
    endpoint: {
      type: String,
      required: true
    },
    gap: {
      type: Boolean,
      default: false
    },
    headers: {
      type: Array as PropType<TableHeader[]>,
      required: true
    },
    itemConverter: {
      type: Function as PropType<(item: any) => any>,
      default: () => (item: any) => item
    },
    line: {
      type: Function as PropType<(item: any, context: TableContext) => JSX.Element>,
      required: true
    },
    paginationType: {
      type: String,
      default: 'page'
    },
    perPage: {
      type: Number,
      default: 10
    },
    responseItemsKey: {
      type: String,
      default: 'items'
    },
    responseTotalKey: {
      type: String,
      default: 'total'
    },
    scrollPagination: {
      type: Boolean,
      default: false
    },
  },
  setup (props) {
    const trigger = ref(null) as unknown as Ref<HTMLElement>

    const preparedParams: TableParams = {}

    props.headers.filter(h => h.search).forEach(h => {
      if (!h.search) return
      if (h.searchType === SearchTypes.String) preparedParams[h.search] = ''
      if (h.searchType === SearchTypes.Relation) preparedParams[h.search] = { id: '', name: '' }
      if (h.searchType === SearchTypes.MultipleRelation) preparedParams[h.search] = []
    })

    const params: Ref<TableParams> = ref(preparedParams)

    const perPage = ref(props.perPage)

    const queryParams = computed(() => {
      const innerParams = {...props.defaultFilter, ...params.value}
      const resultParams: { [code: string]: string} = {}

      for (let key in innerParams) {
        const param = innerParams[key]

        if (paramIsObject(param)) resultParams[key] = param.id
        if (paramIsArray(param)) resultParams[key] = param.map(p => p.name).join(',')
        if (paramIsString(param)) resultParams[key] = param
      }

      return resultParams
    })

    const {
      page,
      pages,
      count,
      isLoading,
      items,
      load,
      reload,
      loadPrev,
      loadNext,
      loadPage
    } = usePaginatedApi(
      props.endpoint,
      props.axios,
      queryParams,
      perPage,
      props.paginationType,
      props.itemConverter,
      props.scrollPagination,
      props.responseItemsKey,
      props.responseTotalKey
    )

    onMounted(load)

    if (props.scrollPagination) useScrollPagination(loadNext, trigger)

    watch(props.defaultFilter, reload)
    
    watch(perPage, reload)

    const filterParams = computed(() => {
      console.log('FILTER PARAMS', params.value)
      const filters: TableFilter[] = []

      for (let key in params.value) {
        const param = params.value[key]
        const header = props.headers.find(h => h.search === key)

        if (!header) continue

        if (paramIsString(param) && param !== '') filters.push({ name: header.name, key: String(header.search), id: '', value: param })
        if (paramIsObject(param) && param.id !== '') filters.push({ name: header.name, key: String(header.search), id: param.id, value: param.name })
        if (paramIsArray(param)) param.forEach(p => {
          filters.push({ name: header.name, key: String(header.search), id: p.id, value: p.name })
        })
      }

      return filters
    })

    const resetFilter = (filter: TableFilter) => {
      const param = params.value[filter.key]

      if (!param) return

      if (paramIsString(param)) params.value[filter.key] = ''
      if (paramIsObject(param)) params.value[filter.key] = { id: '', name: '' }
      if (paramIsArray(param)) {
        const element = param.find(e => e.id === filter.id)
        if (!element) return
        param.splice(param.indexOf(element), 1)
      }

      reload()
    }

    const setFilter = (key: string, value: string|TableParamElement|TableParamElement[]) => {
      params.value[key] = value
      reload()
    }

    const getTableSearchParam = (header: TableHeader): TableParam => {
      if (!header.search) throw new Error(`Заголовок ${header.name} не предназначен для поиска, но отрисовывается для поиска`)
      const param = params.value[header.search]
      return param
    }

    const remove = async (id: string) => {
      isLoading.value = true
      await props.axios.delete(props.endpoint + '/' + id)
      await load()
      isLoading.value = false
    }

    const context = { remove }
    
    return () => {
      const renderSearchString = (header: TableHeader) => {
        const param = getTableSearchParam(header)
        if (!paramIsString(param)) throw new Error(`Тип поиска в заголовке ${header.name} не совпадает с типом параметра во внутреннем состоянии таблицы`)
        return (
          <input
            class="apptimizm-ui-default-table-search-string"
            value={String(param)}
            onInput={(e) => setFilter(String(header.search), (e.target as HTMLInputElement).value)}
          />
        )
      }

      const renderSearchRelation = (header: TableHeader) => {
        if (!header.endpoint) throw new Error(`Не задан endpoint для заголовка ${header.name}`)
        if (!header.itemConverter) throw new Error(`Не задана функция itemConverter для заголовка ${header.name}`)
        const param = getTableSearchParam(header)
        console.log(param)
        if (!paramIsObject(param)) throw new Error(`Тип поиска в заголовке ${header.name} не совпадает с типом параметра во внутреннем состоянии таблицы`)
        return (
          <RelationSelect
            axios={props.axios}
            endpoint={header.endpoint}
            itemConverter={header.itemConverter}
            modelValue={param}
            onValueChange={(v: TableParamElement) => { setFilter(String(header.search), v) }}
          />
        )
      }

      const renderSearchMultipleRelation = (header: TableHeader) => {
        if (!header.endpoint) throw new Error(`Не задан endpoint для заголовка ${header.name}`)
        if (!header.itemConverter) throw new Error(`Не задана функция itemConverter для заголовка ${header.name}`)
        const param = getTableSearchParam(header)
        if (!paramIsArray(param)) throw new Error(`Тип поиска в заголовке ${header.name} не совпадает с типом параметра во внутреннем состоянии таблицы`)
        return (
          <MultipleRelationSelect
            axios={props.axios}
            endpoint={header.endpoint}
            itemConverter={header.itemConverter}
            modelValue={param}
            onValueChange={(v: TableParamElement[]) => { setFilter(String(header.search), v) }}
          />
        )
      }

      const renderSearchHeader = (header: TableHeader) => {
        if (header.searchType === SearchTypes.String) return renderSearchString(header)
        if (header.searchType === SearchTypes.Relation) return renderSearchRelation(header)
        if (header.searchType === SearchTypes.MultipleRelation) return renderSearchMultipleRelation(header)
      }

      return (
        <div>
          <div class="apptimizm-ui-default-table-filter">
            { filterParams.value.map(filter => (
              <div class="apptimizm-ui-default-table-filter-param" onClick={() => resetFilter(filter)}>
                { filter.name }: { filter.value }
                <div class="apptimizm-ui-default-table-filter-param-close"/>
              </div>
            )) }
          </div>
          { isLoading.value && <LineLoader/> }
          <div class="apptimizm-ui-default-table">
            <div class="apptimizm-ui-default-table-head">
              <div class="apptimizm-ui-default-table-row">
                { props.headers.map((h: TableHeader) => (
                  <div class="apptimizm-ui-default-table-cell">
                    { h.search ? renderSearchHeader(h) : h.name }
                  </div>
                )) }
              </div>
            </div>
            { props.gap && <div class="apptimizm-ui-default-table-gap"/> }
            <div class="apptimizm-ui-default-table-body">
              { items.value.map((item: any) => props.line(item, context)) }
            </div>
          </div>
          { isLoading.value && <LineLoader/> }
          <div class="apptimizm-ui-default-table-footer">
            { props.scrollPagination && <div ref={trigger}/> }
            { !props.scrollPagination && pages.value > 1 && (
              <PaginationElement
                page={page.value}
                pages={pages.value}
                perPage={perPage.value}
                count={count.value}
                onEvents={true}
                onPageChange={(i: number) => loadPage(i)}
                onPerPageChange={(i: number) => { perPage.value = i }}
              />
            ) }
            <div class="default-table-buttons">
              { props.additionalButtons && props.additionalButtons(this) }
              { props.add && <router-link to={props.add} class="default-table-add-button">Добавить</router-link> }
            </div>
          </div>
        </div>
      )
    }
  }
})