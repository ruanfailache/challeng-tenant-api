import { getMockedCompany } from '@mocks/company.mock'
import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { ListUserCompaniesUseCase } from '@/application/usecases/company/list-user-companies.usecase'
import { CompanyMapper } from '@/domain/mappers/company.mapper'
import { CompanyRepository } from '@/infrastructure/adapters/out/database/repositories/company.repository'
import { PrismaService } from '@/infrastructure/adapters/out/database/services/prisma.service'

const MOCKED_USER_ID = 'user-id-123'
const MOCKED_COMPANY = getMockedCompany()
const MOCKED_PAGINATED_RESULT = {
  companies: [MOCKED_COMPANY],
  total: 1,
}

describe('ListUserCompaniesUseCase', () => {
  let sut: ListUserCompaniesUseCase

  let mockedCompanyRepository: CompanyRepository

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ListUserCompaniesUseCase,
        CompanyMapper,
        CompanyRepository,
        PrismaService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-value'),
          },
        },
      ],
    }).compile()

    sut = moduleRef.get<ListUserCompaniesUseCase>(ListUserCompaniesUseCase)
    mockedCompanyRepository = moduleRef.get<CompanyRepository>(CompanyRepository)

    jest.spyOn(mockedCompanyRepository, 'findByUserIdPaginated').mockResolvedValue(MOCKED_PAGINATED_RESULT)
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
    expect(mockedCompanyRepository).toBeDefined()
  })

  it('should return paginated companies for the user', async () => {
    const result = await sut.execute(MOCKED_USER_ID, 1, 10)

    expect(result).toBeDefined()
    expect(result.content).toHaveLength(1)
    expect(result.content[0]).toBe(MOCKED_COMPANY)
    expect(result.totalElements).toBe(1)
    expect(result.number).toBe(1)
    expect(result.size).toBe(10)
  })

  it('should call repository with correct parameters', async () => {
    await sut.execute(MOCKED_USER_ID, 2, 20)

    expect(mockedCompanyRepository.findByUserIdPaginated).toHaveBeenCalledWith(MOCKED_USER_ID, 2, 20)
  })

  it('should return correct total pages', async () => {
    jest.spyOn(mockedCompanyRepository, 'findByUserIdPaginated').mockResolvedValue({
      companies: [MOCKED_COMPANY],
      total: 25,
    })

    const result = await sut.execute(MOCKED_USER_ID, 1, 10)

    expect(result.totalPages).toBe(3)
  })

  it('should return empty content when user has no companies', async () => {
    jest.spyOn(mockedCompanyRepository, 'findByUserIdPaginated').mockResolvedValue({
      companies: [],
      total: 0,
    })

    const result = await sut.execute(MOCKED_USER_ID, 1, 10)

    expect(result.content).toHaveLength(0)
    expect(result.totalElements).toBe(0)
    expect(result.totalPages).toBe(0)
    expect(result.empty).toBe(true)
  })

  it('should use default pagination values', async () => {
    await sut.execute(MOCKED_USER_ID)

    expect(mockedCompanyRepository.findByUserIdPaginated).toHaveBeenCalledWith(MOCKED_USER_ID, 1, 10)
  })

  it('should set first to true when on first page', async () => {
    const result = await sut.execute(MOCKED_USER_ID, 1, 10)

    expect(result.first).toBe(true)
  })

  it('should set last to true when on last page', async () => {
    jest.spyOn(mockedCompanyRepository, 'findByUserIdPaginated').mockResolvedValue({
      companies: [MOCKED_COMPANY],
      total: 5,
    })

    const result = await sut.execute(MOCKED_USER_ID, 1, 10)

    expect(result.last).toBe(true)
  })

  it('should set last to false when not on last page', async () => {
    jest.spyOn(mockedCompanyRepository, 'findByUserIdPaginated').mockResolvedValue({
      companies: [MOCKED_COMPANY],
      total: 25,
    })

    const result = await sut.execute(MOCKED_USER_ID, 1, 10)

    expect(result.last).toBe(false)
  })

  it('should return correct numberOfElements', async () => {
    const result = await sut.execute(MOCKED_USER_ID, 1, 10)

    expect(result.numberOfElements).toBe(1)
  })
})
