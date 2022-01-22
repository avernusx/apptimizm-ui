import { Vue, prop } from 'vue-class-component'

import './ternary-radio-button.sass'

export enum TernaryModes { NONE = 'none', SOME = 'some', ALL = 'all' }

class Props {
  state = prop<TernaryModes>({ required: true })
  onClick = prop<() => void>({ required: true })
}

class TernaryRadioButton extends Vue.with(Props) {
  render () {
    return (
      <div class={`ark-ui-ternary-radio-button ark-ui-ternary-radio-button-${this.state}`} onClick={() => this.$emit('click')}>
        <div class='ark-ui-ternary-radio-button-inner'/>
      </div>
    )
  }
}

export default TernaryRadioButton