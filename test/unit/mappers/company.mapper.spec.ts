import { Test } from '@nestjs/testing'
import { CompanyMapper } from '@/domain/mappers/company.mapper'

describe('CompanyMapper', () => {
  let sut: CompanyMapper

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [CompanyMapper],
    }).compile()

    sut = moduleRef.get<CompanyMapper>(CompanyMapper)
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('fromEntityToDomain', () => {
    it('should map PrismaCompany entity to Company domain model', () => {
      const entity = {
        id: '1',
        name: 'Acme Corp',
        logoUrl: 'http://example.com/logo.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = sut.fromEntityToDomain(entity)

      expect(result).toBeDefined()
      expect(result.id).toBe(entity.id)
      expect(result.name).toBe(entity.name)
      expect(result.logoUrl).toBe(entity.logoUrl)
      expect(result.createdAt).toBe(entity.createdAt)
      expect(result.updatedAt).toBe(entity.updatedAt)
    })
  })
})
