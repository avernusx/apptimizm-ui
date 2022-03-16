import { defineComponent, ref, PropType, onMounted } from 'vue'
import PopupWindow from '../popup-window.vue'

type ErrorMessages = {
  'Error 404': string,
  'Error 405': string,
  'Error 500': string,
  'Error 502': string,
  'Error 503': string,
  'Error 504': string
}

const errorMessages = {
  'Error 404': 'Ресурс не найден',
  'Error 405': 'Неверный метод запроса',
  'Error 500': 'Ошибка сервера, обратитесь в техподдержку',
  'Error 502': 'Ошибка шлюза, обратитесь в техподдержку',
  'Error 503': 'Сервер недоступен, обратитесь в техподдержку',
  'Error 504': 'Сервер отвечает слишком долго, обратитесь в техподдержку'
}

export default defineComponent({
  props: {
    header: {
      type: String,
      default: 'Ошибка'
    },
    messages: {
      type: Object as PropType<ErrorMessages>,
      default: () => errorMessages
    }
  },
  setup (props) {
    const showPopup = ref(false)
    const popupMessage = ref('')

    onMounted(() => {
      for (const key in props.messages) {
        console.log(key)
        window.addEventListener(key, () => {
          console.log(key)
          showPopup.value = true
          popupMessage.value = (props.messages as any)[key]
        })
      }
    })

    return () => {
      return (
        <div>
          { showPopup.value && (
            <PopupWindow
              header={props.header}
              close={() => { showPopup.value = false }}
            >
              <div class="apptimizm-ui-error-popup-inner">
                { popupMessage.value }
              </div>
            </PopupWindow>
          ) }
        </div>
      )
    }
  }
})
