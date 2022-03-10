import { defineComponent, PropType } from 'vue'

import './style.sass'

export default defineComponent({
  props: {
    errors: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    modelValue: {
      type: String,
      required: true
    },
    onValueChange: {
      type: Function as PropType<(v: string) => void>,
      required: true
    },
    placeholder: {
      type: String,
      default: ''
    },
    showPlaceholder: {
      type: Boolean,
      default: true
    }
  },
  setup (props) {
    const update = (e: Event) => {
      props.onValueChange((e.target as HTMLInputElement).value)
    }

    return () => {
      return (
        <div class={`apptimizm-ui-default-textarea ${props.errors.length > 0 ? 'with-errors' : ''}`}>
          { props.showPlaceholder && props.placeholder && (
            <div class="apptimizm-ui-default-textarea-placeholder">{ props.placeholder }</div>
          ) }
          <textarea
            value={props.modelValue}
            placeholder={ !props.showPlaceholder && props.placeholder ? props.placeholder : '' }
            onInput={(e: Event) => update(e)}
          />
          { props.errors.length > 0 && (
            <div class="apptimizm-ui-default-errors">
              { props.errors.map(e => (
                <div class="apptimizm-ui-default-error">{ e }</div>
              )) }
            </div>
          ) }
        </div>
      )
    }
  }
})
