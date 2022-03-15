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
      type: Object as PropType<ListElement>,
      default: () => ({ id: '', name: '' })
    },
    onValueChange: {
      type: Function as PropType<(v: ListElement) => void>,
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
      true,
      props.responseItemsKey,
      props.responseTotalKey
    )

    if (props.preselected) {
      const preselectedCallback = () => {
        if (items.value.length > 0) {
          props.onValueChange(items.value[0])
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

    const setValue = (item: ListElement) => {
      props.onValueChange(item)
      isOpened.value = false
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
                <input
                  type='text'
                  placeholder={props.placeholder}
                  value={search.value}
                  onInput={(v: Event) => { search.value = (v.target as HTMLFormElement).value; reload() }}
                />
              ) : (
                <div class="apptimizm-ui-relation-select-selected" onClick={() => { isOpened.value = true }}>
                  <span>{ props.modelValue.name || (!props.constantPlaceholder && props.placeholder) }</span>
                </div>
              ) }
              <div class="apptimizm-ui-relation-select-arrow" onClick={() => { isOpened.value = !isOpened.value }}/>
            </div>
            { props.placeholder && props.constantPlaceholder && <div class="apptimizm-ui-relation-select-placeholder">{props.placeholder}</div> }
            <div class="apptimizm-ui-relation-select-dropdown" style={isOpened.value ? 'display: block;' : 'display: none;'}>
              { isLoading.value && <LineLoader/> }
              <div class="apptimizm-ui-relation-select-items-list" ref={root}>
                { items.value.map((item: any) => (
                  <div
                    class={`apptimizm-ui-relation-select-item ${item.id === props.modelValue.id ? 'is-selected' : ''}`}
                    onClick={() => setValue(item)}
                  >
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
