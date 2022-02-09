import { isElement } from 'lodash'
import { Vue, prop } from 'vue-class-component'

import './default-select.sass'

class Props {
  modelValue = prop<boolean|null>({ default: null })
  placeholder? = prop<string>({})
  onValueChange = prop<(v: any) => void>({})
  resetable = prop<boolean>({ default: false })
  constantPlaceholder = prop<boolean>({ default: true })
}

export default class DefaultSelect extends Vue.with(Props) {
  isActive = false

  set (value: boolean) {
    this.$emit('input', value)
    this.$emit('update:modelValue', value)
    this.onValueChange && this.onValueChange(value)
    this.isActive = false
  }

  reset () {
    this.$emit('input', null)
    this.$emit('update:modelValue', null)
    this.onValueChange && this.onValueChange(null)
    this.isActive = false
  }

  mounted () {
    document.addEventListener('click', (event: MouseEvent) => {
      this.isActive = false
    })
  }

  render () {
    const isSelected = this.modelValue !== null

    return (
      <div>
        <div
          class={`apptimizm-ui-default-select ${isSelected ? 'selected' : ''} ${this.isActive ? 'opened' : ''}`}
          onClick={(event: Event) => event.stopPropagation()}
        >
          <div class="apptimizm-ui-select" onClick={() => { this.isActive = !this.isActive }}>
            { this.placeholder && this.constantPlaceholder && <div class="apptimizm-ui-default-select-constant-placeholder">{this.placeholder}</div> }
            <div class="apptimizm-ui-default-select-dropdown-arrow" style={isSelected && this.resetable ? 'display: none' : ''}/>
            { isSelected ? (
              <div class="apptimizm-ui-default-select-value">
                {this.modelValue ? 'Да' : 'Нет'}
                <div class="apptimizm-ui-default-select-reset" onClick={this.reset}/>
              </div>
            ) : (
              !this.constantPlaceholder && <div class="apptimizm-ui-default-select-placeholder">{this.placeholder}</div>
            ) }
          </div>
          <div class="apptimizm-ui-default-select-dropdown" style={this.isActive ? 'display: block;' : 'display: none;'}>
            <div class="apptimizm-ui-default-select-items-list">
              <div
                class={this.modelValue === true ? 'apptimizm-ui-default-select-item active' : 'apptimizm-ui-default-select-item'}
                onClick={() => this.set(true) }
              > Да
                { this.modelValue === true
                  ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.4733 4.8067C12.4114 4.74421 12.3376 4.69461 12.2564 4.66077C12.1752 4.62692 12.088 4.6095 12 4.6095C11.912 4.6095 11.8249 4.62692 11.7436 4.66077C11.6624 4.69461 11.5886 4.74421 11.5267 4.8067L6.56001 9.78003L4.47334 7.6867C4.40899 7.62454 4.33303 7.57566 4.2498 7.54286C4.16656 7.51006 4.07768 7.49397 3.98822 7.49552C3.89877 7.49706 3.8105 7.51622 3.72844 7.55188C3.64639 7.58754 3.57217 7.63902 3.51001 7.70336C3.44785 7.76771 3.39897 7.84367 3.36617 7.92691C3.33337 8.01014 3.31728 8.09903 3.31883 8.18848C3.32038 8.27793 3.33953 8.36621 3.37519 8.44826C3.41085 8.53031 3.46233 8.60454 3.52667 8.6667L6.08667 11.2267C6.14865 11.2892 6.22238 11.3388 6.30362 11.3726C6.38486 11.4065 6.472 11.4239 6.56001 11.4239C6.64802 11.4239 6.73515 11.4065 6.81639 11.3726C6.89763 11.3388 6.97137 11.2892 7.03334 11.2267L12.4733 5.7867C12.541 5.72427 12.595 5.6485 12.632 5.56417C12.6689 5.47983 12.688 5.38876 12.688 5.2967C12.688 5.20463 12.6689 5.11356 12.632 5.02923C12.595 4.94489 12.541 4.86912 12.4733 4.8067Z" fill="#64D0DA"/>
                  </svg>
                  : null
                }
              </div>
              <div
                class={this.modelValue === false ? 'apptimizm-ui-default-select-item active' : 'apptimizm-ui-default-select-item'}
                onClick={() => this.set(false) }
              > Нет
                { this.modelValue === false
                  ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.4733 4.8067C12.4114 4.74421 12.3376 4.69461 12.2564 4.66077C12.1752 4.62692 12.088 4.6095 12 4.6095C11.912 4.6095 11.8249 4.62692 11.7436 4.66077C11.6624 4.69461 11.5886 4.74421 11.5267 4.8067L6.56001 9.78003L4.47334 7.6867C4.40899 7.62454 4.33303 7.57566 4.2498 7.54286C4.16656 7.51006 4.07768 7.49397 3.98822 7.49552C3.89877 7.49706 3.8105 7.51622 3.72844 7.55188C3.64639 7.58754 3.57217 7.63902 3.51001 7.70336C3.44785 7.76771 3.39897 7.84367 3.36617 7.92691C3.33337 8.01014 3.31728 8.09903 3.31883 8.18848C3.32038 8.27793 3.33953 8.36621 3.37519 8.44826C3.41085 8.53031 3.46233 8.60454 3.52667 8.6667L6.08667 11.2267C6.14865 11.2892 6.22238 11.3388 6.30362 11.3726C6.38486 11.4065 6.472 11.4239 6.56001 11.4239C6.64802 11.4239 6.73515 11.4065 6.81639 11.3726C6.89763 11.3388 6.97137 11.2892 7.03334 11.2267L12.4733 5.7867C12.541 5.72427 12.595 5.6485 12.632 5.56417C12.6689 5.47983 12.688 5.38876 12.688 5.2967C12.688 5.20463 12.6689 5.11356 12.632 5.02923C12.595 4.94489 12.541 4.86912 12.4733 4.8067Z" fill="#64D0DA"/>
                  </svg>
                  : null
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
