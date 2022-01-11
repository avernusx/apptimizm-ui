<script lang="tsx">
import { Vue } from 'vue-class-component'
import axios from 'axios'
import MultipleFileUpload, { FileData } from './ui/multiple-file-upload/multiple-file-upload'

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
      <MultipleFileUpload
        apiService={axios}
        files={this.files}
        onUpload={(files: FileData[]) => { this.files = files }}
      />
    )
  }
}
</script>

<style lang="scss">

</style>
