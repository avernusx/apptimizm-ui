<template>
  <div>
    <div v-for="(error, idx) in errors" :key="idx">{{ error }}</div>
    <div v-for="(error, idx) in fieldsErrors" :key="idx">
      <div v-for="(e, idz) in error" :key="idz">
        {{ idx }} {{ e }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { ProjectApiEndpoint } from './project'
import { ErrorResponse } from './api'

export default class App extends Vue {
  errors: string[] = []
  fieldsErrors: { [ code: string ]: string[] } = {}
  async mounted () {
    const api = new ProjectApiEndpoint()
    let response = null

    try {
      response = (await api.request()).items
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
