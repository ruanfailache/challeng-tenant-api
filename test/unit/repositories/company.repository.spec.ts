import { getMockedCompany, getMockedCompanyEntity } from '@mocks/company.mock'
import { Test } from '@nestjs/testing'
import { CompanyMapper } from '@/domain/mappers/company.mapper'
import { CompanyRepository } from '@/infrastructure/adapters/out/database/repositories/company.repository'
import { PrismaService } from '@/infrastructure/adapters/out/database/services/prisma.service'

const MOCKED_COMPANY = getMockedCompany()
const MOCKED_COMPANY_ENTITY = getMockedCompanyEntity()

describe('CompanyRepository', () => {
  let sut: CompanyRepository

  let mockedPrismaService: PrismaService
  let mockedCompanyMapper: CompanyMapper

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [CompanyRepository, CompanyMapper, PrismaService],
    }).compile()

    sut = moduleRef.get<CompanyRepository>(CompanyRepository)

    mockedPrismaService = moduleRef.get<PrismaService>(PrismaService)
    mockedCompanyMapper = moduleRef.get<CompanyMapper>(CompanyMapper)
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
    expect(mockedPrismaService).toBeDefined()
    expect(mockedCompanyMapper).toBeDefined()
  })

  describe('create', () => {
    it('should create a new company and return the domain model', async () => {
      jest
        .spyOn(mockedCompanyMapper, 'fromEntityToDomain')
        .mockReturnValue(MOCKED_COMPANY)

      jest
        .spyOn(mockedPrismaService.company, 'create')
        .mockResolvedValue(MOCKED_COMPANY_ENTITY)

      const result = await sut.create(MOCKED_COMPANY)

      expect(mockedPrismaService.company.create).toHaveBeenCalledWith({
        data: {
          name: MOCKED_COMPANY.name,
          logoUrl: MOCKED_COMPANY.logoUrl,
        },
      })
      expect(mockedCompanyMapper.fromEntityToDomain).toHaveBeenCalledWith(
        MOCKED_COMPANY_ENTITY,
      )
      expect(result).toBe(MOCKED_COMPANY)
    })
  })
})
