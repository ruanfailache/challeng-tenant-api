import { Readable } from 'stream'
import { Company } from '@/domain/models/company'
import { Company as PrismaCompany } from '@/generated/prisma/client'
import { CreateCompanyRequest } from '@/infrastructure/adapters/in/rest/dto/requests/company/create-company.request'
import type { UploadResult } from '@/infrastructure/adapters/out/aws/dto/upload-result.dto'

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

export function getMockedCreateCompanyRequest(): CreateCompanyRequest {
  return {
    name: 'Mocked Company',
  }
}

export function getMockedLogoFile(): Express.Multer.File {
  return {
    fieldname: 'logo',
    originalname: 'company-logo.png',
    encoding: '7bit',
    mimetype: 'image/png',
    buffer: Buffer.from('fake-image-content'),
    size: 1024,
    stream: null as unknown as Readable,
    destination: '',
    filename: '',
    path: '',
  }
}

export function getMockedUploadResult(): UploadResult {
  return {
    fileId: 'file-id-123',
    key: 'logos/company-id-123.png',
    bucket: 'test-bucket',
  }
}

export function getMockedMappedCompany(): Company {
  const request = getMockedCreateCompanyRequest()
  const uploadResult = getMockedUploadResult()
  const logoFile = getMockedLogoFile()

  const company = new Company()
  company.name = request.name
  company.logoKey = uploadResult.key
  company.logoBucket = uploadResult.bucket
  company.logoFileType = logoFile.mimetype
  return company
}

export function getMockedExpectedCompany(): Company {
  const mappedCompany = getMockedMappedCompany()
  mappedCompany.id = 'company-id-123'
  mappedCompany.createdAt = new Date()
  mappedCompany.updatedAt = new Date()
  return mappedCompany
}
