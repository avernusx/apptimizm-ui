<script lang="tsx">
interface IPopupWindowProps {
  header: string,
  close: () => void
}

export default (props: IPopupWindowProps, context: any) => {
  return (
    <div>
      <div class="apptimizm-ui-popup-window-background">
        <div class="apptimizm-ui-popup-window-window">
          <div class="apptimizm-ui-popup-window-header">
            { props.header }
            <div class="apptimizm-ui-popup-window-close" onClick={props.close}>&times;</div>
          </div>
          <div class="apptimizm-ui-popup-window-body">
            { context.slots.default && context.slots.default() }
          </div>
        </div>
      </div>
    </div>
  )
}
</script>

<style lang="sass" scoped>
@import '../styles.sass'

.apptimizm-ui-popup-window
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
</style>
