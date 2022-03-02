import { ref, Ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Entity, EntityMeta, FormErrors } from '../types'
import { addTrailingSlash } from '../utils/trailing-slash'
import IAxiosInterface from '../IAxiosInterface'

export default function useForm<T> (api: IAxiosInterface, meta: EntityMeta<T>, redirect: string): { item: Ref<T>, errors: Ref<FormErrors>, save: () => void, isLoading: Ref<boolean> } {
  const instance = meta.getInstance()
  const item = ref(instance)
  const errors = ref(new FormErrors({}))
  const isLoading = ref(false)
  const route = useRoute()
  const router = useRouter()

  onMounted(async () => {
    if (route.params.id) {
      isLoading.value = true
      item.value = meta.load((await api.get(addTrailingSlash(meta.endpoint) + route.params.id)).data) as unknown as Entity
      isLoading.value = false
    }
  })

  const save = async () => {
    let response = null
    isLoading.value = true
    if (route.params.id) {
      response = await api.put(addTrailingSlash(meta.endpoint) + item.value.id, meta.dump(item.value as unknown as T))
    } else {
      response = await api.post(meta.endpoint, meta.dump(item.value as unknown as T))
    }
    isLoading.value = false

    if (response?.data?.errors) errors.value = meta.errors(response?.data?.errors)
    if (response?.status === 200 || response?.status === 201) router.push({ name: redirect })

    isLoading.value = false
  }

  return {
    item: item as unknown as Ref<T>,
    errors,
    save,
    isLoading
  }
}