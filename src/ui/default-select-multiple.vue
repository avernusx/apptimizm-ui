<script lang="tsx">
import { Vue, prop } from 'vue-class-component'

class Props {
  modelValue = prop<any>({ default: () => ({}) })
  placeholder = prop<string>({})
  idKey = prop<string>({ default: 'id' })
  titleKey = prop<string>({ default: 'name' })
  onValueChange = prop<(v: any) => void>({})
  items = prop<any>({ default: () => [] })
}

export default class DefaultSelectMultiple extends Vue.with(Props) {
  isActive = false

  toggleItem (item: any) {
    !this.modelValue.find((i: any) => i[this.idKey] === item[this.idKey]) ? this.select(item) : this.deselect(item)
  }

  select (item: any) {
    this.modelValue.push(item)
    this.$emit('input', this.modelValue)
    this.$emit('update:modelValue', this.modelValue)
    this.onValueChange && this.onValueChange(this.modelValue)
  }

  deselect (item: any) {
    item = this.modelValue.find((i: any) => i[this.idKey] === item[this.idKey])
    this.modelValue.splice(this.modelValue.indexOf(item), 1)
    this.$emit('input', this.modelValue)
    this.$emit('update:modelValue', this.modelValue)
    this.onValueChange && this.onValueChange(this.modelValue)
  }

  mounted () {
    document.addEventListener('click', (event: MouseEvent) => {
      this.isActive = false
    })
  }

  render () {
    return (
      <div
        class={Object.keys(this.modelValue).length ? 'default-select multiple selected' : 'default-select multiple'}
        onClick={(event: Event) => event.stopPropagation()}
      >
        <div class="select">
          { this.placeholder && <div class="placeholder">{this.placeholder}</div> }
          <svg class="dropdown-arrow" onClick={() => { this.isActive = !this.isActive }} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.78787 10.7879L3.51213 6.51213C3.32314 6.32314 3.45699 6 3.72426 6H12.2757C12.543 6 12.6769 6.32314 12.4879 6.51213L8.21213 10.7879C8.09497 10.905 7.90503 10.905 7.78787 10.7879Z" fill="#999999"/>
          </svg>
          { this.modelValue.length
            ? this.modelValue.map((item: any) => (
              <div class="value">{item[this.titleKey]}
                <svg class="reset" onClick={() => { this.deselect({}) }} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M5.09091 4.24239C4.8566 4.00807 4.4767 4.00807 4.24239 4.24239C4.00807 4.4767 4.00807 4.8566 4.24239 5.09091L7.35377 8.2023L4.24239 11.3137C4.00807 11.548 4.00807 11.9279 4.24239 12.1622C4.4767 12.3965 4.8566 12.3965 5.09091 12.1622L8.2023 9.05082L11.3135 12.162C11.5478 12.3963 11.9277 12.3963 12.162 12.162C12.3963 11.9277 12.3963 11.5478 12.162 11.3135L9.05082 8.2023L12.162 5.09113C12.3963 4.85682 12.3963 4.47692 12.162 4.24261C11.9277 4.00829 11.5478 4.00829 11.3135 4.24261L8.2023 7.35377L5.09091 4.24239Z" fill="#999999"/>
                </svg>
              </div>
            ))
            : null
          }
        </div>
        <div class="dropdown" style={this.isActive ? 'display: block;' : 'display: none;'}>
          <div class="items-list">
            { this.items.map((item: any) => (
              <div
                class={this.modelValue.find((i: any) => i[this.idKey] === item[this.idKey]) ? 'item active' : 'item'}
                onClick={() => this.toggleItem(item)}
              >{ item[this.titleKey] }
                { this.modelValue.find((i: any) => i[this.idKey] === item[this.idKey])
                  ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.4733 4.8067C12.4114 4.74421 12.3376 4.69461 12.2564 4.66077C12.1752 4.62692 12.088 4.6095 12 4.6095C11.912 4.6095 11.8249 4.62692 11.7436 4.66077C11.6624 4.69461 11.5886 4.74421 11.5267 4.8067L6.56001 9.78003L4.47334 7.6867C4.40899 7.62454 4.33303 7.57566 4.2498 7.54286C4.16656 7.51006 4.07768 7.49397 3.98822 7.49552C3.89877 7.49706 3.8105 7.51622 3.72844 7.55188C3.64639 7.58754 3.57217 7.63902 3.51001 7.70336C3.44785 7.76771 3.39897 7.84367 3.36617 7.92691C3.33337 8.01014 3.31728 8.09903 3.31883 8.18848C3.32038 8.27793 3.33953 8.36621 3.37519 8.44826C3.41085 8.53031 3.46233 8.60454 3.52667 8.6667L6.08667 11.2267C6.14865 11.2892 6.22238 11.3388 6.30362 11.3726C6.38486 11.4065 6.472 11.4239 6.56001 11.4239C6.64802 11.4239 6.73515 11.4065 6.81639 11.3726C6.89763 11.3388 6.97137 11.2892 7.03334 11.2267L12.4733 5.7867C12.541 5.72427 12.595 5.6485 12.632 5.56417C12.6689 5.47983 12.688 5.38876 12.688 5.2967C12.688 5.20463 12.6689 5.11356 12.632 5.02923C12.595 4.94489 12.541 4.86912 12.4733 4.8067Z" fill="#64D0DA"/>
                  </svg>
                  : null
                }
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
}
</script>

<style lang="sass" scoped>
@import '../style/variables.sass'

.default-select
  position: relative
  &.selected
    .placeholder
      opacity: 0
    .dropdown-arrow
      display: none
  .select
    position: relative
    background: white
    border-radius: 0.5*$step
    box-sizing: border-box
    font-size: 14px
    height: 5*$step
    line-height: 2*$step
    width: 100%
  .placeholder
    position: absolute
    width: 100%
    top: 0
    left: 0
    color: $placeholder-gray
    font-size: 14px
    padding: 1.5*$step 4.5*$step 1.5*$step 1.5*$step
    transition: $time
  .value
    font-size: 14px
    line-height: 2*$step
    padding: 1.5*$step 4.5*$step 1.5*$step 1.5*$step

  .dropdown-arrow, .reset
    right: 1.5*$step
    top: 1.5*$step
    position: absolute
    cursor: pointer
    &:hover
      & > *
        fill: $primary-color

  .dropdown
    background: white
    border-top: none
    border-radius: 0.5*$step
    box-sizing: border-box
    position: absolute
    top: 5*$step + 4px
    width: 100%
    z-index: 10

  .items-list
    max-height: 250px
    overflow-y: scroll
    .item
      cursor: pointer
      display: flex
      padding: 1.5*$step
      align-items: center
      justify-content: space-between
      &:hover, &.active
        background: $secondary-color

  &.multiple
    &.selected
      .select
        padding: $step 1.5*$step
    .value
      position: relative
      display: inline-block
      font-size: 14px
      line-height: 2*$step
      padding: 0.5*$step (3*$step + 4px) 0.5*$step 0.5*$step
      margin-right: $step
      background: $table-grey
      border-radius: $border-radius-1
      &:last-child
        margin-right: 0
      .reset
        top: 0.5*$step
        right: 0.5*$step
</style>
