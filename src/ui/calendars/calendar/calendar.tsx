import { defineComponent, PropType, ref, Ref, computed } from 'vue'
import moment, { Moment } from 'moment'

import '../calendar.sass'

type CalendarDay = {
  date: Moment,
  faded: boolean
}

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
  },

  setup (props) {
    const currentDate = ref(moment())
    const selectedDay = ref(props.day ? moment(props.day) : moment('1970-01-01'))

    const days = computed(() => {
      const start = moment(currentDate.value).startOf('month').startOf('isoWeek')
      const end = moment(currentDate.value).endOf('month').endOf('isoWeek')
      const day = moment(start)
      const days: CalendarDay[] = []

      while (day.isSameOrBefore(end)) {
        days.push({
          date: moment(day),
          faded: !day.isSame(currentDate.value, 'month')
        })

        day.add(1, 'day')
      }

      return days
    })

    const prevMonth = () => { currentDate.value = moment(currentDate.value.add(-1, 'month')) }
    const nextMonth = () => { currentDate.value = moment(currentDate.value.add(1, 'month')) }
    const prevYear = () => { currentDate.value = moment(currentDate.value.add(-1, 'year')) }
    const nextYear = () => { currentDate.value = moment(currentDate.value.add(1, 'year')) }

    const setDay = (date: Moment) => {
      selectedDay.value = moment(date)
      props.onSetDay(moment(date))
    }

    return () => {
      return (
        <div class="apptimizm-ui-single-calendar">
          <div class="apptimizm-ui-calendar">
            <div class="apptimizm-ui-calendar-head">
              <div class="apptimizm-ui-calendar-month">
                <div class="apptimizm-ui-calendar-arrow-left" onClick={() => prevMonth()}/>
                { currentDate.value.format('MMMM') }
                <div class="apptimizm-ui-calendar-arrow-right" onClick={nextMonth}/>
              </div>
              <div class="apptimizm-ui-calendar-year">
                <div class="apptimizm-ui-calendar-arrow-left" onClick={prevYear}/>
                { currentDate.value.format('YYYY') }
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
                if (day.faded) cls += 'faded'
                if (day.date.isSame(selectedDay.value, 'day')) cls += 'selected'

                return (
                  <div class={`apptimizm-ui-calendar-day ${cls}`} onClick={() => setDay(day.date)}>
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
