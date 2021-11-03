<script lang="tsx">
export default () => {
  return (
    <div class="line-loader">
      <div class="line-loader-runner"/>
    </div>
  )
}
</script>

<style lang="sass" scoped>
@import '../variables.sass'

.line-loader
  background: #DCDDE7
  height: 4px
  position: relative
  overflow: hidden
.line-loader-runner
  width: 50%
  height: 100%
  background: repeating-linear-gradient(125deg, $primary-color 0px, darken($primary-color, 20%) 11px, $primary-color 11px, darken($primary-color, 20%) 22px)
  position: absolute
  top: 0
  animation: moving 1.5s infinite linear
@keyframes moving
  0%
    left: -50%
  100%
    left: 100%
</style>
