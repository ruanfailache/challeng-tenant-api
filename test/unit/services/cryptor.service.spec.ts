import { Test } from '@nestjs/testing'
import { CryptorService } from '@/infrastructure/security/services/cryptor.service'

describe('CryptorService', () => {
  let sut: CryptorService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [CryptorService],
    }).compile()

    sut = moduleRef.get<CryptorService>(CryptorService)
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('hashPassword', () => {
    it('should hash the password', async () => {
      const password = 'mysecretpassword'
      const hashedPassword = await sut.hashPassword(password)

      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(password)
    })
  })

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      const password = 'mysecretpassword'
      const hashedPassword = await sut.hashPassword(password)

      const isMatch = await sut.comparePassword(password, hashedPassword)

      expect(isMatch).toBe(true)
    })

    it('should return false for non-matching passwords', async () => {
      const password = 'mysecretpassword'
      const hashedPassword = await sut.hashPassword(password)

      const isMatch = await sut.comparePassword('wrongpassword', hashedPassword)

      expect(isMatch).toBe(false)
    })
  })
})
