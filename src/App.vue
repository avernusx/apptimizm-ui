<template>
  <div>
    <div>
      <DefaultInput v-model="form.email" :errors="fieldsErrors.email"/>
      <button @click="submit">Отправить</button>
    </div>
    <div v-for="(error, idx) in errors" :key="idx">{{ error }}</div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { ProjectApiEndpoint, FeedbackFormValidator } from './project'
import { ErrorResponse } from './api'
import DefaultInput from './input'

@Options({
  components: { DefaultInput }
})
export default class App extends Vue {
  errors: string[] = []
  fieldsErrors: { [ code: string ]: string[] } = {}
  form: { [ code: string ]: any } = {
    email: ''
  }

  async submit () {
    this.errors = []
    this.fieldsErrors = {}

    const api = new ProjectApiEndpoint()
    let response = null

    const errors = FeedbackFormValidator.errors(this.form)

    if (errors) {
      this.fieldsErrors = errors.errors
      this.errors = errors.commonErrors
      return
    }

    try {
      response = (await api.request({ data: this.form })).items
    } catch (e) {
      if (e instanceof ErrorResponse) {
        this.errors = e.common
        this.fieldsErrors = e.fields
      } else {
        throw e
      }
    }
  }
}
</script>

<style lang="scss">

</style>
