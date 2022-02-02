import { defineComponent, PropType, Ref, ref, computed, watch, onMounted } from 'vue'
import moment, { Moment } from 'moment'
import { LocationAsRelativeRaw } from 'vue-router'
import PaginationElement from './pagination'
import LineLoader from '../line-loader.vue'
import IAxiosInterface from '../../IAxiosInterface'
import usePaginatedApi from '../../composables/use-paginated-api'
import useScrollPagination from '../../composables/use-scroll-pagination'
import RelationSelect from '../relation-select/relation-select'
import MultipleRelationSelect from '../relation-select/multiple-relation-select'
import PeriodCalendar from '../calendars/period-calendar/period-calendar'

import './default-table.sass'

export enum SearchTypes { String, Relation, MultipleRelation, Daterange, Select }

type TableParamElement = { id: string, name: string }

export type TableHeader = {
  name: string,
  search?: string,
  searchType?: SearchTypes
  endpoint?: string
  itemConverter?: (v: any) => TableParamElement
  sort?: string
}

class TableDate {
  date: Moment|null = null
  type = 'from'

  constructor (type: string, date: Moment|null = null) {
    this.type = type
    this.date = date
  }
}

type TableFilter = { name: string, key: string, value: string, id: string }

type TableParam = string|TableParamElement|Array<TableParamElement>|TableDate

type TableParams = {
  [ code: string ]: TableParam
}

export type TableContext = {
  remove: (id: string) => void
}

function paramIsString (param: TableParam): param is string {
  return typeof param === 'string'
}

function paramIsDate (param: TableParam): param is TableDate {
  return param instanceof TableDate
}

