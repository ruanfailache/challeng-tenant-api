import { getMockedCompany } from '@mocks/company.mock'
import { getMockedInvite } from '@mocks/invite.mock'
import { getMockedMembership } from '@mocks/membership.mock'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { SendInviteUseCase } from '@/application/usecases/invite/send-invite.usecase'
import { CompanyMapper } from '@/domain/mappers/company.mapper'
import { InviteMapper } from '@/domain/mappers/invite.mapper'
import { MembershipMapper } from '@/domain/mappers/membership.mapper'
import { Membership } from '@/domain/models/membership'
import { Role } from '@/generated/prisma/enums'
import { SendInviteRequest } from '@/infrastructure/adapters/in/rest/dto/requests/invite/send-invite.request'
import { SesService } from '@/infrastructure/adapters/out/aws/services/ses.service'
import { CompanyRepository } from '@/infrastructure/adapters/out/database/repositories/company.repository'
import { InviteRepository } from '@/infrastructure/adapters/out/database/repositories/invite.repository'
import { MembershipRepository } from '@/infrastructure/adapters/out/database/repositories/membership.repository'
import { PrismaService } from '@/infrastructure/adapters/out/database/services/prisma.service'

const MOCKED_USER_ID = 'logged-user-id-123'
const MOCKED_COMPANY_ID = 'company-id-123'
const MOCKED_COMPANY = getMockedCompany()
const MOCKED_INVITE = getMockedInvite()
const MOCKED_OWNER_MEMBERSHIP = getMockedMembership()
const MOCKED_SEND_INVITE_REQUEST: SendInviteRequest = {
  email: 'invitee@example.com',
  role: Role.MEMBER,
}

