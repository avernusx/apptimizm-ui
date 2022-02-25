<script lang="tsx">
import { Vue } from 'vue-class-component'
import axios from 'axios'
import MultipleFileUpload, { FileData } from './ui/multiple-file-upload/multiple-file-upload'
import EnumSelect from './ui/relation-select/enum-select'

export default class App extends Vue {
  test = { id: '1', name: '11' }
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
      <EnumSelect
        axios={axios}
        modelValue={this.test}
        onValueChange={(i: any) => { this.test = i }}
        endpoint={'https://fakerapi.it/api/v1/images?_width=380'}
        itemConverter={(i: any) => ({ id: i.id, name: i.title })}
      />
    )
  }
}
</script>

<style lang="scss">

</style>
