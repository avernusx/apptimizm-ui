import { defineComponent, PropType, ref, Ref, computed } from 'vue'
import moment, { Moment } from 'moment'
import { Calendar, CalendarDay, useCalendar } from '../composables'

import '../calendar.sass'

export default defineComponent({
  props: {
    onSetDay: {
      type: Function as PropType<(date: Moment) => void>,
      required: true
    },
    day: {
      type: Object as PropType<Moment|null>,
      required: true
    },
    disablePastDates: {
      type: Boolean,
      default: false
    }
  },

  setup (props) {
    const selectedDay = ref(props.day ? moment(props.day) : moment('1970-01-01'))

    const setDay = (date: Moment) => {
      selectedDay.value = moment(date)
      props.onSetDay(moment(date))
    }

    const { date, days, prevMonth, prevYear, nextMonth, nextYear } = useCalendar(moment(), { disablePastDates: props.disablePastDates })

    return () => {
      return (
        <div class="apptimizm-ui-single-calendar">
          <div class="apptimizm-ui-calendar">
            <div class="apptimizm-ui-calendar-head">
              <div class="apptimizm-ui-calendar-month">
                <div class="apptimizm-ui-calendar-arrow-left" onClick={() => prevMonth()}/>
                { date.value.format('MMMM') }
                <div class="apptimizm-ui-calendar-arrow-right" onClick={nextMonth}/>
              </div>
              <div class="apptimizm-ui-calendar-year">
                <div class="apptimizm-ui-calendar-arrow-left" onClick={prevYear}/>
                { date.value.format('YYYY') }
                <div class="apptimizm-ui-calendar-arrow-right" onClick={nextYear}/>
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
              { days.value.map(day => {
                let cls = ''
                if (day.faded || day.disabled) cls += ' faded'
                if (day.date.isSame(selectedDay.value, 'day')) cls += ' selected'

                return (
                  <div class={`apptimizm-ui-calendar-day ${cls}`} onClick={() => { if (!day.disabled) setDay(day.date) }}>
                    <div class="apptimizm-ui-calendar-day-border">
                      { day.date.format('D') }
                    </div>
                  </div>
                )
              }) }
            </div>
          </div>
        </div>
      )
    }
  }
})
