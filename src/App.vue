<script lang="tsx">
import { Vue } from 'vue-class-component'
import axios from 'axios'
import Calendar from './ui/calendars/period-calendar/period-calendar'

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
    return (
      <Calendar/>
    )
  }
}
</script>

<style lang="scss">

</style>
