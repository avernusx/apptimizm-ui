<script lang="tsx">
interface IDefaultInputProps {
  modelValue: number,
  placeholder: string,
  errors?: string[],
  class?: string,
  onValueChange: (v: number) => void
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
      <input type="number" value={props.modelValue} onInput={onChange} onBlur={onBlur} onFocusout={onBlur}/>
      { props.placeholder && <div class="placeholder">{props.placeholder}</div> }
      { errors.map(error => <div class="error">{error}</div>) }
    </div>
  )
}
</script>
