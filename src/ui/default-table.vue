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
    const params = {
      ...this.getFilter(),
      per_page: this.perPage,
      page: this.page
    }
    // if (this.sort) params.ordering = this.sort
    this.isLoading = true
    const response = (await this.axios.get(this.endpoint, { params })).data
    this.count = response[this.responseTotalKey]
    this.items = response[this.responseItemsKey].map((i: any) => this.itemConverter(i))
    this.pages = Math.ceil(this.count / this.perPage)
    this.isLoading = false
    this.$forceUpdate()
  }, 500)

  getFilter () {
    const params = {} as { [code: string] : string }
    for (const key in this.params) {
      if (this.params[key] !== '') params[key] = this.params[key]
    }
    return params
  }

  async created () {
    this.headers.filter(h => h.search).forEach(h => { h.search && (this.params[h.search] = '') })
    await this.load()
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
        <table class="default-table">
          <thead>
            { this.headers.map((h: TableHeader) => (
              <td class={h.search ? 'search' : ''}>
                {
                  h.search
                    ? <input class="table-input" type="text" value={this.params[h.search]} placeholder={h.name} onInput={(e: any) => { h.search && (this.params[h.search] = e.target?.value); this.loadPage(1) }}/>
                    : h.name
                }
              </td>
            )) }
          </thead>
          <tbody>
            { this.items.map((item: any) => this.line(item)) }
          </tbody>
        </table>
        <div class="default-table-footer">
          { this.pages > 1 && <PaginationElement page={this.page} pages={this.pages} onEvents={true} onPageChange={(i) => this.loadPage(i)}/> }
          { this.add && <div class="default-table-buttons">
            <router-link to={this.add} class="default-table-add-button">Добавить</router-link>
          </div> }
        </div>
      </div>
    )
  }
}
</script>
