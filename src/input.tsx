interface IDefaultInputProps {
  modelValue: string,
  errors: string[]
}

const DefaultInput = (props: IDefaultInputProps, context: any) : JSX.Element => {
  const onChange = (e: any) => {
    console.log(e.target?.value)
    context.emit('update:modelValue', e.target?.value)
  }

  const errors = Array.isArray(props.errors) ? props.errors : []

  let border = ''
  if (errors.length) border = 'border: 1px solid red;'

  return (
    <div>
      <input type="text" value={props.modelValue} onInput={onChange} style={border}/>
      { errors.map(error => <div class="error" style="background: red;">{error}</div>)}
    </div>
  )
}

export default DefaultInput
