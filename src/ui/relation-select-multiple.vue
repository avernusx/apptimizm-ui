<script lang="tsx">
import { Vue, Options, prop } from 'vue-class-component'
import debounce from 'lodash/debounce'
import LineLoader from './line-loader-small.vue'
import RadioButton from './radio-button.vue'
import IAxiosInterface from '../IAxiosInterface'

class Props {
  axios = prop<IAxiosInterface>({ required: true })
  endpoint = prop<string>({ default: '' })
  modelValue = prop<any[]>({ default: () => [] })
  onValueChange = prop<(v: any[]) => void>({})
  ordering = prop<string>({ default: 'name' })
  params = prop<{ [code: string] : string|number|boolean }>({ default: () => ({}) })
  placeholder = prop<string>({})
  responseItemsKey = prop<string>({ default: 'items' })
  responseTotalKey = prop<string>({ default: 'total' })
  searchKey = prop<string>({ default: 'search' })
  titleKey = prop<string>({ default: 'name' })
  errors = prop<string[]>({ default: () => [] })
}

Options({
  watch: {
    params () {
      this.reload()
    }
  }
})
export default class ListSelect extends Vue.with(Props) {
  items: any[] = []
  page = 0
  pages = 0
  perPage = 20
  count = 0
  search = ''
  observer?: IntersectionObserver
  isLoading = false
  requestId?: number
  isActive = false
  load = debounce(async function (this: ListSelect) {
    if ((this.items.length === this.count && this.count !== 0) || this.isLoading) return
    this.isLoading = true
    this.requestId = +new Date()
    const id = this.requestId
    const params = { ...this.params, limit: this.perPage, offset: this.page * this.perPage, ordering: this.ordering } as { [code: string] : string | number }
    params[this.searchKey] = this.search
    const response = (await this.axios.get(this.endpoint, { params })).data
    if (id !== this.requestId) return
    this.items = [...this.items, ...response[this.responseItemsKey]]
    this.count = response[this.responseTotalKey]
    this.pages = Math.ceil(response[this.responseTotalKey] / this.perPage)
    this.isLoading = false
  }, 500)

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

    document.addEventListener('click', (event: MouseEvent) => {
      this.isActive = false
    })
  }

  beforeDestroy () {
    this.observer && this.observer.disconnect()
  }

  render () {
    const selectedCard = (item: any) => {
      return (
        <div class="selected-card" onClick={() => this.toggleItem(item)}>
          { item[this.titleKey] }
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M9.35355 2.64645C9.54882 2.84171 9.54882 3.15829 9.35355 3.35355L3.35355 9.35355C3.15829 9.54882 2.84171 9.54882 2.64645 9.35355C2.45118 9.15829 2.45118 8.84171 2.64645 8.64645L8.64645 2.64645C8.84171 2.45118 9.15829 2.45118 9.35355 2.64645Z" fill="#242A2F"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M2.64645 2.64645C2.84171 2.45118 3.15829 2.45118 3.35355 2.64645L9.35355 8.64645C9.54882 8.84171 9.54882 9.15829 9.35355 9.35355C9.15829 9.54882 8.84171 9.54882 8.64645 9.35355L2.64645 3.35355C2.45118 3.15829 2.45118 2.84171 2.64645 2.64645Z" fill="#242A2F"/>
          </svg>
        </div>
      )
    }

    const itemCard = (item: any) => {
      return (
        <div class="item" onClick={() => this.toggleItem(item)}>
          <RadioButton modelValue={this.modelValue.find((i: any) => i.id === item.id)} onClick={() => {}}/>
          <span>{ item[this.titleKey] }</span>
        </div>
      )
    }

    return (
      <div class={this.isActive ? 'relation-select-multiple opened' : 'relation-select-multiple'} onClick={(event: Event) => event.stopPropagation()}>
        <svg class="dropdown-arrow" onClick={() => { this.isActive = !this.isActive }} width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M4.19013 6.56522C4.49929 6.25605 5.00055 6.25605 5.30971 6.56522L9.49992 10.7554L13.6901 6.56522C13.9993 6.25605 14.5005 6.25605 14.8097 6.56522C15.1189 6.87438 15.1189 7.37564 14.8097 7.6848L10.0597 12.4348C9.75055 12.744 9.24929 12.744 8.94013 12.4348L4.19013 7.6848C3.88096 7.37564 3.88096 6.87438 4.19013 6.56522Z" fill="#9DA6B6"/>
        </svg>
        { this.isActive ? <input type='text' value={this.search} onInput={(v: Event) => { this.search = (v.target as HTMLFormElement).value; this.reload() }}/>
          : (
            <div class="selected-list-short" onClick={() => { this.isActive = true }}>
              <span class="and-more">всего { this.modelValue.length }</span>
              { this.modelValue.map((item: any) => selectedCard(item)) }
            </div>
          )
        }
        { this.placeholder && <div class="placeholder">{this.placeholder}</div> }
        <div class="dropdown" style={this.isActive ? 'display: block;' : 'display: none;'}>
          { this.isLoading && <LineLoader/> }
          { Boolean(this.modelValue.length) && <div class="selected-list">
            { this.modelValue.map((item: any) => selectedCard(item))}
          </div> }
          <div class="items-list">
            { this.items.map((item: any) => itemCard(item)) }
            <div ref="lazyLoadTrigger"/>
          </div>
        </div>
        { this.errors.map(error => <div class="error">{error}</div>) }
      </div>
    )
  }
}
</script>

