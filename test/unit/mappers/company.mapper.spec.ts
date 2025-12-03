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
        logoKey: 'logos/acme.png',
        logoBucket: 'company-logos',
        logoFileType: 'image/png',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = sut.fromEntityToDomain(entity)

      expect(result).toBeDefined()
      expect(result.id).toBe(entity.id)
      expect(result.name).toBe(entity.name)
      expect(result.logoKey).toBe(entity.logoKey)
      expect(result.logoBucket).toBe(entity.logoBucket)
      expect(result.logoFileType).toBe(entity.logoFileType)
      expect(result.createdAt).toBe(entity.createdAt)
      expect(result.updatedAt).toBe(entity.updatedAt)
    })

    it('should handle null logo fields', () => {
      const entity = {
        id: '2',
        name: 'No Logo Corp',
        logoKey: null,
        logoBucket: null,
        logoFileType: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = sut.fromEntityToDomain(entity)

      expect(result).toBeDefined()
      expect(result.id).toBe(entity.id)
      expect(result.name).toBe(entity.name)
      expect(result.logoKey).toBeUndefined()
      expect(result.logoBucket).toBeUndefined()
      expect(result.logoFileType).toBeUndefined()
      expect(result.createdAt).toBe(entity.createdAt)
      expect(result.updatedAt).toBe(entity.updatedAt)
    })
  })
})
