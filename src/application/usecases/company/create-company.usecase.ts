import { BadRequestException, Injectable } from '@nestjs/common'
import { CompanyMapper } from '@/domain/mappers/company.mapper'
import { MembershipMapper } from '@/domain/mappers/membership.mapper'
import { Company } from '@/domain/models/company'
import { Role } from '@/generated/prisma/enums'
import { CreateCompanyRequest } from '@/infrastructure/adapters/in/rest/dto/requests/company/create-company.request'
import { S3Service } from '@/infrastructure/adapters/out/aws/services/s3.service'
import { CompanyRepository } from '@/infrastructure/adapters/out/database/repositories/company.repository'
import { MembershipRepository } from '@/infrastructure/adapters/out/database/repositories/membership.repository'

@Injectable()
export class CreateCompanyUseCase {
  constructor(
    private readonly companyMapper: CompanyMapper,
    private readonly membershipMapper: MembershipMapper,
    private readonly s3Service: S3Service,
    private readonly companyRepository: CompanyRepository,
    private readonly membershipRepository: MembershipRepository,
  ) {}

  async execute(request: CreateCompanyRequest, logoFile: Express.Multer.File, userId: string): Promise<Company> {
    if (!logoFile) {
      throw new BadRequestException('Logo file is required')
    }

    const uploadResult = await this.s3Service.uploadFile(logoFile, logoFile.originalname, { folder: 'logos' })

    const mappedCompany = this.companyMapper.fromCreateRequestToDomain({
      request,
      uploadResult,
      fileType: logoFile.mimetype,
    })

    const createdCompany = await this.companyRepository.create(mappedCompany)

    const existingActiveMembership = await this.membershipRepository.findActiveByUserId(userId)

    const isActive = !existingActiveMembership

    const membership = this.membershipMapper.fromCreateInputToDomain({
      userId,
      companyId: createdCompany.id,
      role: Role.OWNER,
      isActive,
    })

    await this.membershipRepository.create(membership)

    return createdCompany
  }
}
