import DefaultSelect from '../default-select/default-select'

import './pagination.sass'

interface ISlotsPaginationElementProps {
  page: number
  pages: number
  perPage: number
  count: number
  onPerPageChange: (i: number) => void
  params?: { [key: string]: string }
}

interface IEventsPaginationElementProps {
  page: number
  pages: number
  perPage: number
  count: number
  onPerPageChange: (i: number) => void
  onEvents: boolean
  onPageChange: (i: number) => void
}

interface IRoutesPaginationElementProps {
  page: number
  pages: number
  perPage: number
  count: number
  onPerPageChange: (i: number) => void
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

const perPageOptions = [
  { id: '10', name: '10' },
  { id: '20', name: '20' },
  { id: '50', name: '50' }
]

const PaginationElement = (props: IPaginationElementProps, context: any) => {
  const page = Number(props.page)
  const pages = Number(props.pages)
  const count = Number(props.count)
  const perPage = Number(props.perPage)

  const items = []

  if (page >= 6) items.push('...')

  for (let i = -3; i < 4; i++) {
    const item = page + i
    if (item < 2) continue
    if (item >= pages) break
    items.push(item)
  }

  if (page <= pages - 5) items.push('...')

  const pageClass = (i: number) => i === page ? 'apptimizm-ui-pagination-page active' : 'apptimizm-ui-pagination-page'

  const getPage = (i: number) => {
    if (isRoutesPaginationElementProps(props)) return <router-link to={{ name: props.routeName, query: { ...props.params, page: i } }}>{i}</router-link>
    if (isSlotsPaginationElementProps(props)) return context.slots.default ? context.slots.default({ page: i, params: props.params }) : null
    if (isEventsPaginationElementProps(props)) return <div class={pageClass(Number(i))} onClick={() => context.emit('pageChange', i)}>{i}</div>
  }

  const getFirstPage = () => getPage(1)
  const getLastPage = () => getPage(pages)

  const getPrevPage = () => {
    if (isRoutesPaginationElementProps(props)) return <router-link class="apptimizm-ui-pagination-prev" to={{ name: props.routeName, query: { ...props.params, page: page - 1 } }}/>
    if (isSlotsPaginationElementProps(props)) return context.slots.prev ? context.slots.prev({ page: page - 1, params: props.params }) : null
    if (isEventsPaginationElementProps(props)) return <div class="apptimizm-ui-pagination-prev" onClick={() => context.emit('pageChange', page - 1)}/>
  }

  const getNextPage = () => {
    if (isRoutesPaginationElementProps(props)) return <router-link class="apptimizm-ui-pagination-next" to={{ name: props.routeName, query: { ...props.params, page: page + 1 } }}/>
    if (isSlotsPaginationElementProps(props)) return context.slots.next ? context.slots.next({ page: page + 1, params: props.params }) : null
    if (isEventsPaginationElementProps(props)) return <div class="apptimizm-ui-pagination-next" onClick={() => context.emit('pageChange', page + 1)}/>
  }

  const setPage = (e: Event) => {
    if (isEventsPaginationElementProps(props)) props.onPageChange(Number((e.target as HTMLInputElement).value))
  }

  return (
    <div>
      <div class="apptimizm-ui-pagination">
        <div class="apptimizm-ui-pagination-count">Всего: { count }</div>
        <div class="apptimizm-ui-pagination-per-page">
          <span>Показать:</span>
          <DefaultSelect
            items={perPageOptions}
            modelValue={{ id: String(props.perPage), name: String(props.perPage) }}
            onValueChange={(i: { id: string }) => props.onPerPageChange(Number(i.id))}
          />
        </div>
        <div class="apptimizm-ui-pagination-pages">
          { page > 1 ? getPrevPage() : null }
          { getFirstPage() }
          { items.map(i => Number.isInteger(i) ? getPage(Number(i)) : (<div class="apptimizm-ui-pagination-page">...</div>)) }
          { getLastPage() }
          { page < pages ? getNextPage() : null }
        </div>
        { isEventsPaginationElementProps(props) && (
          <div class="apptimizm-ui-pagination-to-page">
            <span>Перейти:</span>
            <input
              type="number"
              onBlur={setPage}
              onKeypress={(e: KeyboardEvent) => { if (e.keyCode === 13) setPage(e) }}
            />
          </div>
        ) }
      </div>
    </div>
  )
}

export default PaginationElement
