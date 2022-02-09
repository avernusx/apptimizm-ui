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

export enum SearchTypes { String, Relation, MultipleRelation, Daterange, Select, Boolean }

export interface DefaultTableExposed {
  load: () => void,
  reload: () => void,
  loadNext: () => void,
  loadPrev: () => void,
  loadPage: (i: number) => void,
  isLoading: boolean,
  items: any[],
  page: number,
  pages: number,
  count: number,
  remove: (id: string) => void
}

type TableParamElement = { id: string, name: string }

export type TableHeader = {
  name: string,
  search?: string,
  searchType?: SearchTypes
  endpoint?: string
  itemConverter?: (v: any) => TableParamElement
  sort?: string,
  minWidth?: string
}

type TableFilter = { name: string, key: string, value: string, id: string }

class TableParam {
  name: string = ''

  constructor (header: TableHeader) {
    this.name = header.name
  }

  getQueryParams (): { [code: string]: string } {
    return {}
  }

  getFilters (): TableFilter[] {
    return []
  }

  isSet (): boolean {
    return false
  }

  reset (filter?: TableFilter) {}
}

class TableParamString extends TableParam {
  value: string = ''
  search: string = ''

  constructor (header: TableHeader) {
    super(header)
    if (!header.search) throw new Error(`Вызван конструктор TableParamString для заголовка ${header.name} без поля search`)
    this.search = header.search
  }

  getQueryParams (): { [code: string]: string } {
    const params: { [code: string]: string } = {}
    params[this.search] = this.value
    return params
  }

  getFilters (): TableFilter[] {
    return [
      {
        name: this.name,
        key: this.search,
        value: this.value,
        id: this.value
      }
    ]
  }

  isSet () {
    return this.value.length > 0
  }

  reset (filter?: TableFilter) {
    this.value = ''
  }
}

class TableParamObject extends TableParam {
  value: TableParamElement = { id: '', name: '' }
  search: string = ''

  constructor (header: TableHeader) {
    super(header)
    if (!header.search) throw new Error(`Вызван конструктор TableParamObject для заголовка ${header.name} без поля search`)
    this.search = header.search
  }

  getQueryParams (): { [code: string]: string } {
    const params: { [code: string]: string } = {}
    params[this.search] = this.value.id
    return params
  }

  getFilters (): TableFilter[] {
    return [
      {
        name: this.name,
        key: this.search,
        value: this.value.name,
        id: this.value.id
      }
    ]
  }

  isSet () {
    return this.value.id.length > 0
  }

  reset (filter?: TableFilter) {
    this.value = { id: '', name: '' }
  }
}

class TableParamArray extends TableParam {
  value: TableParamElement[] = []
  search: string = ''

  constructor (header: TableHeader) {
    super(header)
    if (!header.search) throw new Error(`Вызван конструктор TableParamArray для заголовка ${header.name} без поля search`)
    this.search = header.search
  }

  getQueryParams (): { [code: string]: string } {
    const params: { [code: string]: string } = {}
    params[this.search] = this.value.map(e => e.id).join(',')
    return params
  }

  getFilters (): TableFilter[] {
    return this.value.map(item => (
      {
        name: this.name,
        key: this.search,
        value: item.name,
        id: item.id
      }
    ))
  }

  isSet () {
    return this.value.length > 0
  }

  reset (filter?: TableFilter) {
    if (filter !== undefined) {
      const element = this.value.find(e => e.id === filter.id)
      if (element) this.value.splice(this.value.indexOf(element), 1)
      return
    }

    this.value = []
  }
}

class TableParamDaterange extends TableParam {
  dateFrom: Moment|null = null
  dateTo: Moment|null = null
  searchFrom: string = ''
  searchTo: string = ''
  search: string = ''

  constructor (header: TableHeader) {
    super(header)
    if (!header.search) throw new Error(`Вызван конструктор TableParamArray для заголовка ${header.name} без поля search`)
    const searches = header.search.split('/')
    if (searches.length < 2) throw new Error(`Неверный формат поля search для заголовка ${header.name}: должно быть два ключа, разделенных /`)
    this.searchFrom = searches[0]
    this.searchTo = searches[1]
    this.search = header.search
  }

  getQueryParams (): { [code: string]: string } {
    const params: { [code: string]: string } = {}
    if (this.dateFrom !== null) params[this.searchFrom] = this.dateFrom.format('YYYY-MM-DD')
    if (this.dateTo !== null) params[this.searchTo] = this.dateTo.format('YYYY-MM-DD')
    return params
  }

  getFilters (): TableFilter[] {
    const params: TableFilter[] = []

    if (this.dateFrom !== null) {
      params.push({
        name: this.name,
        key: this.search,
        value: this.dateFrom.format('YYYY-MM-DD'),
        id: 'dateFrom'
      })
    }

    if (this.dateTo !== null) {
      params.push({
        name: this.name,
        key: this.search,
        value: this.dateTo.format('YYYY-MM-DD'),
        id: 'dateTo'
      })
    }

    return params
  }

  isSet () {
    return this.dateFrom !== null || this.dateTo !== null
  }

  reset (filter?: TableFilter) {
    console.log(filter)
    if (filter !== undefined) {
      if (filter.id === 'dateFrom') this.dateFrom = null
      if (filter.id === 'dateTo') this.dateTo = null
      return
    }

    this.dateFrom = null
    this.dateTo = null
  }
}

class TableParamBoolean extends TableParam {

}

function paramIsString (param: TableParam): param is TableParamString {
  return param instanceof TableParamString
}

function paramIsDaterange (param: TableParam): param is TableParamDaterange {
  return param instanceof TableParamDaterange
}

