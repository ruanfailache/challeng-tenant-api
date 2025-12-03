import { Company } from '@/domain/models/company'

export interface PaginatedCompanies {
  companies: Company[]
  total: number
}
