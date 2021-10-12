<template>
  <div>
    <div>
      <DefaultInput v-model="form.email" :errors="['Ошибка 1', 'Ошибка 2']" placeholder="Название инпута"/>
      <button @click="submit">Отправить</button>
    </div>
    <div v-for="(error, idx) in errors" :key="idx">{{ error }}</div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import DefaultInput from 'apptimizm-ui'

@Options({
  components: { DefaultInput }
})
export default class App extends Vue {
}
</script>

<style lang="scss">

</style>
