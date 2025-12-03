import { Company } from '@/domain/models/company'
import { Company as PrismaCompany } from '@/generated/prisma/client'

export function getMockedCompany(): Company {
  const company = new Company()
  company.id = 'company-id-123'
  company.name = 'Mocked Company'
  company.logoUrl = 'https://example.com/logo.png'
  company.createdAt = new Date()
  company.updatedAt = new Date()
  return company
}

export function getMockedCompanyEntity(): PrismaCompany {
  return {
    id: 'company-id-123',
    name: 'Mocked Company',
    logoUrl: 'https://example.com/logo.png',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}
