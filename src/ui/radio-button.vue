<script lang="tsx">
interface IRadioButtonProps {
  modelValue?: boolean,
  onClick?: () => void,
  onValueChange?: () => void,
}

export default (props: IRadioButtonProps, context: any) => {
  const onClick = () => {
    props.onClick ? props.onClick() : context.emit('update:modelValue')
    props.onValueChange ? props.onValueChange() : null
  }

  const cls = props.modelValue ? 'radio-button active' : 'radio-button'

  return (
    <div class={cls} onClick={() => onClick()}/>
  )
}
</script>

<style lang="sass" scoped>
@import '../variables.sass'

.radio-button
  min-width: 12px
  width: 12px
  height: 12px
  border: 1px solid $primary-color
  border-radius: 3px
  cursor: pointer
  &.active
    background: $primary-color
</style>
