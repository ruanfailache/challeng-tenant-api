import { Injectable } from '@nestjs/common'
import { Company } from '@/domain/models/company'
import { PrismaService } from '../services/prisma.service'

@Injectable()
export class CompanyRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(company: Company): Promise<Company> {
    return this.prismaService.company.create({
      data: {
        name: company.name,
        logoUrl: company.logoUrl,
      },
    })
  }
}
