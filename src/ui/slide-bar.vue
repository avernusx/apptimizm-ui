<script lang="tsx">
interface ISlideBarProps {
  modelValue: number,
  class?: string,
  onValueChange: (v: number) => void
}

export default (props: ISlideBarProps, context: any) => {
  const onChange = (e: any) => {
    const target = e.target.className.indexOf('slide-bar') > 0 ? e.target : e.target.parentElement
    props.onValueChange(e.layerX / target.scrollWidth * 100)
    context.emit('update:modelValue', e.layerX / target.scrollWidth * 100)
  }

  const cls = props.class ? `slide-bar ${props.class}` : 'slide-bar'

  return (
    <div class={cls} onClick={onChange}>
      <div class="slide-bar-active" style={`width: ${props.modelValue}%`}/>
      <div class="slide-bar-lever" style={`left: ${props.modelValue}%`}/>
    </div>
  )
}
</script>

<style lang="sass">
@import '../variables.sass'

.slide-bar
  background: #c0c0c0
  border-radius: 2px
  cursor: pointer
  position: relative
  height: 4px
  width: 100%
  .slide-bar-active
    background: #f0f0f0
    height: 4px
  .slide-bar-lever
    background: white
    border-radius: 6px
    height: 12px
    position: absolute
    top: -4px
    width: 12px
</style>
