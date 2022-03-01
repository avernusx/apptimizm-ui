import { Ref, ref } from 'vue'
import debounce from 'lodash/debounce'
import IAxiosInterface from '../IAxiosInterface'

export default function usePaginatedBackend (
  endpoint: string,
  api: IAxiosInterface,
  params: Ref<{ [code: string]: string }>,
  perPage: Ref<number>,
  paginationType: string = 'page',
  itemConverter: (item: any) => any = (item: any) => item,
  scrollPagination: boolean = false,
  responseItemsKey: string = 'items',
  responseTotalKey: string = 'total',
  orderingKey: string = 'ordering'
) {
  const page = ref(0)
  const count = ref(0)
  const pages = ref(0)
  const sort = ref('')
  const sortDir = ref(true)
  const isLoading = ref(false)
  const items: Ref<any[]> = ref([])

  const load = debounce(async function () {
    const queryParams: { [code: string]: string|number } = (paginationType === 'page' ? {
      ...params.value, per_page: perPage.value, page: page.value + 1
    } : {
      ...params.value, limit: perPage.value, offset: page.value * perPage.value
    })

    if (sort.value !== '') {
      queryParams[orderingKey] = (sortDir.value ? '' : '-') + sort.value
    }

    isLoading.value = true
    const response = (await api.get(endpoint, { params: queryParams })).data
    count.value = response[responseTotalKey]
    const responseItems = response[responseItemsKey].map((i: any) => itemConverter(i))
    items.value = scrollPagination ? [...items.value, ...responseItems] : responseItems
    pages.value = Math.ceil(count.value / perPage.value)
    isLoading.value = false
  }, 500)

  const reload = async () => {
    isLoading.value = true
    page.value = 0
    items.value = []
    await load()
  }

  const loadNext = async () => {
    if (isLoading.value || page.value >= pages.value - 1) return
    page.value++
    load()
  }

  const loadPrev = async () => {
    if (isLoading.value || page.value === 0) return
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
