<script lang="tsx">
interface IModalFormProps {
  cancel: () => void,
  confirm: () => void,
  header: string,
  slots?: { default?: () => JSX.Element, buttons?: () => JSX.Element }
}

export default (props: IModalFormProps, context: any) => {
  return (
    <div>
      <div class="apptimizm-ui-modal-form-background">
        <div class="apptimizm-ui-modal-form-window">
          <div class="apptimizm-ui-modal-form-header">
            { props.header }
            <div class="apptimizm-ui-modal-form-close" onClick={props.cancel}>&times;</div>
          </div>
          <div class="apptimizm-ui-modal-form-body">
            { (props.slots?.default && props.slots?.default()) || (context.slots.default && context.slots.default()) }
          </div>
          <div>
            { props.slots?.buttons
              ? props.slots?.buttons()
              : (
                <div class="apptimizm-ui-modal-form-buttons">
                  <div class="light-button mr-2" onClick={props.cancel}>Отмена</div>
                  <div class="primary-button" onClick={props.confirm}>Принять</div>
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
}
</script>

<style lang="sass" scoped>
@import '../default-styles.sass'

.apptimizm-ui-modal-form
  &-background
    width: 100%
    height: 100%
    position: fixed
    z-index: 99
    background: rgba(0,0,0,0.5)
    left: 0
    top: 0
  &-window
    border-radius: 4px
    position: absolute
    left: 50%
    top: 50%
    transform: translate(-50%, -50%)
    background: white
    overflow: hidden
  &-close
    font-size: 24px
    cursor: pointer
  &-header
    background: #F8F8FF
    display: flex
    font-size: 18px
    font-weight: 600
    justify-content: space-between
    line-height: 24px
    padding: 16px 24px
  &-buttons
    display: flex
    justify-content: center
    margin: 24px
    > div
      margin-right: 12px
      &:nth-last-child(1)
        margin-right: 0px
</style>
