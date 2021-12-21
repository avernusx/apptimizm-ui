<script lang="tsx">
import { Vue, prop } from 'vue-class-component'
import { LocationAsRelativeRaw } from 'vue-router'
import debounce from 'lodash/debounce'
import PaginationElement from './pagination-element.vue'
import IAxiosInterface from '../IAxiosInterface'

type TableHeader = {
  name: string,
  search?: string
}

class Props {
  add = prop<LocationAsRelativeRaw>({ default: undefined })
  axios = prop<IAxiosInterface>({ required: true })
  itemConverter = prop<(item: any) => any>({ default: () => (item: any) => item })
  scrollPagination = prop<boolean>({ default: false })
  gap = prop<boolean>({ default: false })
  additionalButtons? = prop<(c: DefaultTable) => JSX.Element>({})
  paginationType = prop<string>({ default: 'page' })

  defaultFilter = prop({
    type: Object,
    default: () => ({})
  })

  endpoint = prop({
    type: String,
    required: true
  })

  headers = prop<TableHeader[]>({ default: [] })

  line = prop({
    type: Function,
    required: true
  })

  perPage = prop({
    type: Number,
    default: 10
  })

  responseItemsKey = prop({
    type: String,
    default: 'items'
  })

  responseTotalKey = prop({
    type: String,
    default: 'total'
  })

  searchKey = prop({
    type: String,
    default: 'search'
  })
}

export default class DefaultTable extends Vue.with(Props) {
  isLoading = false
  pages = 1
  page = 1
  count = 0
  items: any[] = []
  params: { [code: string]: string } = {}
  debouncedLoad = debounce(async function (this: DefaultTable) {
    const params = (this.paginationType === 'page' ? {
      ...this.getFilter(),
      per_page: this.perPage,
      page: this.page
    } : {
      ...this.getFilter(),
      limit: this.perPage,
      offset: (this.page - 1) * this.perPage
    })
    // if (this.sort) params.ordering = this.sort
    this.isLoading = true
    const response = (await this.axios.get(this.endpoint, { params })).data
    this.count = response[this.responseTotalKey]
    const items = response[this.responseItemsKey].map((i: any) => this.itemConverter(i))
    this.items = this.scrollPagination ? [...this.items, ...items] : items
    this.pages = Math.ceil(this.count / this.perPage)
    this.isLoading = false
    this.$forceUpdate()
  }, 500)

  getFilter () {
    const params = {} as { [code: string] : string }
    for (const key in this.defaultFilter) {
      if (this.defaultFilter[key] !== '') params[key] = this.defaultFilter[key]
    }
    for (const key in this.params) {
      if (this.params[key] !== '') params[key] = this.params[key]
    }
    return params
  }

  async created () {
    this.$watch('headers', () => { this.loadPage(1) })
    this.$watch('defaultFilter', () => { this.loadPage(1) })

    this.headers.filter(h => h.search).forEach(h => { h.search && (this.params[h.search] = '') })
    await this.load()
  }

  mounted () {
    if (!this.scrollPagination) return
    const observer = new IntersectionObserver((entries) => {
      if (this.page < this.pages && entries[0].isIntersecting && !this.isLoading) {
        this.loadPage(this.page + 1)
      }
    }, {
      threshold: 0
    })
    observer.observe(this.$refs.lazyLoadTrigger as HTMLElement)
  }

  load () {
    this.debouncedLoad()
  }

  loadPage (i: number) {
    this.page = i
    this.load()
  }

  async delete (item: any) {
    if (!item.getSlugField()) return
    await this.axios.delete(this.endpoint + '/' + item.getSlugField())
    this.loadPage(this.page)
  }

  render () {
    return (
      <div>
        <div class="apptimizm-ui-default-table">
          <div class="apptimizm-ui-default-table-head">
            <div class="apptimizm-ui-default-table-row">
              { this.headers.map((h: TableHeader) => (
                <div class={h.search ? 'search apptimizm-ui-default-table-cell' : 'apptimizm-ui-default-table-cell'}>
                  {
                    h.search
                      ? <input class="table-input" type="text" value={this.params[h.search]} placeholder={h.name} onInput={(e: any) => { h.search && (this.params[h.search] = e.target?.value); this.loadPage(1) }}/>
                      : h.name
                  }
                </div>
              )) }
            </div>
          </div>
          { this.gap && <div class="apptimizm-ui-default-table-gap"/> }
          <div class="apptimizm-ui-default-table-body">
            { this.items.map((item: any) => this.line(item)) }
          </div>
        </div>
        <div class="apptimizm-ui-default-table-footer">
          { this.scrollPagination && <div class="lazy-load-trigger" ref="lazyLoadTrigger"/> }
          { !this.scrollPagination && this.pages > 1 && <PaginationElement page={this.page} pages={this.pages} onEvents={true} onPageChange={(i) => this.loadPage(i)}/> }
          <div class="default-table-buttons">
            { this.additionalButtons && this.additionalButtons(this) }
            { this.add && <router-link to={this.add} class="default-table-add-button">Добавить</router-link> }
          </div>
        </div>
      </div>
    )
  }
}
</script>

<style lang="sass">
.apptimizm-ui-default-table
  display: table
.apptimizm-ui-default-table-head
  display: table-header-group
.apptimizm-ui-default-table-gap
  display: table-row
.apptimizm-ui-default-table-body
  display: table-row-group
.apptimizm-ui-default-table-row
  display: table-row
.apptimizm-ui-default-table-cell
  display: table-cell
</style>