<style lang="sass" scoped>
@import '../variables.sass'

.relation-select-multiple
  background: white
  position: relative
  &.opened
    input
      border-bottom-left-radius: 0px
      border-bottom-right-radius: 0px
    .dropdown
      border-top-left-radius: 0px
      border-top-right-radius: 0px
    .dropdown-arrow
      transform: rotate(180deg)
  input
    background: white
    border: 1px solid $border-light-gray
    border-radius: 0.5*$step
    box-sizing: border-box
    font-size: 14px
    height: 5*$step
    line-height: 3*$step
    padding: $step 2*$step
    width: 100%
  .placeholder
    background: white
    color: $placeholder-gray
    font-size: 12px
    left: 2*$step
    position: absolute
    top: -$step
    &.transparent
      background: none
  &.with-errors
    input
      border: 1px solid $error-color
    .placeholder
      color: $error-color
  .error
    color: $error-color
    font-size: 12px
    line-height: 24px
    height: 24px
  .dropdown-arrow
    cursor: pointer
    right: 8px
    top: 12px
    position: absolute
  .dropdown
    background: white
    border: 1px solid $border-light-gray
    border-top: none
    border-radius: 0.5*$step
    box-sizing: border-box
    position: absolute
    top: 5*$step
    width: 100%
    z-index: 100
  .selected-card
    background: $primary-color
    cursor: pointer
    display: inline-block
    padding: 2px 8px
    border-radius: 4px
    font-size: 12px
    margin-right: 0.5*$step
    margin-bottom: 0.5*$step
  .selected-list-short
    border: 1px solid $border-light-gray
    border-radius: 0.5*$step
    box-sizing: border-box
    cursor: pointer
    font-size: 14px
    height: 5*$step
    line-height: 3*$step
    overflow: hidden
    padding: $step 2*$step
    width: 100%
    .and-more
      float: right
      margin-right: 16px
      font-size: 14px
  .selected-list
    border-bottom: 1px solid $border-light-gray
    padding: $step 2*$step
    .selected-card
      height: 3*$step
      line-height: 3*$step
  .items-list
    height: 250px
    overflow-y: scroll
    .item
      cursor: pointer
      display: flex
      padding: $step 2*$step
      &:hover
        background: #f0f0f0
      span
        display: inline-block
        margin-left: $step
</style>
