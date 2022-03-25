import { defineComponent, PropType, ref, Ref } from 'vue'
import Calendar from './calendar/calendar'
import { Moment } from 'moment'
import useClickOutside from '../../composables/use-click-outside'

import './calendar-input.sass'

export default defineComponent({
  props: {
    clearable: {
      type: Boolean,
      default: false
    },
    constantPlaceholder: {
      type: Boolean,
      default: true
    },
    errors: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    format: {
      type: String,
      default: 'DD.MM.YYYY'
    },
    modelValue: {
      type: Object as PropType<Moment|null>,
      required: true
    },
    onValueChange: {
      type: Function as PropType<(v: Moment|null) => void>,
      required: true
    },
    placeholder: {
      type: String,
      default: ''
    }
  },
  setup (props) {
    const showCalendar = ref(false)
    const calendar: Ref<HTMLElement|null> = ref(null)

    useClickOutside(calendar, () => {
      showCalendar.value = false
    })

    const clear = () => {
      props.onValueChange(null)
    }

    return () => {
      return (
        <div class='apptimizm-ui-calendar-input' ref={calendar}>
          { props.placeholder && props.constantPlaceholder && <div class="apptimizm-ui-calendar-input-placeholder">{props.placeholder}</div> }
          <div
            class='apptimizm-ui-calendar-input-overlap'
            onClick={() => { showCalendar.value = !showCalendar.value }}
          />
          { props.clearable && props.modelValue ? <div class='apptimizm-ui-calendar-input-clear' onClick={clear}/> : null }
          <input
            type='text'
            value={props.modelValue?.format(props.format)}
            placeholder={ !props.constantPlaceholder ? props.placeholder : '' }
          />
          { props.errors.map(error => <div class='apptimizm-ui-calendar-input-error'>{error}</div>) }
          { showCalendar.value && (
            <div class='apptimizm-ui-calendar-input-calendar-container'>
              <Calendar
                day={props.modelValue}
                onSetDay={(v) => { props.onValueChange(v); showCalendar.value = false }}
              />
            </div>
          ) }
        </div>
      )
    }
  }
})
