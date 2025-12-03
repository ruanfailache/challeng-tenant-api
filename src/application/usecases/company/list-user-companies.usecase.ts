import { Injectable } from '@nestjs/common'
import { Company } from '@/domain/models/company'
import { Page } from '@/infrastructure/adapters/in/rest/dto/responses/common/paginated.response'
import { CompanyRepository } from '@/infrastructure/adapters/out/database/repositories/company.repository'

@Injectable()
export class ListUserCompaniesUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(userId: string, page = 1, size = 10): Promise<Page<Company>> {
    const { companies, total } =
      await this.companyRepository.findByUserIdPaginated(userId, page, size)

    return new Page(companies, total, page, size)
  }
}
