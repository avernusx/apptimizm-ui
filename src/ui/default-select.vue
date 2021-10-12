<script lang="tsx">
interface IDefaultSelectProps {
  modelValue: string,
  placeholder: string,
  items: Array<{
    id: string,
    name: string
  }>
  onValueChange: (v: string) => void
}

export default (props: IDefaultSelectProps, context: any) => {
  const onChange = (id: string) => {
    context.emit('update:modelValue', id)
    props.onValueChange(id)
  }

  return (
    <div class="default-input">
      <select onChange={(e: Event) => onChange((e.target as HTMLFormElement).value)}>
        { props.items.map(i => (
          <option value={i.id} selected={props.modelValue === i.id}>{ i.name }</option>
        ))}
      </select>
      <div class="placeholder">{props.placeholder}</div>
    </div>
  )
}
</script>

<style lang="sass">
@import '../variables.sass'

.default-input
  position: relative
  select
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
    color: $placeholder-gray
    font-size: 12px
    left: 2*$step
    position: absolute
    top: -$step
    &.transparent
      background: none
</style>
