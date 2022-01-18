<script lang="tsx">
interface IRadioButtonProps {
  modelValue?: boolean,
  onValueChange?: () => void
}

export default (props: IRadioButtonProps, context: any) => {
  const onClick = () => {
    props.onValueChange ? props.onValueChange() : context.emit('update:modelValue')
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
