import { Injectable } from '@nestjs/common'
import { Company } from '@/domain/models/company'
import { Company as PrismaCompany } from '@/generated/prisma/client'

@Injectable()
export class CompanyMapper {
  fromEntityToDomain(entity: PrismaCompany): Company {
    const company = new Company()
    company.id = entity.id
    company.name = entity.name
    company.logoKey = entity.logoKey ?? undefined
    company.logoBucket = entity.logoBucket ?? undefined
    company.logoFileType = entity.logoFileType ?? undefined
    company.createdAt = entity.createdAt
    company.updatedAt = entity.updatedAt
    return company
  }
}
