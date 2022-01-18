<script lang="tsx">
import { Vue } from 'vue-class-component'
import axios from 'axios'
import Calendar from './ui/calendars/period-calendar/period-calendar'
import RadioButton from './ui/radio-button.vue'
import DefaultTable from './ui/default-table.vue'

export default class App extends Vue {
  files = [
    {
      id: '1',
      name: '11.jpg',
      file: 'https://ic.pics.livejournal.com/imhotype/24051864/433166/433166_original.png',
      extension: 'png'
    },
    {
      id: '2',
      name: '22.jpg',
      file: 'https://ic.pics.livejournal.com/imhotype/24051864/433166/433166_original.png',
      extension: 'pdf'
    },
    {
      id: '3',
      name: '233.jpg',
      file: 'https://ic.pics.livejournal.com/imhotype/24051864/433166/433166_original.png',
      extension: 'pdf'
    }
  ]

  render () {
    const line = () => {
      return (
        <div class="apptimizm-ui-default-table-row">
          <div class="apptimizm-ui-default-table-cell">
            111
          </div>
          <div class="apptimizm-ui-default-table-row">
            222
          </div>
        </div>
      )
    }

    const headers = [{ name: '1' }, { name: '2' }]

    return (
      <div>
        <Calendar/>
        <RadioButton modelValue={true} onValueChange={() => { console.log('CLICK') }}/>
        <DefaultTable
          axios={axios}
          endpoint="https://rusradio.ru/api/news/news"
          line={line}
          headers={headers}
        />
      </div>
    )
  }
}
</script>

<style lang="scss">

</style>