describe('SendInviteUseCase', () => {
  let sut: SendInviteUseCase

  let mockedInviteMapper: InviteMapper
  let mockedInviteRepository: InviteRepository
  let mockedCompanyRepository: CompanyRepository
  let mockedMembershipRepository: MembershipRepository
  let mockedSesService: SesService
  let mockedConfigService: ConfigService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SendInviteUseCase,
        InviteMapper,
        InviteRepository,
        CompanyMapper,
        CompanyRepository,
        MembershipMapper,
        MembershipRepository,
        PrismaService,
        {
          provide: SesService,
          useValue: {
            sendEmail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:3000'),
          },
        },
      ],
    }).compile()

    sut = moduleRef.get<SendInviteUseCase>(SendInviteUseCase)

    mockedInviteMapper = moduleRef.get<InviteMapper>(InviteMapper)
    mockedInviteRepository = moduleRef.get<InviteRepository>(InviteRepository)
    mockedCompanyRepository = moduleRef.get<CompanyRepository>(CompanyRepository)
    mockedMembershipRepository = moduleRef.get<MembershipRepository>(MembershipRepository)
    mockedSesService = moduleRef.get<SesService>(SesService)
    mockedConfigService = moduleRef.get<ConfigService>(ConfigService)

    jest.spyOn(mockedCompanyRepository, 'findById').mockResolvedValue(MOCKED_COMPANY)
    jest.spyOn(mockedMembershipRepository, 'findByUserIdAndCompanyId').mockResolvedValue(MOCKED_OWNER_MEMBERSHIP)
    jest.spyOn(mockedInviteMapper, 'fromCreateInputToDomain').mockReturnValue(MOCKED_INVITE)
    jest.spyOn(mockedInviteRepository, 'create').mockResolvedValue(MOCKED_INVITE)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
    expect(mockedInviteMapper).toBeDefined()
    expect(mockedInviteRepository).toBeDefined()
    expect(mockedCompanyRepository).toBeDefined()
    expect(mockedMembershipRepository).toBeDefined()
    expect(mockedSesService).toBeDefined()
    expect(mockedConfigService).toBeDefined()
  })

  it('should send an invite successfully', async () => {
    const result = await sut.execute(MOCKED_SEND_INVITE_REQUEST, MOCKED_COMPANY_ID, MOCKED_USER_ID)

    expect(result).toBeDefined()
    expect(result).toBe(MOCKED_INVITE)
  })

  it('should throw NotFoundException when company does not exist', async () => {
    jest.spyOn(mockedCompanyRepository, 'findById').mockResolvedValue(null)

    await expect(sut.execute(MOCKED_SEND_INVITE_REQUEST, MOCKED_COMPANY_ID, MOCKED_USER_ID)).rejects.toThrow(
      NotFoundException,
    )
  })

  it('should throw ForbiddenException when user is not a member of the company', async () => {
    jest.spyOn(mockedMembershipRepository, 'findByUserIdAndCompanyId').mockResolvedValue(null)

    await expect(sut.execute(MOCKED_SEND_INVITE_REQUEST, MOCKED_COMPANY_ID, MOCKED_USER_ID)).rejects.toThrow(
      ForbiddenException,
    )
  })

  it('should throw ForbiddenException when user is a MEMBER role', async () => {
    const memberMembership = { ...MOCKED_OWNER_MEMBERSHIP, role: Role.MEMBER } as Membership
    jest.spyOn(mockedMembershipRepository, 'findByUserIdAndCompanyId').mockResolvedValue(memberMembership)

    await expect(sut.execute(MOCKED_SEND_INVITE_REQUEST, MOCKED_COMPANY_ID, MOCKED_USER_ID)).rejects.toThrow(
      ForbiddenException,
    )
  })

  it('should allow OWNER to send invites', async () => {
    const ownerMembership = { ...MOCKED_OWNER_MEMBERSHIP, role: Role.OWNER } as Membership
    jest.spyOn(mockedMembershipRepository, 'findByUserIdAndCompanyId').mockResolvedValue(ownerMembership)

    const result = await sut.execute(MOCKED_SEND_INVITE_REQUEST, MOCKED_COMPANY_ID, MOCKED_USER_ID)

    expect(result).toBeDefined()
  })

  it('should allow ADMIN to send invites', async () => {
    const adminMembership = { ...MOCKED_OWNER_MEMBERSHIP, role: Role.ADMIN } as Membership
    jest.spyOn(mockedMembershipRepository, 'findByUserIdAndCompanyId').mockResolvedValue(adminMembership)

    const result = await sut.execute(MOCKED_SEND_INVITE_REQUEST, MOCKED_COMPANY_ID, MOCKED_USER_ID)

    expect(result).toBeDefined()
  })

  it('should create an invite with the correct data', async () => {
    await sut.execute(MOCKED_SEND_INVITE_REQUEST, MOCKED_COMPANY_ID, MOCKED_USER_ID)

    expect(mockedInviteMapper.fromCreateInputToDomain).toHaveBeenCalledWith(
      expect.objectContaining({
        email: MOCKED_SEND_INVITE_REQUEST.email,
        userId: MOCKED_USER_ID,
        companyId: MOCKED_COMPANY_ID,
        role: MOCKED_SEND_INVITE_REQUEST.role,
        token: expect.any(String),
        expiresAt: expect.any(Date),
      }),
    )
  })

  it('should save the invite to the repository', async () => {
    await sut.execute(MOCKED_SEND_INVITE_REQUEST, MOCKED_COMPANY_ID, MOCKED_USER_ID)

    expect(mockedInviteRepository.create).toHaveBeenCalledWith(MOCKED_INVITE)
  })

  it('should send an email to the invited user', async () => {
    await sut.execute(MOCKED_SEND_INVITE_REQUEST, MOCKED_COMPANY_ID, MOCKED_USER_ID)

    expect(mockedSesService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: MOCKED_SEND_INVITE_REQUEST.email,
        subject: expect.stringContaining(MOCKED_COMPANY.name),
        body: expect.any(String),
        isHtml: true,
      }),
    )
  })

  it('should include the token in the email body', async () => {
    await sut.execute(MOCKED_SEND_INVITE_REQUEST, MOCKED_COMPANY_ID, MOCKED_USER_ID)

    expect(mockedSesService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.stringContaining('token'),
      }),
    )
  })

  it('should set expiration time to 1 day from now', async () => {
    const beforeExecution = Date.now()

    await sut.execute(MOCKED_SEND_INVITE_REQUEST, MOCKED_COMPANY_ID, MOCKED_USER_ID)

    const afterExecution = Date.now()
    const oneDayInMs = 24 * 60 * 60 * 1000

    expect(mockedInviteMapper.fromCreateInputToDomain).toHaveBeenCalledWith(
      expect.objectContaining({
        expiresAt: expect.any(Date),
      }),
    )

    const callArg = (mockedInviteMapper.fromCreateInputToDomain as jest.Mock).mock.calls[0][0]
    const expiresAt = callArg.expiresAt.getTime()

    expect(expiresAt).toBeGreaterThanOrEqual(beforeExecution + oneDayInMs)
    expect(expiresAt).toBeLessThanOrEqual(afterExecution + oneDayInMs)
  })

  it('should generate a UUID token', async () => {
    await sut.execute(MOCKED_SEND_INVITE_REQUEST, MOCKED_COMPANY_ID, MOCKED_USER_ID)

    const callArg = (mockedInviteMapper.fromCreateInputToDomain as jest.Mock).mock.calls[0][0]
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    expect(callArg.token).toMatch(uuidRegex)
  })
})
