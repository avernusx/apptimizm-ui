import './checkbox.sass'

interface CheckBox {
  modelValue: boolean,
  onValueChange?: () => void
}

export default (props: CheckBox, context: any) => {
  const onClick = () => {
    props.onValueChange ? props.onValueChange() : context.emit('update:modelValue')
  }

  const cls = props.modelValue ? 'apptimizm-ui-checkbox active' : 'apptimizm-ui-checkbox'

  return (
    <div class={cls} onClick={() => onClick()}/>
  )
}