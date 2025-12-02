import { Test } from '@nestjs/testing'
import { CryptorUtil } from '@/utils/cryptor.util'

describe('CryptorUtil', () => {
  let sut: CryptorUtil

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [CryptorUtil],
    }).compile()

    sut = moduleRef.get<CryptorUtil>(CryptorUtil)
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
