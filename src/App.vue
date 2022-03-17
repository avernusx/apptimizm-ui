<script lang="tsx">
import { Vue } from 'vue-class-component'
import DefaultTable from './ui/default-table/default-table'
import MultipleRelationSelect from './ui/relation-select/multiple-relation-select'
import AutomaticErrorPopup from './ui/automatic-error-popup'
import axios from './api'

export default class App extends Vue {
  text: string = ''
  item: any = { id: '', name: '' }
  showPopup: boolean = false
  popupMessage: string = ''

  headers = [
    { name: 'Имя' }
  ]

  render () {
    const line = (item: any) => {
      return (
        <div class="apptimizm-ui-default-table-row">
          <div class="apptimizm-ui-default-table-cell">
            {item.name}
          </div>
        </div>
      )
    }
    return (
      <div>
        <MultipleRelationSelect
          axios={axios}
          endpoint='https://api.instantwebtools.net/v11/passenger'
          itemConverter={(i: any) => ({ id: i._id, name: i.name })}
          preselected={true}
          modelValue={this.item}
          onValueChange={(i: any) => { this.item = i }}
          responseItemsKey='data'
          responseTotalKey='totalPages'
          requestPageKey='page'
          requestPerPageKey='size'
        />
        <DefaultTable
          axios={axios}
          endpoint='https://api.instantwebtools.net/v1/passenger'
          itemConverter={(i: any) => ({ id: i._id, name: i.name })}
          headers={this.headers}
          line={line}
          responseItemsKey='data'
          responseTotalKey='totalPages'
          requestPageKey='page'
          requestPerPageKey='size'
        />
        <AutomaticErrorPopup/>
      </div>
    )
  }
}
</script>

<style lang="sass">

</style>
