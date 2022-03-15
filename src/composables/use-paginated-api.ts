import { Ref, ref } from 'vue'
import debounce from 'lodash/debounce'
import IAxiosInterface from '../IAxiosInterface'

export default function usePaginatedBackend (
  endpoint: string,
  api: IAxiosInterface,
  params: Ref<{ [code: string]: string|string[] }>,
  perPage: Ref<number>,
  paginationType: string = 'page',
  itemConverter: (item: any) => any = (item: any) => item,
  scrollPagination: boolean = false,
  responseItemsKey: string = 'items',
  responseTotalKey: string = 'total',
  orderingKey: string = 'ordering',
  requestPageKey: string = 'page',
  requestPerPageKey: string = 'per_page'
) {
  const page = ref(1)
  const count = ref(0)
  const pages = ref(0)
  const sort = ref('')
  const sortDir = ref(true)
  const isLoading = ref(false)
  const items: Ref<any[]> = ref([])

  const load = debounce(async function (callback?: () => void) {
    const queryParams: { [code: string]: string|string[]|number } = { ...params.value }

    if (paginationType === 'page') {
      queryParams[requestPageKey] = page.value
      queryParams[requestPerPageKey] = perPage.value
    } else {
      queryParams.limit = perPage.value
      queryParams.offset = (page.value - 1) * perPage.value
    }

    if (sort.value !== '') {
      queryParams[orderingKey] = (sortDir.value ? '' : '-') + sort.value
    }

    isLoading.value = true

    let response

    try {
      response = (await api.get(endpoint, { params: queryParams })).data
    } catch (e) {
      const error = e as any

      if (error.response?.status && typeof (window) !== 'undefined') {
        const event = new Event(`Error ${error.response?.status}`, { bubbles: true })
        window.dispatchEvent(event)
      }

      return
    }

    count.value = response[responseTotalKey]
    const responseItems = response[responseItemsKey].map((i: any) => itemConverter(i))
    items.value = scrollPagination ? [...items.value, ...responseItems] : responseItems
    pages.value = Math.ceil(count.value / perPage.value)
    isLoading.value = false
    if (callback) callback()
  }, 500)

  const reload = async () => {
    isLoading.value = true
    page.value = 1
    items.value = []
    await load()
  }

  const loadNext = async () => {
    if (isLoading.value || page.value >= pages.value - 1) return
    page.value++
    load()
  }

  const loadPrev = async () => {
    if (isLoading.value || page.value === 1) return
    page.value--
    load()
  }

  const loadPage = async (p: number) => {
    page.value = p
    load()
  }

  const setSort = (s: string) => {
    sort.value === s ? sortDir.value = !sortDir.value : sort.value = s
    reload()
  }

  return {
    page,
    pages,
    count,
    isLoading,
    items,
    load,
    reload,
    loadNext,
    loadPrev,
    loadPage,
    setSort
  }
}
