import { defineComponent, ref, Ref, PropType, onMounted, watch } from 'vue'
import useClickOutside from '../../composables/use-click-outside'
import IAxiosInterface from '../../IAxiosInterface'
import debounce from 'lodash/debounce'

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
    }
  },

  setup (props) {
    const isOpened = ref(false)
    const select = ref(null) as unknown as Ref<HTMLElement>
    const items: Ref<any[]> = ref([])

    const load = debounce(async function () {
      const response = (await props.axios.get(props.endpoint, { params: props.params })).data
      items.value = response.map((i: any) => props.itemConverter(i))
      if (props.preselected && items.value.length > 0) props.onValueChange(items.value[0])
    }, 500)

    const setValue = (item: ListElement) => {
      props.onValueChange(item)
      isOpened.value = false
    }

    watch(() => props.params, () => {
      load()
    })

    useClickOutside(select, () => { isOpened.value = false })

    onMounted(load)

    return () => {
      return (
        <div>
          <div
            class={isOpened.value ? 'apptimizm-ui-relation-select opened' : 'apptimizm-ui-relation-select'}
            ref={select}
          >
            <div class="apptimizm-ui-relation-select-header">
              <div class="apptimizm-ui-relation-select-selected" onClick={() => { isOpened.value = true }}>
                <span>{ props.modelValue.name || (!props.constantPlaceholder && props.placeholder) }</span>
              </div>
              <div class="apptimizm-ui-relation-select-arrow" onClick={() => { isOpened.value = !isOpened.value }}/>
            </div>
            { props.placeholder && props.constantPlaceholder && <div class="apptimizm-ui-relation-select-placeholder">{props.placeholder}</div> }
            <div class="apptimizm-ui-relation-select-dropdown" style={isOpened.value ? 'display: block;' : 'display: none;'}>
              <div class="apptimizm-ui-relation-select-items-list">
                { items.value.map((item: any) => (
                  <div
                    class={`apptimizm-ui-relation-select-item ${item.id === props.modelValue.id ? 'is-selected' : ''}`}
                    onClick={() => setValue(item)}
                  >
                    <span>{ item.name }</span>
                  </div>
                )) }
              </div>
            </div>
            { props.errors.map(error => <div class="apptimizm-ui-relation-select-error">{error}</div>) }
          </div>
        </div>
      )
    }
  }
})
