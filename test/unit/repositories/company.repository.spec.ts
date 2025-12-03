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
      jest.spyOn(mockedCompanyMapper, 'fromEntityToDomain').mockReturnValue(MOCKED_COMPANY)

      jest.spyOn(mockedPrismaService.company, 'create').mockResolvedValue(MOCKED_COMPANY_ENTITY)

      const result = await sut.create(MOCKED_COMPANY)

      expect(mockedPrismaService.company.create).toHaveBeenCalledWith({
        data: {
          name: MOCKED_COMPANY.name,
          logoKey: MOCKED_COMPANY.logoKey,
          logoBucket: MOCKED_COMPANY.logoBucket,
          logoFileType: MOCKED_COMPANY.logoFileType,
        },
      })
      expect(mockedCompanyMapper.fromEntityToDomain).toHaveBeenCalledWith(MOCKED_COMPANY_ENTITY)
      expect(result).toBe(MOCKED_COMPANY)
    })
  })

  describe('findById', () => {
    it('should return the company domain model when found', async () => {
      jest.spyOn(mockedPrismaService.company, 'findUnique').mockResolvedValue(MOCKED_COMPANY_ENTITY)

      jest.spyOn(mockedCompanyMapper, 'fromEntityToDomain').mockReturnValue(MOCKED_COMPANY)

      const result = await sut.findById(MOCKED_COMPANY.id)

      expect(mockedPrismaService.company.findUnique).toHaveBeenCalledWith({
        where: { id: MOCKED_COMPANY.id },
      })
      expect(mockedCompanyMapper.fromEntityToDomain).toHaveBeenCalledWith(MOCKED_COMPANY_ENTITY)
      expect(result).toBe(MOCKED_COMPANY)
    })

    it('should return null when company is not found', async () => {
      jest.spyOn(mockedPrismaService.company, 'findUnique').mockResolvedValue(null)

      const result = await sut.findById('non-existent-id')

      expect(mockedPrismaService.company.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      })
      expect(result).toBeNull()
    })
  })

  describe('update', () => {
    it('should update the company and return the updated domain model', async () => {
      const updatedData = { name: 'Updated Company Name' }

      jest.spyOn(mockedPrismaService.company, 'update').mockResolvedValue(MOCKED_COMPANY_ENTITY)

      jest.spyOn(mockedCompanyMapper, 'fromEntityToDomain').mockReturnValue(MOCKED_COMPANY)

      const result = await sut.update(MOCKED_COMPANY.id, updatedData)

      expect(mockedPrismaService.company.update).toHaveBeenCalledWith({
        where: { id: MOCKED_COMPANY.id },
        data: {
          name: updatedData.name,
          logoKey: undefined,
          logoBucket: undefined,
          logoFileType: undefined,
        },
      })
      expect(mockedCompanyMapper.fromEntityToDomain).toHaveBeenCalledWith(MOCKED_COMPANY_ENTITY)
      expect(result).toBe(MOCKED_COMPANY)
    })
  })

  describe('findByUserIdPaginated', () => {
    const userId = 'user-id-123'
    const page = 1
    const limit = 10

    it('should return paginated companies for a user', async () => {
      jest.spyOn(mockedPrismaService.company, 'findMany').mockResolvedValue([MOCKED_COMPANY_ENTITY])

      jest.spyOn(mockedPrismaService.company, 'count').mockResolvedValue(1)

      jest.spyOn(mockedCompanyMapper, 'fromEntityToDomain').mockReturnValue(MOCKED_COMPANY)

      const result = await sut.findByUserIdPaginated(userId, page, limit)

      expect(mockedPrismaService.company.findMany).toHaveBeenCalledWith({
        where: {
          memberships: {
            some: { userId },
          },
        },
        skip: 0,
        take: limit,
        orderBy: { createdAt: 'desc' },
      })
      expect(mockedPrismaService.company.count).toHaveBeenCalledWith({
        where: {
          memberships: {
            some: { userId },
          },
        },
      })
      expect(result.companies).toHaveLength(1)
      expect(result.companies[0]).toBe(MOCKED_COMPANY)
      expect(result.total).toBe(1)
    })

    it('should calculate correct skip value for pagination', async () => {
      const pageTwo = 2
      const limitTwenty = 20

      jest.spyOn(mockedPrismaService.company, 'findMany').mockResolvedValue([MOCKED_COMPANY_ENTITY])

      jest.spyOn(mockedPrismaService.company, 'count').mockResolvedValue(25)

      jest.spyOn(mockedCompanyMapper, 'fromEntityToDomain').mockReturnValue(MOCKED_COMPANY)

      await sut.findByUserIdPaginated(userId, pageTwo, limitTwenty)

      expect(mockedPrismaService.company.findMany).toHaveBeenCalledWith({
        where: {
          memberships: {
            some: { userId },
          },
        },
        skip: 20,
        take: limitTwenty,
        orderBy: { createdAt: 'desc' },
      })
    })

    it('should return empty array when user has no companies', async () => {
      jest.spyOn(mockedPrismaService.company, 'findMany').mockResolvedValue([])

      jest.spyOn(mockedPrismaService.company, 'count').mockResolvedValue(0)

      const result = await sut.findByUserIdPaginated(userId, page, limit)

      expect(result.companies).toHaveLength(0)
      expect(result.total).toBe(0)
    })

    it('should map all returned entities to domain models', async () => {
      const secondEntity = { ...MOCKED_COMPANY_ENTITY, id: 'company-id-456' }

      jest.spyOn(mockedPrismaService.company, 'findMany').mockResolvedValue([MOCKED_COMPANY_ENTITY, secondEntity])

      jest.spyOn(mockedPrismaService.company, 'count').mockResolvedValue(2)

      jest.spyOn(mockedCompanyMapper, 'fromEntityToDomain').mockReturnValue(MOCKED_COMPANY)

      const result = await sut.findByUserIdPaginated(userId, page, limit)

      expect(mockedCompanyMapper.fromEntityToDomain).toHaveBeenCalledTimes(2)
      expect(result.companies).toHaveLength(2)
      expect(result.total).toBe(2)
    })
  })
})
