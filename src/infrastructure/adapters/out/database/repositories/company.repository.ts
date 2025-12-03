import { Injectable } from '@nestjs/common'
import { CompanyMapper } from '@/domain/mappers/company.mapper'
import { Company } from '@/domain/models/company'
import { PrismaService } from '../services/prisma.service'

@Injectable()
export class CompanyRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly companyMapper: CompanyMapper,
  ) {}

  async create(company: Company): Promise<Company> {
    const createdCompany = await this.prismaService.company.create({
      data: {
        name: company.name,
        logoUrl: company.logoUrl,
      },
    })
    return this.companyMapper.fromEntityToDomain(createdCompany)
  }
}
