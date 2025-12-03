export class Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean

  constructor(content: T[], totalElements: number, page: number, size: number) {
    const totalPages = totalElements > 0 ? Math.ceil(totalElements / size) : 0

    this.content = content
    this.totalElements = totalElements
    this.totalPages = totalPages
    this.size = size
    this.number = page
    this.numberOfElements = content.length
    this.first = page === 1
    this.last = page >= totalPages
    this.empty = content.length === 0
  }
}
