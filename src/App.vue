<script lang="tsx">
import { Vue } from 'vue-class-component'
import axios from 'axios'
import DefaultTable from './ui/default-table/default-table'

export default class App extends Vue {
  text: string = ''

  render () {
    const line = () => {
      return (<div/>)
    }
    return (
      <DefaultTable
        axios={axios}
        endpoint='https://rusradio/api/news/news'
        itemConverter={(i: any) => ({ id: i.id, name: i.name })}
        line={line}
        headers={[]}
        defaultFilter={{ code: ['x1', 'x2'] }}
      />
    )
  }
}
</script>

<style lang="scss">

</style>
