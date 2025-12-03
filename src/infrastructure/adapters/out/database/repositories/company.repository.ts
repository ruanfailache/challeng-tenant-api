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
        logoKey: company.logoKey,
        logoBucket: company.logoBucket,
        logoFileType: company.logoFileType,
      },
    })
    return this.companyMapper.fromEntityToDomain(createdCompany)
  }

  async findById(id: string): Promise<Company | null> {
    const company = await this.prismaService.company.findUnique({
      where: { id },
    })
    if (!company) {
      return null
    }
    return this.companyMapper.fromEntityToDomain(company)
  }

  async update(id: string, data: Partial<Company>): Promise<Company> {
    const updatedCompany = await this.prismaService.company.update({
      where: { id },
      data: {
        name: data.name,
        logoKey: data.logoKey,
        logoBucket: data.logoBucket,
        logoFileType: data.logoFileType,
      },
    })
    return this.companyMapper.fromEntityToDomain(updatedCompany)
  }
}
