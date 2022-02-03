import { defineComponent, PropType, ref, Ref, watch } from 'vue'
import moment, { Moment } from 'moment'
import { Calendar, CalendarDay, useCalendar } from '../composables'

moment.locale('ru')

import '../calendar.sass'

export default defineComponent({
  props: {
    start: {
      type: Object as PropType<Moment|null>
    },
    end: {
      type: Object as PropType<Moment|null>
    },
    onSetStart: {
      type: Function as PropType<(date: Moment|null) => void>,
      required: true
    },
    onSetEnd: {
      type: Function as PropType<(date: Moment|null) => void>,
      required: true
    },
    disablePastDates: {
      type: Boolean,
      default: false
    }
  },

  setup (props) {
    const startCalendar = useCalendar(moment(), { disablePastDates: props.disablePastDates })
    const endCalendar = useCalendar(moment().add(1, 'month'), { disablePastDates: props.disablePastDates })

    const startOfPeriod: Ref<Moment|null> = ref(props.start ? moment(props.start) : null)
    const endOfPeriod: Ref<Moment|null> = ref(props.end ? moment(props.end) : null)
    const hoverDay: Ref<Moment|null> = ref(null)

    const setPeriod = (day: CalendarDay) => {
      if (day.disabled) return
      if (!startOfPeriod.value && !endOfPeriod.value) {
        startOfPeriod.value = moment(day.date)
        props.onSetStart(moment(startOfPeriod.value))
      } else if (startOfPeriod.value && startOfPeriod.value.isSame(day.date, 'day')) {
        startOfPeriod.value = null
        props.onSetStart(null)
      } else if (endOfPeriod.value && endOfPeriod.value.isSame(day.date, 'day')) {
        endOfPeriod.value = null
        props.onSetEnd(null)
      } else if (startOfPeriod.value && day.date.isAfter(startOfPeriod.value)) {
        endOfPeriod.value = moment(day.date)
        props.onSetEnd(moment(endOfPeriod.value))
      } else if (endOfPeriod.value && day.date.isBefore(endOfPeriod.value)) {
        startOfPeriod.value = moment(day.date)
        props.onSetStart(moment(startOfPeriod.value))
      }
    }

    watch(() => props.start, (v) => {
      if (typeof (v) !== 'undefined') startOfPeriod.value = v
    })

    watch(() => props.end, (v) => {
      if (typeof (v) !== 'undefined') endOfPeriod.value = v
    })

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

    return () => {
      const calendarTemplate = (c: Calendar) => (
        <div class="apptimizm-ui-calendar">
          <div class="apptimizm-ui-calendar-head">
            <div class="apptimizm-ui-calendar-month">
              <div class="apptimizm-ui-calendar-arrow-left" onClick={() => c.prevMonth()}/>
              <div>{ capitalize(c.date.value.format('MMMM')) }</div>
              <div class="apptimizm-ui-calendar-arrow-right" onClick={() => c.nextMonth()}/>
            </div>
            <div class="apptimizm-ui-calendar-year">
              <div class="apptimizm-ui-calendar-arrow-left" onClick={() => c.prevYear() }/>
              <div>{ c.date.value.format('YYYY') }</div>
              <div class="apptimizm-ui-calendar-arrow-right" onClick={() => c.nextYear()}/>
            </div>
          </div>
          <div class="apptimizm-ui-calendar-days">
            <div class="apptimizm-ui-calendar-day faded">Пн</div>
            <div class="apptimizm-ui-calendar-day faded">Вт</div>
            <div class="apptimizm-ui-calendar-day faded">Ср</div>
            <div class="apptimizm-ui-calendar-day faded">Чт</div>
            <div class="apptimizm-ui-calendar-day faded">Пт</div>
            <div class="apptimizm-ui-calendar-day faded">Сб</div>
            <div class="apptimizm-ui-calendar-day faded">Вс</div>
            { c.days.value.map(day => {
              const cls = []
              if (day.faded || day.disabled) cls.push('faded')
              if (
                (startOfPeriod.value && endOfPeriod.value && day.date.isBetween(startOfPeriod.value, endOfPeriod.value)) ||
                (startOfPeriod.value && hoverDay.value && (day.date.isBetween(startOfPeriod.value, hoverDay.value, 'day', '[]') || day.date.isBetween(hoverDay.value, startOfPeriod.value, 'day', '[]'))) ||
                (endOfPeriod.value && hoverDay.value && (day.date.isBetween(endOfPeriod.value, hoverDay.value, 'day', '[]') || day.date.isBetween(hoverDay.value, endOfPeriod.value, 'day', '[]')))
              ) cls.push('in-period')
              if (day.date.isSame(startOfPeriod.value, 'day') || day.date.isSame(endOfPeriod.value, 'day')) cls.push('selected')

              return (
                <div class={`apptimizm-ui-calendar-day ${cls.join(' ')}`}>
                  <div
                    class="apptimizm-ui-calendar-day-border"
                    onClick={() => setPeriod(day)}
                    onMouseenter={() => { hoverDay.value = moment(day.date) }}
                    onMouseleave={() => { hoverDay.value = null }}
                  >
                    { day.date.format('D') }
                  </div>
                </div>
              )
            }) }
          </div>
        </div>
      )

      return (
        <div class="apptimizm-ui-double-calendar">
          { calendarTemplate(startCalendar) }
          { calendarTemplate(endCalendar) }
        </div>
      )
    }
  }
})
