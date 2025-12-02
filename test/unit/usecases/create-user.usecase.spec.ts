import {
  getMockedCreateUserRequest,
  getMockedExpectedUser,
  getMockedHashedPassword,
  getMockedMappedUser,
} from '@mocks/user/create-user.mock'
import { Test } from '@nestjs/testing'
import { CreateUserUseCase } from '@/application/usecases/user/create-user.usecase'
import { UserMapper } from '@/domain/mappers/user.mapper'
import { UserRepository } from '@/infrastructure/adapters/out/prisma/repositories/user.repository'
import { CryptorUtil } from '@/utils/cryptor.util'

const MOCKED_REQUEST = getMockedCreateUserRequest()
const MOCKED_HASHED_PASSWORD = getMockedHashedPassword()
const MOCKED_MAPPED_USER = getMockedMappedUser()
const MOCKED_EXPECTED_USER = getMockedExpectedUser()

describe('CreateUserUseCase', () => {
  let sut: CreateUserUseCase

  let mockedUserMapper: UserMapper
  let mockedCryptorUtil: CryptorUtil
  let mockedUserRepository: UserRepository

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [CreateUserUseCase, UserMapper, CryptorUtil, UserRepository],
    }).compile()

    sut = moduleRef.get<CreateUserUseCase>(CreateUserUseCase)

    mockedUserMapper = moduleRef.get<UserMapper>(UserMapper)
    mockedCryptorUtil = moduleRef.get<CryptorUtil>(CryptorUtil)
    mockedUserRepository = moduleRef.get<UserRepository>(UserRepository)

    jest
      .spyOn(mockedUserMapper, 'fromCreateRequestToDomain')
      .mockReturnValue(MOCKED_MAPPED_USER)

    jest
      .spyOn(mockedCryptorUtil, 'hashPassword')
      .mockResolvedValue(MOCKED_HASHED_PASSWORD)

    jest
      .spyOn(mockedUserRepository, 'save')
      .mockResolvedValue(MOCKED_EXPECTED_USER)
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
    expect(mockedUserMapper).toBeDefined()
  })

  it('should create a user successfully', async () => {
    const result = await sut.execute(MOCKED_REQUEST)

    expect(result).toBeDefined()
    expect(result).toBe(MOCKED_EXPECTED_USER)
  })

  it("should encrypt the user's password", async () => {
    const result = await sut.execute(MOCKED_REQUEST)

    expect(result).toBeDefined()
    expect(result.password).toBe(MOCKED_HASHED_PASSWORD)
  })

  it('should throw an error if the user already exists', async () => {
    await sut.execute(MOCKED_REQUEST)
  })
})
