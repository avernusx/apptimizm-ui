<script lang="tsx">
interface ISlotsPaginationElementProps {
  page: number
  pages: number
  params?: { [key: string]: string }
}

interface IEventsPaginationElementProps {
  page: number
  pages: number
  onEvents: boolean
  onPageChange: (i: number) => void
}

interface IRoutesPaginationElementProps {
  page: number
  pages: number
  routeName: string
  params?: { [key: string]: string }
}

type IPaginationElementProps = ISlotsPaginationElementProps | IEventsPaginationElementProps | IRoutesPaginationElementProps

function isSlotsPaginationElementProps (props: IPaginationElementProps): props is ISlotsPaginationElementProps {
  return !('onEvents' in props) && !('routeName' in props)
}

function isEventsPaginationElementProps (props: IPaginationElementProps): props is IEventsPaginationElementProps {
  return 'onEvents' in props
}

function isRoutesPaginationElementProps (props: IPaginationElementProps): props is IRoutesPaginationElementProps {
  return 'routeName' in props
}

const PaginationElement = (props: IPaginationElementProps, context: any) => {
  const page = Number(props.page)
  const pages = Number(props.pages)

  const items = []

  if (page >= 6) items.push('...')

  for (let i = -3; i < 4; i++) {
    const item = page + i
    if (item < 2) continue
    if (item >= pages) break
    items.push(item)
  }

  if (page <= pages - 5) items.push('...')

  const pageClass = (i: number) => i === page ? 'page active' : 'page'

  const getPage = (i: number) => {
    if (isRoutesPaginationElementProps(props)) return <router-link class={pageClass(Number(i))} to={{ name: props.routeName, query: { ...props.params, page: i } }}>{i}</router-link>
    if (isSlotsPaginationElementProps(props)) return context.slots.default ? context.slots.default({ page: i, params: props.params }) : null
    if (isEventsPaginationElementProps(props)) return <div class={pageClass(Number(i))} onClick={() => context.emit('pageChange', i)}>{i}</div>
  }

  const getFirstPage = () => getPage(1)
  const getLastPage = () => getPage(pages)

  const getPrevPage = () => {
    if (isRoutesPaginationElementProps(props)) return <router-link class="prev" to={{ name: props.routeName, query: { ...props.params, page: page - 1 } }}/>
    if (isSlotsPaginationElementProps(props)) return context.slots.prev ? context.slots.prev({ page: page - 1, params: props.params }) : null
    if (isEventsPaginationElementProps(props)) return <div class="prev" onClick={() => context.emit('pageChange', page - 1)}/>
  }

  const getNextPage = () => {
    if (isRoutesPaginationElementProps(props)) return <router-link class="next" to={{ name: props.routeName, query: { ...props.params, page: page + 1 } }}/>
    if (isSlotsPaginationElementProps(props)) return context.slots.next ? context.slots.next({ page: page + 1, params: props.params }) : null
    if (isEventsPaginationElementProps(props)) return <div class="next" onClick={() => context.emit('pageChange', page + 1)}/>
  }

  return (
    <div>
      <div class="pagination">
        { page > 1 ? getPrevPage() : null }
        { getFirstPage() }
        { items.map(i => Number.isInteger(i) ? getPage(Number(i)) : (<div class="page">...</div>)) }
        { getLastPage() }
        { page < pages ? getNextPage() : null }
      </div>
    </div>
  )
}

export default PaginationElement
</script>

<style lang="sass" scoped>
.pagination
  display: flex
  .page, .prev, .next
    cursor: pointer
    padding: 4px
</style>
