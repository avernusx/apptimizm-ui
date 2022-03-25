import { defineComponent, PropType, ref } from 'vue'
import Calendar from './calendar/calendar'
import { Moment } from 'moment'

import './calendar-input.sass'

export default defineComponent({
  props: {
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
      default: 'Дата'
    }
  },
  setup (props) {
    const showCalendar = ref(false)

    return () => {
      return (
        <div class='apptimizm-ui-calendar-input'>
          <div
            class='apptimizm-ui-calendar-input-overlap'
            onClick={() => { showCalendar.value = !showCalendar.value }}
          />
          <input
            type='text'
            value={props.modelValue?.format(props.format)}
            placeholder={props.placeholder}
          />
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
