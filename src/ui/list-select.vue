<script lang="tsx">
import { Vue, Options, prop } from 'vue-class-component'
import debounce from 'lodash/debounce'
import DefaultInput from './default-input.vue'
import LineLoader from './line-loader-small.vue'
import RadioButton from './radio-button.vue'
import IAxiosInterface from '@/IAxiosInterface'

class Props {
  axios = prop<IAxiosInterface>({ required: true })

  endpoint = prop({
    type: String,
    default: null
  })

  modelValue = prop({
    type: Array,
    default: () => []
  })

  onValueChange = prop({
    type: Function
  })

  ordering = prop({
    type: String,
    default: 'name'
  })

  params = prop({
    type: Object,
    default: () => { return {} }
  })

  placeholder = prop({
    type: String,
    default: ''
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

  titleKey = prop({
    type: String,
    default: 'name'
  })
}

export default class ListSelect extends Vue.with(Props) {
  items: any[] = []
  page = 0
  pages = 0
  perPage = 20
  count = 0
  search = ''
  observer?: IntersectionObserver
  loading = false
  requestId?: number
  loadingAll = false
  load = debounce(async function (this: ListSelect) {
    if ((this.items.length === this.count && this.count !== 0) || this.loading) return
    this.loading = true
    this.requestId = +new Date()
    const id = this.requestId
    const params = { ...this.params, limit: this.perPage, offset: this.page * this.perPage, ordering: this.ordering }
    params[this.searchKey] = this.search
    const response = (await this.axios.get(this.endpoint, { params })).data
    if (id !== this.requestId) return
    this.items = [...this.items, ...response[this.responseItemsKey]]
    this.count = response[this.responseTotalKey]
    this.pages = Math.ceil(response[this.responseTotalKey] / this.perPage)
    this.loading = false
  }, 500)

  async selectAll () {
    if (this.loadingAll) return
    this.loading = true
    this.loadingAll = true
    this.requestId = +new Date()
    const params = { ...this.params, limit: 99999, offset: 0, ordering: this.ordering }
    params[this.searchKey] = this.search
    const response = (await this.axios.get(this.endpoint, { params })).data
    this.items = response[this.responseItemsKey]
    this.count = response[this.responseTotalKey]
    this.page = Math.ceil(this.count / this.perPage)
    this.pages = Math.ceil(this.count / this.perPage)
    this.loading = false
    this.loadingAll = false
    this.$emit('input', [...this.items])
    this.$emit('update:modelValue', [...this.items])
    this.onValueChange && this.onValueChange([...this.items])
  }

  deselectAll () {
    this.$emit('input', [])
    this.$emit('update:modelValue', [])
    this.onValueChange && this.onValueChange([])
  }

  toggleItem (item: any) {
    !this.modelValue.find((i: any) => i.id === item.id) ? this.select(item) : this.deselect(item)
  }

  select (item: any) {
    this.modelValue.push(item)
    this.$emit('input', this.modelValue)
    this.$emit('update:modelValue', this.modelValue)
    this.onValueChange && this.onValueChange(this.modelValue)
  }

  deselect (item: any) {
    item = this.modelValue.find((i: any) => i.id === item.id)
    this.modelValue.splice(this.modelValue.indexOf(item), 1)
    this.$emit('input', this.modelValue)
    this.$emit('update:modelValue', this.modelValue)
    this.onValueChange && this.onValueChange(this.modelValue)
  }

  reload () {
    this.items = []
    this.page = 0
    this.pages = 0
    this.load()
  }

  created () {
    this.$watch('params', () => {
      this.reload()
    })
  }

  mounted () {
    this.load()

    const observer = new IntersectionObserver((entries) => {
      if (this.page < this.pages && entries[0].isIntersecting) {
        this.page++
        this.load()
      }
    }, {
      threshold: 0,
      root: this.$refs.resultsList as Element
    })

    this.$nextTick(() => {
      observer.observe(this.$refs.lazyLoadTrigger as Element)
      this.observer = observer
    })
  }

  beforeDestroy () {
    this.observer && this.observer.disconnect()
  }

  render () {
    const renderItemsList = (list: any[], source: boolean) => {
      return (
        <div class="items">
          { source && this.loading && <LineLoader/> }
          <div class="items-frame" ref={ source ? 'resultsList' : 'nullRef' }>
            { list.map((item: any) => (
              <div class="item" onClick={() => this.toggleItem(item)}>
                <RadioButton modelValue={source ? Boolean(this.modelValue.find((i: any) => i.id === item.id)) : true }/>
                <span>{ item[this.titleKey] }</span>
              </div>
            )) }
            { source && <div class="lazy-load-trigger" ref="lazyLoadTrigger"/> }
          </div>
        </div>
      )
    }

    return (
      <div class="list-select">
        <div class="list-select-column">
          <div class="search">
            <DefaultInput placeholder={this.placeholder} modelValue={this.search} onValueChange={(v) => { this.search = v; this.reload() }}/>
          </div>
          { renderItemsList(this.items, true) }
        </div>
        <div class="list-select-column">
          <div class="title-all">
            <div class="title">Выбрано</div>
            <div class="count">{ this.modelValue.length }</div>
            <div class="buttons"></div>
          </div>
          { renderItemsList(this.modelValue, false) }
        </div>
      </div>
    )
  }
}
</script>

<style lang="sass" scoped>
@import '../variables.sass'

.list-select
  display: flex
  justify-content: space-between
  .list-select-column
    width: calc(50% - 9px)
.title-all
  .title
    display: inline-block
    font-weight: bold
    font-size: 14px
    padding-left: 38px
    height: 38px
    line-height: 38px
  .count
    background: $primary-color
    border-radius: 0.5*$step
    color: white
    font-weight: bold
    display: inline-block
    margin-left: 3*$step
    padding: 3px 8px
    text-align: center
    line-height: 20px
.buttons
  float: right
  display: flex
.items
  background: white
  border: 1px solid #f2f3f5
  border-radius: 5px
  margin-top: 15px
.items-frame
  height: 315px
  max-height: 315px
  min-height: 315px
  overflow-y: scroll
.item
  padding: 15px
  display: flex
  align-items: center
  cursor: pointer
  span
    display: inline-block
    margin-left: 16px
</style>
