import { getMockedMembership } from '@mocks/membership.mock'
import { ForbiddenException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { SelectCompanyUseCase } from '@/application/usecases/company/select-company.usecase'
import { MembershipMapper } from '@/domain/mappers/membership.mapper'
import { MembershipRepository } from '@/infrastructure/adapters/out/database/repositories/membership.repository'
import { PrismaService } from '@/infrastructure/adapters/out/database/services/prisma.service'

const MOCKED_USER_ID = 'user-id-123'
const MOCKED_COMPANY_ID = 'company-id-123'
const MOCKED_MEMBERSHIP = getMockedMembership()

describe('SelectCompanyUseCase', () => {
  let sut: SelectCompanyUseCase

  let mockedMembershipRepository: MembershipRepository

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SelectCompanyUseCase,
        MembershipMapper,
        MembershipRepository,
        PrismaService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-value'),
          },
        },
      ],
    }).compile()

    sut = moduleRef.get<SelectCompanyUseCase>(SelectCompanyUseCase)
    mockedMembershipRepository = moduleRef.get<MembershipRepository>(MembershipRepository)

    jest.spyOn(mockedMembershipRepository, 'findByUserIdAndCompanyId').mockResolvedValue(MOCKED_MEMBERSHIP)

    jest.spyOn(mockedMembershipRepository, 'deactivateAllByUserId').mockResolvedValue(undefined)

    jest
      .spyOn(mockedMembershipRepository, 'activateByUserIdAndCompanyId')
      .mockResolvedValue({ ...MOCKED_MEMBERSHIP, isActive: true })
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
    expect(mockedMembershipRepository).toBeDefined()
  })

  it('should select a company successfully', async () => {
    const result = await sut.execute(MOCKED_USER_ID, MOCKED_COMPANY_ID)

    expect(result).toBeDefined()
    expect(result.isActive).toBe(true)
  })

  it('should throw ForbiddenException if user has no membership with company', async () => {
    jest.spyOn(mockedMembershipRepository, 'findByUserIdAndCompanyId').mockResolvedValue(null)

    await expect(sut.execute(MOCKED_USER_ID, MOCKED_COMPANY_ID)).rejects.toThrow(ForbiddenException)
  })

  it('should deactivate all user memberships before activating the new one', async () => {
    await sut.execute(MOCKED_USER_ID, MOCKED_COMPANY_ID)

    expect(mockedMembershipRepository.deactivateAllByUserId).toHaveBeenCalledWith(MOCKED_USER_ID)
    expect(mockedMembershipRepository.activateByUserIdAndCompanyId).toHaveBeenCalledWith(
      MOCKED_USER_ID,
      MOCKED_COMPANY_ID,
    )
  })

  it('should verify membership exists before deactivating', async () => {
    await sut.execute(MOCKED_USER_ID, MOCKED_COMPANY_ID)

    expect(mockedMembershipRepository.findByUserIdAndCompanyId).toHaveBeenCalledWith(MOCKED_USER_ID, MOCKED_COMPANY_ID)
  })

  it('should call deactivate before activate', async () => {
    const callOrder: string[] = []

    jest.spyOn(mockedMembershipRepository, 'deactivateAllByUserId').mockImplementation(() => {
      callOrder.push('deactivate')
      return Promise.resolve()
    })

    jest.spyOn(mockedMembershipRepository, 'activateByUserIdAndCompanyId').mockImplementation(() => {
      callOrder.push('activate')
      return Promise.resolve({ ...MOCKED_MEMBERSHIP, isActive: true })
    })

    await sut.execute(MOCKED_USER_ID, MOCKED_COMPANY_ID)

    expect(callOrder).toEqual(['deactivate', 'activate'])
  })
})
