import { defineComponent, ref, Ref, PropType, watch, computed, onMounted } from 'vue'
import usePaginatedApi from '../../composables/use-paginated-api'
import useScrollPagination from '../../composables/use-scroll-pagination'
import useClickOutside from '../../composables/use-click-outside'
import LineLoader from '../line-loader-small.vue'
import IAxiosInterface from '../../IAxiosInterface'

import './relation-select.sass'

type ListElement = { id: string, name: string }

export default defineComponent({
  props: {
    axios: {
      type: Object as PropType<IAxiosInterface>,
      required: true
    },
    clearable: {
      type: Boolean,
      default: false
    },
    constantPlaceholder: {
      type: Boolean,
      default: true
    },
    endpoint: {
      type: String,
      required: true
    },
    errors: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    itemConverter: {
      type: Function as PropType<(item: any) => ListElement>,
      required: true
    },
    modelValue: {
      type: Array as PropType<ListElement[]>,
      default: () => []
    },
    onValueChange: {
      type: Function as PropType<(v: ListElement[]) => void>,
      default: () => () => {}
    },
    paginationType: {
      type: String,
      default: 'page'
    },
    params: {
      type: Object as PropType<{ [code: string] : string|string[] }>,
      default: () => ({})
    },
    placeholder: {
      type: String,
      default: ''
    },
    preselected: {
      type: Boolean,
      default: false
    },
    requestPageKey: {
      type: String,
      default: 'page'
    },
    requestPerPageKey: {
      type: String,
      default: 'per_page'
    },
    responseItemsKey: {
      type: String,
      default: 'results'
    },
    responseTotalKey: {
      type: String,
      default: 'count'
    },
    searchKey: {
      type: String,
      default: 'search'
    },
    showChips: {
      type: Boolean,
      default: false
    }
  },

  setup (props) {
    const isOpened = ref(false)
    const trigger = ref(null) as unknown as Ref<HTMLElement>
    const root = ref(null) as unknown as Ref<HTMLElement>
    const select = ref(null) as unknown as Ref<HTMLElement>
    const perPage = ref(10)
    const search = ref('')
    const queryParams = computed(() => {
      const params = { ...props.params }
      if (search.value !== '') params[props.searchKey] = search.value
      return params
    })

    const {
      page,
      pages,
      isLoading,
      items,
      load,
      reload,
      loadNext
    } = usePaginatedApi(
      props.endpoint,
      props.axios,
      queryParams,
      perPage,
      props.paginationType,
      props.itemConverter,
      true,
      props.responseItemsKey,
      props.responseTotalKey,
      'ordering',
      props.requestPageKey,
      props.requestPerPageKey
    )

    if (props.preselected) {
      const preselectedCallback = () => {
        if (items.value.length > 0) {
          props.onValueChange([items.value[0]])
          page.value++
        }
      }

      onMounted(() => {
        load(preselectedCallback)
      })
    }

    useScrollPagination(() => pages.value === 0 ? load() : loadNext(), trigger, root)

    watch(() => props.params, reload)

    useClickOutside(select, () => { isOpened.value = false })

    const toggleItem = (item: ListElement) => {
      const items = [...props.modelValue]
      const index = items.find(i => i.id === item.id)
      index ? items.splice(items.indexOf(index, 1)) : items.push(item)
      props.onValueChange(items)
    }

    const clear = () => {
      props.onValueChange([])
    }

    const isSelected = (item: ListElement) => props.modelValue.find(i => i.id === item.id)

    const showChips = () => {
      return (
        <div class="apptimizm-ui-relation-select-chips">
          { props.modelValue.map(chip => (
            <div class="apptimizm-ui-relation-select-chip" onClick={() => toggleItem(chip)}>
              { chip.name }
            </div>
          )) }
        </div>
      )
    }

    return () => {
      return (
        <div>
          <div
            class={isOpened.value ? 'apptimizm-ui-relation-select opened' : 'apptimizm-ui-relation-select'}
            ref={select}
          >
            <div class="apptimizm-ui-relation-select-header">
              { isOpened.value ? (
                <div class="apptimizm-ui-relation-select-selected">
                  <div>{ props.showChips && props.modelValue.length > 0 && showChips() }</div>
                  <input
                    type='text'
                    placeholder={props.placeholder}
                    value={search.value}
                    onInput={(v: Event) => { search.value = (v.target as HTMLFormElement).value; reload() }}
                  />
                </div>
              ) : (
                <div class="apptimizm-ui-relation-select-selected" onClick={() => { isOpened.value = true }}>
                  { props.modelValue.length > 0 ? (
                    props.showChips ? showChips() : <span onClick={(e) => { e.stopPropagation(); clear() }}>Выбрано: { props.modelValue.length }</span>
                  ) : props.placeholder }
                </div>
              ) }
              <div class="apptimizm-ui-relation-select-arrow" onClick={() => { isOpened.value = !isOpened.value }}/>
              { props.clearable && props.modelValue.length ? <div class="apptimizm-ui-relation-select-clear" onClick={clear}/> : null }
            </div>
            { props.constantPlaceholder && props.placeholder && <div class="apptimizm-ui-relation-select-placeholder">{props.placeholder}</div> }
            <div class="apptimizm-ui-relation-select-dropdown" style={isOpened.value ? 'display: block;' : 'display: none;'}>
              { isLoading.value && <LineLoader/> }
              <div class="apptimizm-ui-relation-select-items-list" ref={root}>
                { items.value.map((item: ListElement) => (
                  <div class={`apptimizm-ui-relation-select-item ${isSelected(item) ? 'is-selected' : ''}`} onClick={() => toggleItem(item)}>
                    <span>{ item.name }</span>
                  </div>
                )) }
                <div ref={trigger}/>
              </div>
            </div>
            { props.errors.map(error => <div class="apptimizm-ui-relation-select-error">{error}</div>) }
          </div>
        </div>
      )
    }
  }
})
