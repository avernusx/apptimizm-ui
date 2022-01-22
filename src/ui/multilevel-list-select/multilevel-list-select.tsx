import { Vue, prop } from 'vue-class-component'
import DefaultSelect from '../default-select.vue'
import DefaultInput from '../default-input.vue'
import RadioButton from '../radio-button.vue'
import TernaryRadioButton, { TernaryModes } from '../ternary-radio-button/ternary-radio-button'
import LineLoader from '../line-loader-small.vue'
import debounce from 'lodash/debounce'
import IAxiosInterface from '../../IAxiosInterface'

import './multilevel-list-select.sass'

export type SearchType = { id: string, name: string }

export class IMultilevelListSelect {
  name = prop<string>({ required: true })
  searchTypes = prop<SearchType[]>({ required: true })
  selectedCount = prop<number>({ required: true })
  defaultSlot = prop<Function>({ required: true })
}

class MultilevelListSelect extends Vue.with(IMultilevelListSelect) {
  justSelected: boolean = false

  search: string = ''
  searchType: SearchType = { id: '', name: '' }

  render () {
    return (
      <div class="ark-ui-multilevel-list-select">
        <div class="ark-ui-multilevel-list-select-header-area">
          <div class="ark-ui-multilevel-list-select-header">{ this.name }</div>
          <div class="ark-ui-multilevel-list-select-selected">
            <div>Выбрано: { this.selectedCount }</div>
            <div>
              <RadioButton modelValue={this.justSelected} onClick={() => { this.justSelected = !this.justSelected }}/> Показать выбранные
            </div>
          </div>
        </div>
        <div class="ark-ui-multilevel-list-select-workarea">
          <div class="ark-ui-multilevel-list-select-search">
            <DefaultInput
              modelValue={this.search}
              onValueChange={(search: string) => { this.search = search }}
              // resetable={true}
            />
            { this.searchTypes && this.searchTypes.length > 1 && (
              <DefaultSelect
                items={this.searchTypes}
                modelValue={this.searchType}
                onValueChange={(type: SearchType) => { this.searchType = type }}
              />
            ) }
          </div>
          <div class="ark-ui-multilevel-list-select-workarea-scroll">
            { this.defaultSlot && this.defaultSlot({ search: this.search, searchType: this.searchType, justSelected: this.justSelected }) }
          </div>
        </div>
      </div>
    )
  }
}

export type ListItem = {
  id: string,
  name: string
}

export class TreeNode {
  item!: ListItem
  nodes: TreeNode[] = []
  parent?: TreeNode
  isExpanded: boolean = false
  isSelected: boolean = false

  childSelectListeners: Array<() => void> = []

  constructor (item: ListItem) {
    this.item = item
  }

  addNode (node: TreeNode) {
    // не добавляем дублирующиеся узлы
    if (this.nodes.find(n => n.item.id === node.item.id)) return
    this.nodes.push(node)
    node.parent = this
  }

  addNodes (nodes: TreeNode[]) {
    nodes.forEach(node => this.addNode(node))
  }

  getSelectedCount (): number {
    return Number(this.isSelected) + this.nodes.reduce((acc: number, node) => acc + node.getSelectedCount(), 0)
  }

  hasSelectedChildren (): boolean {
    return this.nodes.reduce((acc: boolean, node) => acc || node.isSelected || node.hasSelectedChildren(), false)
  }

  onChildSelect (listener: () => void) {
    this.childSelectListeners.push(listener)
  }

  removeChildSelect (listener: () => void) {
    this.childSelectListeners.splice(this.childSelectListeners.indexOf(listener), 1)
  }

  selectAll () {
    this.isSelected = true
    this.nodes.forEach(node => node.selectAll())
  }

  triggerChildSelect () {
    this.childSelectListeners.forEach(listener => listener())
    this.parent?.triggerChildSelect()
  }

  toggleSelected () {
    this.isSelected = !this.isSelected
    this.parent?.triggerChildSelect()
  }
}

export class IListSelectArea {
  apiService = prop<IAxiosInterface>({ required: true })
  responseItemsKey = prop<string>({ default: 'results' })
  responseTotalKey= prop<string>({ default: 'count' })
  parentKey = prop<string>({ default: '' })
  searchString = prop<string>({ default: '' })
  searchKey = prop<string>({ default: 'search' })
  endpoint = prop<string>({ required: true })
  justSelected = prop<boolean>({ default: false })
  loadOnMounted = prop<boolean>({ default: false })
  node = prop<TreeNode>({ required: true })
  shadowNode = prop<TreeNode>({ required: true })
  defaultSlot? = prop<Function>({})
}

