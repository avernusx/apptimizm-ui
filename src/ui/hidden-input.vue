<script lang="tsx">
import { Vue, prop } from 'vue-class-component'
import DefaultInput from './default-input.vue'

class Props {
  modelValue = prop<string>({ required: true })
  placeholder = prop<string>({ required: true })
  onValueChange? = prop<(v: string) => void>({})
}

export default class HiddenInput extends Vue.with(Props) {
  isDisplayed = false

  onChange (v: string) {
    this.$emit('update:modelValue', v)
    this.onValueChange && this.onValueChange(v)
  }

  render () {
    return (
      <div onClick={() => { !this.isDisplayed && (this.isDisplayed = true) }}>
        {
          this.isDisplayed
            ? <DefaultInput placeholder={this.placeholder} modelValue={this.modelValue} onValueChange={this.onChange} onBlur={() => { this.isDisplayed = false }}/>
            : this.placeholder
        }
      </div>
    )
  }
}
</script>
