import { getMockedMappedUser } from '@mocks/user.mock'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { SecurityService } from '@/infrastructure/security/services/security.service'

describe('SecurityService', () => {
  let sut: SecurityService

  let mockedReflector: Reflector
  let mockedJwtService: JwtService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [SecurityService, Reflector, JwtService],
    }).compile()

    sut = moduleRef.get<SecurityService>(SecurityService)

    mockedReflector = moduleRef.get<Reflector>(Reflector)
    mockedJwtService = moduleRef.get<JwtService>(JwtService)
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
    expect(mockedReflector).toBeDefined()
    expect(mockedJwtService).toBeDefined()
  })

  describe('generateToken', () => {
    it('should call jwtService.signAsync with correct values', async () => {
      const signAsyncSpy = jest.spyOn(mockedJwtService, 'signAsync').mockResolvedValue('any_token')

      const user = getMockedMappedUser()

      await sut.generateToken(user)

      expect(signAsyncSpy).toHaveBeenCalledWith({ userId: user.id })
    })
  })

  describe('verifyToken', () => {
    it('should call jwtService.verifyAsync with correct values', async () => {
      const verifyAsyncSpy = jest.spyOn(mockedJwtService, 'verifyAsync').mockResolvedValue({ userId: 'any_id' })

      const token = 'any_token'

      await sut.verifyToken(token)

      expect(verifyAsyncSpy).toHaveBeenCalledWith(token)
    })
  })
})
