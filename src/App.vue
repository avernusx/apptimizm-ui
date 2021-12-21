<script lang="tsx">
import { Vue } from 'vue-class-component'
import ModalForm from './ui/modal-form.vue'
import PopupWindow from './ui/popup-window.vue'
import DefaultTable from './ui/default-table.vue'

export default class App extends Vue {
  isVisible = true

  confirm () {
    console.log('CONFIRM')
    this.isVisible = false
  }

  cancel () {
    console.log('CANCEL')
    this.isVisible = false
  }

  customAction () {
    console.log('custom action')
  }

  render () {
    const formContent = () => {
      return (
        <div>Вопрос</div>
      )
    }

    const buttons = () => {
      return (
        <div onClick={this.customAction}>Кастомная кнопка</div>
      )
    }

    return (
      <div>
        { this.isVisible && (
          <PopupWindow
            close={this.cancel}
            header='Заголовок'
          >
            <div>xxx</div>
          </PopupWindow>
        ) }
      </div>
    )
  }
}
</script>

<style lang="scss">

</style>
