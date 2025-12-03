import { Company } from '@/domain/models/company'
import { Company as PrismaCompany } from '@/generated/prisma/client'

export function getMockedCompany(): Company {
  const company = new Company()
  company.id = 'company-id-123'
  company.name = 'Mocked Company'
  company.logoKey = 'logos/company-id-123.png'
  company.logoBucket = 'test-bucket'
  company.logoFileType = 'image/png'
  company.createdAt = new Date()
  company.updatedAt = new Date()
  return company
}

export function getMockedCompanyEntity(): PrismaCompany {
  return {
    id: 'company-id-123',
    name: 'Mocked Company',
    logoKey: 'logos/company-id-123.png',
    logoBucket: 'test-bucket',
    logoFileType: 'image/png',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}
