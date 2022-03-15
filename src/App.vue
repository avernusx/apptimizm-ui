<script lang="tsx">
import { Vue } from 'vue-class-component'
import axios from 'axios'
import DefaultTable from './ui/default-table/default-table'
import RelationSelect from './ui/relation-select/relation-select'

export default class App extends Vue {
  text: string = ''
  item: any = { id: '', name: '' }

  render () {
    const line = () => {
      return (<div/>)
    }
    return (
      <div>
        <RelationSelect
          axios={axios}
          endpoint='https://api.instantwebtools.net/v1/passenger'
          itemConverter={(i: any) => ({ id: i._id, name: i.name })}
          preselected={true}
          modelValue={this.item}
          onValueChange={(i: any) => { this.item = i }}
          responseItemsKey='data'
          responseTotalKey='totalPages'
        />
      </div>
    )
  }
}
</script>

<style lang="scss">

</style>