function paramIsObject (param: TableParam): param is TableParamObject {
  return param instanceof TableParamObject
}

function paramIsArray (param: TableParam): param is TableParamArray {
  return param instanceof TableParamArray
}

function paramIsBoolean (param: TableParam): param is TableParamBoolean {
  return param instanceof TableParamBoolean
}

type TableParams = {
  [ code: string ]: TableParam
}

export type TableContext = {
  remove: (id: string) => void
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
  setup (props, app) {
    const trigger = ref(null) as unknown as Ref<HTMLElement>

    const params: Ref<TableParams> = ref({})

    // Инициализуем пустые типы внутренних фильтров таблицы (при создании компонента и сбросе фильтров)
    const setDefaultParams = (reset = true) => {
      // флаг reset отвечает за то, чтобы сбросить все фильтры в начальное состояние или только проинициализовать новые
      props.headers.filter(h => h.search).forEach(h => {
        if (!h.search) return
        if (!reset && params.value[h.search]) return
        if (h.searchType === SearchTypes.String) params.value[h.search] = new TableParamString(h)
        if (h.searchType === SearchTypes.Relation) params.value[h.search] = new TableParamObject(h)
        if (h.searchType === SearchTypes.MultipleRelation) params.value[h.search] = new TableParamArray(h)
        if (h.searchType === SearchTypes.Boolean) params.value[h.search] = new TableParamBoolean(h)
        if (h.searchType === SearchTypes.Daterange) params.value[h.search] = new TableParamDaterange(h)
      })
    }

    setDefaultParams()

    watch(() => props.headers, () => setDefaultParams(false))

    const perPage = ref(props.perPage)

    // Превращаем внутренние фильтры таблицы и внешний defaultFilter в параметры запроса на бек
    const queryParams = computed(() => {
      let resultParams: { [code: string]: string} = {}

      for (const key in params.value) {
        if (params.value[key].isSet()) resultParams = { ...resultParams, ...params.value[key].getQueryParams() }
      }

      return { ...props.defaultFilter, ...resultParams }
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
      let filters: TableFilter[] = []

      for (const key in params.value) {
        if (params.value[key].isSet()) filters = [...filters, ...params.value[key].getFilters()]
      }

      return filters
    })

    const resetFilter = (filter: TableFilter) => {
      const param = params.value[filter.key]

      if (!param) return

      param.reset(filter)

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

    app.expose({ load, reload, loadNext, loadPrev, loadPage, isLoading, items, page, pages, count, remove })

    return () => {
      const renderSearchString = (header: TableHeader) => {
        const param = getTableSearchParam(header)
        if (!paramIsString(param)) throw new Error(`Тип поиска в заголовке ${header.name} не совпадает с типом параметра во внутреннем состоянии таблицы`)

        const setFilter = (e: Event) => {
          param.value = (e.target as HTMLInputElement).value
          reload()
        }

        return (
          <input
            class="apptimizm-ui-default-table-search-string"
            value={String(param)}
            onInput={setFilter}
            placeholder={header.name}
          />
        )
      }

      const renderSearchRelation = (header: TableHeader) => {
        if (!header.endpoint) throw new Error(`Не задан endpoint для заголовка ${header.name}`)
        if (!header.itemConverter) throw new Error(`Не задана функция itemConverter для заголовка ${header.name}`)
        const param = getTableSearchParam(header)
        if (!paramIsObject(param)) throw new Error(`Тип поиска в заголовке ${header.name} не совпадает с типом параметра во внутреннем состоянии таблицы`)

        const setFilter = (e: TableParamElement) => {
          param.value = e
          reload()
        }

        return (
          <RelationSelect
            axios={props.axios}
            endpoint={header.endpoint}
            itemConverter={header.itemConverter}
            modelValue={param.value}
            onValueChange={setFilter}
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

        const setFilter = (e: TableParamElement[]) => {
          param.value = e
          reload()
        }

        return (
          <MultipleRelationSelect
            axios={props.axios}
            endpoint={header.endpoint}
            itemConverter={header.itemConverter}
            modelValue={param.value}
            onValueChange={setFilter}
            placeholder={header.name}
            constantPlaceholder={false}
            params={getSmartFilterParams(String(header.search), smartFilterParams.value)}
            paginationType={props.paginationType}
          />
        )
      }

      const renderSearchDaterange = (header: TableHeader) => {
        // if (!header.search) return (<div/>)
        const param = getTableSearchParam(header)
        if (!paramIsDaterange(param)) throw new Error(`Тип поиска в заголовке ${header.name} не совпадает с типом параметра во внутреннем состоянии таблицы`)

        const setFilterFrom = (date: Moment|null) => {
          param.dateFrom = moment(date)
          reload()
        }

        const setFilterTo = (date: Moment|null) => {
          param.dateTo = moment(date)
          reload()
        }

        return (
          <div class="apptimizm-ui-default-table-filter-calendar">
            { (param.dateFrom || param.dateTo) ? (
              <div class="apptimizm-ui-default-table-filter-calendar-date">
                { param.dateFrom?.format('DD.MM.YYYY') } - { param.dateTo?.format('DD.MM.YYYY') }
              </div>
            ) : (
              <div class="apptimizm-ui-default-table-filter-calendar-date">
                { header.name }
              </div>
            ) }
            <div class="apptimizm-ui-default-table-filter-calendar-area">
              <PeriodCalendar
                onSetStart={setFilterFrom}
                onSetEnd={setFilterTo}
                start={param.dateFrom}
                end={param.dateTo}
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
                    style={h.minWidth ? `min-width: ${h.minWidth}` : ''}
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
