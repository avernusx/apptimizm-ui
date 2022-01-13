import { ref, Ref, computed, ComputedRef } from 'vue'
import moment, { Moment } from 'moment'

export type CalendarDay = {
  date: Moment,
  faded: boolean
}

export type Calendar = {
  date: Ref<Moment>,
  days: ComputedRef<CalendarDay[]>,
  prevMonth: () => void,
  nextMonth: () => void,
  prevYear: () => void,
  nextYear: () => void,
}

export function useCalendar (currentDate?: Moment) {
  const date = ref(currentDate ? moment(currentDate) : moment())

  const days = computed(() => {
    const start = moment(date.value).startOf('month').startOf('isoWeek')
    const end = moment(date.value).endOf('month').endOf('isoWeek')
    const day = moment(start)
    const days: CalendarDay[] = []

    while (day.isSameOrBefore(end)) {
      days.push({
        date: moment(day),
        faded: !day.isSame(date.value, 'month')
      })

      day.add(1, 'day')
    }

    return days
  })

  const prevMonth = () => { date.value = moment(date.value.add(-1, 'month')) }
  const nextMonth = () => { date.value = moment(date.value.add(1, 'month')) }
  const prevYear = () => { date.value = moment(date.value.add(-1, 'year')) }
  const nextYear = () => { date.value = moment(date.value.add(1, 'year')) }

  return { date, days, prevMonth, prevYear, nextMonth, nextYear }
}
