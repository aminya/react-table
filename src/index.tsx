import React, { useState } from 'react'
import { validateProps, ARROW } from './helpers'
import type { Props, State, SortInfo } from './types'

export default function ReactTable(props: Props) {
  const [state, setState] = useState<State>({sort: null})

  function defaultHeaderRenderer(item: any) {
    if (typeof item !== 'string') {
      throw new Error('Non-string header array fed to sb-react-table without renderHeaderColumn prop')
    }
    return item
  }
  function defaultBodyRenderer(row: Object, column: string) {
    const value = row[column]
    if (typeof value !== 'string') {
      throw new Error('Non-predictable rows fed to sb-react-table without renderBodyColumn prop')
    }
    return value
  }
  function getSort(): SortInfo {
    return state.sort || props.initialSort || []
  }
  function findSortItemByKey(column: string): number {
    const sort = getSort()
    if (Array.isArray(sort)) {
      for (let i = 0, length = sort.length; i < length; ++i) {
        if (sort[i].column === column) {
          return i
        }
      }
    }
    return -1
  }
  function generateSortCallback(column: string) {
    return (e: MouseEvent) => {
      let sort = getSort()
      const append = e.shiftKey

      const index = findSortItemByKey(column)
      if (index < 0) {
        const value = { column, type: 'asc' }
        sort = append ? sort : []
        sort.push(value)
      } else {
        const value: Object = sort[index]
        value.type = value.type === 'asc' ? 'desc' : null
        if (!append) {
          sort = value.type ? [value] : []
        } else if (!value.type) {
          sort.splice(index, 1)
        }
      }
      setState({ sort })
    }
  }
  function renderHeaderIcon(column: string) {
    const sort = getSort()
    const index = sort ? findSortItemByKey(column) : -1
    let icon = ARROW.BOTH
    if (sort && index !== -1) {
      icon = sort[index].type === 'asc' ? ARROW.UP : ARROW.DOWN
    }

    return <span className="sort-icon">{icon}</span>
  }

    const {
      rows: givenRows,
      columns,
      className = '',
      rowKey,
      sort,
      renderHeaderColumn = defaultHeaderRenderer,
      renderBodyColumn = defaultBodyRenderer,
    } = props

    validateProps(props)

    let rows = givenRows
    const sortInfo = getSort()
    if (sortInfo.length) {
      rows = sort(sortInfo, rows)
    }

    return (
      <table className={`sb-table ${className}`} style={props.style}>
        <thead>
          <tr>
            {columns.map(column => (
              <th
                key={column.key}
                className={column.sortable && 'sortable'}
                onClick={column.sortable && generateSortCallback(column.key)}
              >
                {renderHeaderColumn(column)} {column.sortable && renderHeaderIcon(column.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(function(row) {
            const key = rowKey(row)
            return (
              <tr key={key}>
                {columns.map(function(column) {
                  const givenOnClick = column.onClick
                  const onClick =
                    givenOnClick &&
                    function(e) {
                      givenOnClick(e, row)
                    }

                  return (
                    <td onClick={onClick} key={`${key}.${column.key}`}>
                      {renderBodyColumn(row, column.key)}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    )
}