function paramIsObject (param: TableParam): param is TableParamElement {
  return typeof param === 'object' && !Array.isArray(param) && !paramIsDate(param)
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
      type: Function as PropType<(c: any) => JSX.Element>
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
    smartFilter: {
      type: Boolean,
      default: false
    }
  },
  setup (props) {
    const trigger = ref(null) as unknown as Ref<HTMLElement>

    const params: Ref<TableParams> = ref({})

    // Инициализуем пустые типы внутренних фильтров таблицы (при создании компонента и сбросе фильтров)
    const setDefaultParams = (reset = true) => {
      // флаг reset отвечает за то, чтобы сбросить все фильтры в начальное состояние или только проинициализовать новые
      props.headers.filter(h => h.search).forEach(h => {
        if (!h.search) return
        if (!reset && params.value[h.search]) return
        if (h.searchType === SearchTypes.String) params.value[h.search] = ''
        if (h.searchType === SearchTypes.Relation) params.value[h.search] = { id: '', name: '' }
        if (h.searchType === SearchTypes.MultipleRelation) params.value[h.search] = []
        if (h.searchType === SearchTypes.Daterange) {
          const keys = h.search.split('/')
          if (keys.length < 2) throw new Error(`Неверный формат ключа для поиска Daterange в поле ${h.name}`)
          if (reset || !params.value[keys[0]]) params.value[keys[0]] = new TableDate('from')
          if (reset || !params.value[keys[1]]) params.value[keys[1]] = new TableDate('to')
        }
      })
    }

    setDefaultParams()

    watch(() => props.headers, () => setDefaultParams(false))

    const perPage = ref(props.perPage)

    // Превращаем внутренние фильтры таблицы и внешний defaultFilter в параметры запроса на бек
    const queryParams = computed(() => {
      const innerParams = { ...props.defaultFilter, ...params.value }
      const resultParams: { [code: string]: string} = {}

      for (const key in innerParams) {
        const param = innerParams[key]

        if (paramIsObject(param) && param.id) resultParams[key] = param.id
        if (paramIsArray(param)) {
          const arrayParams = param.filter(p => p.id !== '').map(p => p.id).join(',')
          if (arrayParams !== '') resultParams[key] = arrayParams
        }
        if (paramIsString(param) && param !== '') resultParams[key] = param
        if (paramIsDate(param) && param.date) resultParams[key] = param.date.format('YYYY-MM-DD')
      }

      return resultParams
    })

    const smartFilterParams = computed(() => props.smartFilter ? queryParams.value : {})

    const getSmartFilterParams = (search: string, params: { [code: string]: string }) => {
      const result = { ...params }
      delete result[search]
      return result
    }

    // Обращение к АПИ бекенда
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
      loadPage,
      setSort
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

    // Загружаем первую страницу при создании компонента
    onMounted(load)

    if (props.scrollPagination) useScrollPagination(loadNext, trigger)

    watch(() => props.defaultFilter, () => {
      reload()
    })

    watch(perPage, reload)

    // Преобразуем параметры фильтра для отображения над шапкой таблицы
    const filterParams = computed(() => {
      const filters: TableFilter[] = []

      for (const key in params.value) {
        const param = params.value[key]
        const header = props.headers
          .filter(h => h.search)
          .find(h => h.search && (
            h.search === key ||
            h.search?.indexOf(key + '/') > -1 ||
            h.search?.indexOf('/' + key) > -1)
          )

        if (!header) continue

        if (paramIsString(param) && param !== '') filters.push({ name: header.name, key: String(header.search), id: '', value: param })
        if (paramIsObject(param) && param.id !== '') filters.push({ name: header.name, key: String(header.search), id: param.id, value: param.name })
        if (paramIsArray(param)) {
          param.forEach(p => {
            filters.push({ name: header.name, key: String(header.search), id: p.id, value: p.name })
          })
        }
        if (paramIsDate(param) && param.date !== null) {
          filters.push({
            name: header.name + (param.type === 'from' ? ' от' : ' до'),
            key: key,
            id: '',
            value: param.date.format('DD.MM.YYYY')
          })
        }
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
      if (paramIsDate(param)) param.date = null

      reload()
    }

    const setFilter = (key: string, value: string|TableParamElement|TableParamElement[]|TableDate) => {
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
      props.scrollPagination ? items.value.splice(items.value.indexOf(items.value.find(i => i.id === id)), 1) : await load()
      isLoading.value = false
    }

    const clearFilters = async () => {
      setDefaultParams()
      await reload()
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
            placeholder={header.name}
          />
        )
      }

      const renderSearchRelation = (header: TableHeader) => {
        if (!header.endpoint) throw new Error(`Не задан endpoint для заголовка ${header.name}`)
        if (!header.itemConverter) throw new Error(`Не задана функция itemConverter для заголовка ${header.name}`)
        const param = getTableSearchParam(header)
        if (!paramIsObject(param)) throw new Error(`Тип поиска в заголовке ${header.name} не совпадает с типом параметра во внутреннем состоянии таблицы`)
        return (
          <RelationSelect
            axios={props.axios}
            endpoint={header.endpoint}
            itemConverter={header.itemConverter}
            modelValue={param}
            onValueChange={(v: TableParamElement) => { setFilter(String(header.search), v) }}
            placeholder={header.name}
            constantPlaceholder={false}
            params={getSmartFilterParams(String(header.search), smartFilterParams.value)}
            paginationType={props.paginationType}
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
            placeholder={header.name}
            constantPlaceholder={false}
            params={getSmartFilterParams(String(header.search), smartFilterParams.value)}
            paginationType={props.paginationType}
          />
        )
      }

      const renderSearchDaterange = (header: TableHeader) => {
        if (!header.search) return (<div/>)
        const keys = header.search.split('/')
        if (keys.length < 2) throw new Error(`Неверный формат ключа для поиска Daterange в поле ${header.name}`)
        const paramFrom = getTableSearchParam({ ...header, search: keys[0] })
        const paramTo = getTableSearchParam({ ...header, search: keys[1] })
        if (!paramIsDate(paramFrom)) throw new Error(`Тип поиска в заголовке ${header.name} не совпадает с типом параметра во внутреннем состоянии таблицы`)
        if (!paramIsDate(paramTo)) throw new Error(`Тип поиска в заголовке ${header.name} не совпадает с типом параметра во внутреннем состоянии таблицы`)
        return (
          <div class="apptimizm-ui-default-table-filter-calendar">
            { (paramFrom.date || paramTo.date) ? (
              <div class="apptimizm-ui-default-table-filter-calendar-date">
                { paramFrom.date?.format('DD.MM.YYYY') } - { paramTo.date?.format('DD.MM.YYYY') }
              </div>
            ) : (
              <div class="apptimizm-ui-default-table-filter-calendar-date">
                { header.name }
              </div>
            ) }
            <div class="apptimizm-ui-default-table-filter-calendar-area">
              <PeriodCalendar
                onSetStart={(v: Moment|null) => setFilter(keys[0], new TableDate('from', v))}
                onSetEnd={(v: Moment|null) => setFilter(keys[1], new TableDate('to', v))}
                start={paramFrom.date}
                end={paramTo.date}
              />
            </div>
          </div>
        )
      }

      const renderSearchHeader = (header: TableHeader) => {
        if (header.searchType === SearchTypes.String) return renderSearchString(header)
        if (header.searchType === SearchTypes.Relation) return renderSearchRelation(header)
        if (header.searchType === SearchTypes.MultipleRelation) return renderSearchMultipleRelation(header)
        if (header.searchType === SearchTypes.Daterange) return renderSearchDaterange(header)
      }

      return (
        <div>
          { filterParams.value.length > 0 && (
            <div class="apptimizm-ui-default-table-filter">
              <div class="apptimizm-ui-default-table-filter-head">
                <div class="apptimizm-ui-default-table-filter-count">Фильтр: { filterParams.value.length }</div>
                <div class="apptimizm-ui-default-table-filter-clear" onClick={clearFilters}>Очистить все</div>
              </div>
              { filterParams.value.map(filter => (
                <div class="apptimizm-ui-default-table-filter-param" onClick={() => resetFilter(filter)}>
                  <span>{ filter.name }:</span> <span>{ filter.value }</span>
                  <div class="apptimizm-ui-default-table-filter-param-close"/>
                </div>
              )) }
            </div>
          ) }
          { isLoading.value && <LineLoader/> }
          <div class="apptimizm-ui-default-table">
            <div class="apptimizm-ui-default-table-head">
              <div class="apptimizm-ui-default-table-row">
                { props.headers.map((h: TableHeader) => (
                  <div
                    class={`apptimizm-ui-default-table-cell ${h.sort && 'with-sort'} ${h.search && 'with-search'}`}
                  >
                    <div class="apptimizm-ui-default-table-header-cell-inner">
                      { h.sort && (<div class="apptimizm-ui-default-table-cell-sort" onClick={() => setSort(String(h.sort))}/>) }
                      { h.search ? renderSearchHeader(h) : h.name }
                    </div>
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
