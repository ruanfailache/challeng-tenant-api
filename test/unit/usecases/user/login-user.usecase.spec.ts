import { getMockedCreateUserRequest, getMockedExpectedUser } from '@mocks/user.mock'
import { UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { LoginUserUseCase } from '@/application/usecases/user/login-user.usecase'
import { UserMapper } from '@/domain/mappers/user.mapper'
import { LoginRequest } from '@/infrastructure/adapters/in/rest/dto/requests/auth/login.request'
import { UserRepository } from '@/infrastructure/adapters/out/database/repositories/user.repository'
import { PrismaService } from '@/infrastructure/adapters/out/database/services/prisma.service'
import { CryptorService } from '@/infrastructure/security/services/cryptor.service'

const MOCKED_USER = getMockedExpectedUser()

function getMockedLoginRequest(): LoginRequest {
  const createRequest = getMockedCreateUserRequest()
  return {
    email: createRequest.email,
    password: 'anothersecurepassword',
  }
}

describe('LoginUserUseCase', () => {
  let sut: LoginUserUseCase

  let mockedUserRepository: UserRepository
  let mockedCryptorService: CryptorService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [LoginUserUseCase, UserRepository, CryptorService, PrismaService, JwtService, UserMapper],
    }).compile()

    sut = moduleRef.get<LoginUserUseCase>(LoginUserUseCase)

    mockedUserRepository = moduleRef.get<UserRepository>(UserRepository)
    mockedCryptorService = moduleRef.get<CryptorService>(CryptorService)

    jest.spyOn(mockedUserRepository, 'findByEmail').mockResolvedValue(MOCKED_USER)
    jest.spyOn(mockedCryptorService, 'comparePassword').mockResolvedValue(true)
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  it('should login successfully and return access token', async () => {
    const request = getMockedLoginRequest()

    const result = await sut.execute(request)

    expect(result).toBeDefined()
    expect(result).toBe(MOCKED_USER)
  })

  it('should throw UnauthorizedException if user is not found', async () => {
    jest.spyOn(mockedUserRepository, 'findByEmail').mockResolvedValue(null)

    const request = getMockedLoginRequest()

    await expect(sut.execute(request)).rejects.toThrow(UnauthorizedException)
  })

  it('should throw UnauthorizedException if password is invalid', async () => {
    jest.spyOn(mockedCryptorService, 'comparePassword').mockResolvedValue(false)

    const request = getMockedLoginRequest()

    await expect(sut.execute(request)).rejects.toThrow(UnauthorizedException)
  })

  it('should call userRepository.findByEmail with correct email', async () => {
    const request = getMockedLoginRequest()

    await sut.execute(request)

    expect(mockedUserRepository.findByEmail).toHaveBeenCalledWith(request.email)
  })

  it('should call cryptorService.comparePassword with correct arguments', async () => {
    const request = getMockedLoginRequest()

    await sut.execute(request)

    expect(mockedCryptorService.comparePassword).toHaveBeenCalledWith(request.password, MOCKED_USER.password)
  })
})
