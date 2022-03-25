<script lang="tsx">
import { defineComponent, ref, Ref } from 'vue'
import CalendarInput from './ui/calendars/calendar-input'
import { Moment } from 'moment'

export default defineComponent({
  setup () {
    const day: Ref<Moment|null> = ref(null)

    return () => {
      return (
        <CalendarInput
          modelValue={day.value}
          onValueChange={(v) => { day.value = v }}
          placeholder='Дата'
          clearable={true}
        />
      )
    }
  }
})
</script>

<style lang="sass">

</style>
