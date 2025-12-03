import { Injectable } from '@nestjs/common'
import { Company } from '@/domain/models/company'
import { Company as PrismaCompany } from '@/generated/prisma/client'
import { CreateCompanyRequest } from '@/infrastructure/adapters/in/rest/dto/requests/company/create-company.request'
import type { UploadResult } from '@/infrastructure/adapters/out/aws/dto/upload-result.dto'

export interface CreateCompanyMapperInput {
  request: CreateCompanyRequest
  uploadResult: UploadResult
  fileType: string
}

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

  fromCreateRequestToDomain(input: CreateCompanyMapperInput): Company {
    const company = new Company()
    company.name = input.request.name
    company.logoKey = input.uploadResult.key
    company.logoBucket = input.uploadResult.bucket
    company.logoFileType = input.fileType
    return company
  }
}
