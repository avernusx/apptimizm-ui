<script lang="tsx">
interface IDefaultInputProps {
  modelValue: string,
  placeholder: string,
  errors?: string[],
  password?: boolean,
  class?: string,
  onValueChange: (v: string) => void
  onBlur?: () => void
}

export default (props: IDefaultInputProps, context: any) => {
  const onChange = (e: any) => {
    context.emit('update:modelValue', e.target?.value)
    props.onValueChange(e.target?.value)
  }

  const onBlur = () => {
    context.emit('blur')
    props.onBlur && props.onBlur()
  }

  const errors = Array.isArray(props.errors) ? props.errors : []
  const cls = (errors.length ? 'default-input with-errors' : 'default-input') + ' ' + props.class

  return (
    <div class={cls}>
      <input type={ props.password ? 'password' : 'text' } value={props.modelValue} onInput={onChange} onBlur={onBlur} onFocusout={onBlur}/>
      { props.placeholder && <div class="placeholder">{props.placeholder}</div> }
      { errors.map(error => <div class="error">{error}</div>) }
    </div>
  )
}
</script>

<style lang="sass">
@import '../variables.sass'

.default-input
  position: relative
  input
    background: white
    border: 1px solid $border-light-gray
    border-radius: 0.5*$step
    box-sizing: border-box
    font-size: 14px
    height: 5*$step
    line-height: 3*$step
    padding: $step 2*$step
    width: 100%
  .placeholder
    background: white
    color: $placeholder-gray
    font-size: 12px
    left: 2*$step
    position: absolute
    top: -$step
    &.transparent
      background: none
  &.with-errors
    input
      border: 1px solid $error-color
    .placeholder
      color: $error-color
  .error
    color: $error-color
    font-size: 12px
    line-height: 24px
    height: 24px
</style>
