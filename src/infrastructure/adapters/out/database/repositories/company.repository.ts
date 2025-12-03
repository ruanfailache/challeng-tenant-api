import { Injectable } from '@nestjs/common'
import { PaginatedCompanies } from '@/domain/aggregates/company/paginated-companies.aggregate'
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

  async findByUserIdPaginated(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedCompanies> {
    const skip = (page - 1) * limit

    const [companies, total] = await Promise.all([
      this.prismaService.company.findMany({
        where: {
          memberships: {
            some: { userId },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.company.count({
        where: {
          memberships: {
            some: { userId },
          },
        },
      }),
    ])

    return {
      companies: companies.map((c) => this.companyMapper.fromEntityToDomain(c)),
      total,
    }
  }
}
