<script lang="tsx">
import { Vue } from 'vue-class-component'
import axios from 'axios'
import DefaultTextarea from './ui/default-textarea'
import EnumSelect from './ui/relation-select/enum-select'

export default class App extends Vue {
  text: string = ''

  render () {
    return (
      <DefaultTextarea modelValue={this.text} onValueChange={(v: string) => { this.text = v; console.log(v) }} placeholder='Текст'/>
    )
  }
}
</script>

<style lang="scss">

</style>