class ListSelectArea extends Vue.with(IListSelectArea) {
  page = 0
  pages = 0
  perPage = 20
  count = 0
  observer?: IntersectionObserver
  isLoading = false
  expanded: ListItem[] = []

  load = debounce(async function (this: ListSelectArea) {
    if ((this.node.nodes.length === this.count && this.count !== 0) || this.isLoading) return
    this.isLoading = true

    const params: { [code: string] : string } = { limit: String(this.perPage), offset: String(this.page * this.perPage) }

    if (this.parentKey) params[this.parentKey] = this.node.item.id
    if (this.searchString && this.searchKey) params[this.searchKey] = this.searchString
    const response = (await this.apiService.get(this.endpoint, { params })).data

    // конвертируем элементы с бека в узлы дерева
    const treeNodeItems: TreeNode[] = response[this.responseItemsKey].map((item: ListItem) => new TreeNode(item))

    // добавляем новые узлы в теневое дерево
    this.shadowNode.addNodes(treeNodeItems.map(node => new TreeNode(node.item)))
    
    // обогащаем узлы видимого древа сохраненными данными о выбранных и открытых узлах из теневого дерева
    treeNodeItems.forEach(node => {
      const shadowNode = this.findShadowNode(node)
      if (shadowNode) {
        node.isSelected = shadowNode.isSelected
        node.isExpanded = shadowNode.isExpanded
      }
    })

    this.node.addNodes(treeNodeItems)

    this.count = response[this.responseTotalKey]
    this.pages = Math.ceil(response[this.responseTotalKey] / this.perPage)
    this.isLoading = false
  }, 500)

  findShadowNode (node: TreeNode) {
    return this.shadowNode.nodes.find(shadowNode => shadowNode.item.id === node.item.id)
  }

  mounted () {
    this.$watch('searchString', () => {
      this.node.nodes.splice(0,)
      this.page = 0
      this.load()
    })
    this.$nextTick(() => {
      let root = this.$el

      while (root.className !== 'ark-ui-multilevel-list-select-workarea-scroll') {
        if (root.parentElement === null) break
        root = root.parentElement
      }

      const observer = new IntersectionObserver((entries) => {
        if (this.page < this.pages && entries[0].isIntersecting && !this.justSelected) {
          this.page++
          this.load()
        }
      }, {
        threshold: 0,
        root
      })

      observer.observe(this.$refs.trigger as HTMLElement)
      this.observer = observer
    })

    this.load()

    this.node.onChildSelect(() => { 
      this.$forceUpdate()
    })
  }

  get displayedItems () {
    return this.justSelected
      ? this.shadowNode.nodes.filter(node => node.isSelected || node.hasSelectedChildren())
      : this.node.nodes
  }

  render () {
    return (
      <div class="ark-ui-multilevel-list-select-area">
        { this.displayedItems.map((item: TreeNode) => {
          const shadowNode = this.findShadowNode(item)

          if (!shadowNode) {
            throw new Error('Не найден теневой узел дерева')
          }

          const toggleExpanded = (node: TreeNode) => { 
            node.isExpanded = !node.isExpanded
            shadowNode.isExpanded = !shadowNode.isExpanded
          }

          const toggleSelected = (node: TreeNode) => { 
            node.toggleSelected()
            const shadowNode = this.findShadowNode(node)
            if (shadowNode) shadowNode.toggleSelected()
          }
          
          let ternaryMode: TernaryModes = TernaryModes.NONE

          if (shadowNode && shadowNode.hasSelectedChildren()) ternaryMode = TernaryModes.SOME
          if (item.isSelected) ternaryMode = TernaryModes.ALL

          return (
            <div class="ark-ui-multilevel-list-select-item">
              <div class="ark-ui-multilevel-list-select-item-line">
                { this.defaultSlot && <div class={`ark-ui-multilevel-list-select-item-line-arrow ${item.isExpanded ? 'is-opened' : ''}`} onClick={() => toggleExpanded(item)}/> }
                <TernaryRadioButton state={ternaryMode} onClick={() => toggleSelected(item)}/>
                { item.item.name }
              </div>
              { this.defaultSlot && item.isExpanded && (
                <div class="ark-ui-multilevel-list-select-area-indent">
                  { this.defaultSlot({ node: item, shadowNode }) }
                </div>
              ) }
            </div>
          )
        })}
        { this.isLoading && <LineLoader/> }
        <div ref="trigger" class="ark-ui-multilevel-list-select-load-trigger"/>
      </div>
    )
  }
}

export { MultilevelListSelect, ListSelectArea }