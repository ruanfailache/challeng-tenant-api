import {
  getMockedCreateCompanyRequest,
  getMockedExpectedCompany,
  getMockedLogoFile,
  getMockedMappedCompany,
  getMockedUploadResult,
} from '@mocks/company.mock'
import { getMockedOwnerMembership } from '@mocks/membership.mock'
import { BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { CreateCompanyUseCase } from '@/application/usecases/company/create-company.usecase'
import { CompanyMapper } from '@/domain/mappers/company.mapper'
import { MembershipMapper } from '@/domain/mappers/membership.mapper'
import { Role } from '@/generated/prisma/enums'
import { S3Service } from '@/infrastructure/adapters/out/aws/services/s3.service'
import { CompanyRepository } from '@/infrastructure/adapters/out/database/repositories/company.repository'
import { MembershipRepository } from '@/infrastructure/adapters/out/database/repositories/membership.repository'
import { PrismaService } from '@/infrastructure/adapters/out/database/services/prisma.service'

const MOCKED_USER_ID = 'logged-user-id-123'
const MOCKED_REQUEST = getMockedCreateCompanyRequest()
const MOCKED_LOGO_FILE = getMockedLogoFile()
const MOCKED_UPLOAD_RESULT = getMockedUploadResult()
const MOCKED_MAPPED_COMPANY = getMockedMappedCompany()
const MOCKED_EXPECTED_COMPANY = getMockedExpectedCompany()
const MOCKED_ACTIVE_MEMBERSHIP = getMockedOwnerMembership(MOCKED_USER_ID, MOCKED_EXPECTED_COMPANY.id, true)
const MOCKED_INACTIVE_MEMBERSHIP = getMockedOwnerMembership(MOCKED_USER_ID, MOCKED_EXPECTED_COMPANY.id, false)

describe('CreateCompanyUseCase', () => {
  let sut: CreateCompanyUseCase

  let mockedCompanyMapper: CompanyMapper
  let mockedMembershipMapper: MembershipMapper
  let mockedS3Service: S3Service
  let mockedCompanyRepository: CompanyRepository
  let mockedMembershipRepository: MembershipRepository

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CreateCompanyUseCase,
        CompanyMapper,
        MembershipMapper,
        CompanyRepository,
        MembershipRepository,
        PrismaService,
        {
          provide: S3Service,
          useValue: {
            uploadFile: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-value'),
          },
        },
      ],
    }).compile()

    sut = moduleRef.get<CreateCompanyUseCase>(CreateCompanyUseCase)

    mockedCompanyMapper = moduleRef.get<CompanyMapper>(CompanyMapper)
    mockedMembershipMapper = moduleRef.get<MembershipMapper>(MembershipMapper)
    mockedS3Service = moduleRef.get<S3Service>(S3Service)
    mockedCompanyRepository = moduleRef.get<CompanyRepository>(CompanyRepository)
    mockedMembershipRepository = moduleRef.get<MembershipRepository>(MembershipRepository)

    jest.spyOn(mockedCompanyMapper, 'fromCreateRequestToDomain').mockReturnValue(MOCKED_MAPPED_COMPANY)

    jest.spyOn(mockedS3Service, 'uploadFile').mockResolvedValue(MOCKED_UPLOAD_RESULT)

    jest.spyOn(mockedCompanyRepository, 'create').mockResolvedValue(MOCKED_EXPECTED_COMPANY)

    jest.spyOn(mockedMembershipRepository, 'findActiveByUserId').mockResolvedValue(null)

    jest.spyOn(mockedMembershipRepository, 'create').mockResolvedValue(MOCKED_ACTIVE_MEMBERSHIP)

    jest.spyOn(mockedMembershipMapper, 'fromCreateInputToDomain').mockReturnValue(MOCKED_ACTIVE_MEMBERSHIP)
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
    expect(mockedCompanyMapper).toBeDefined()
    expect(mockedMembershipMapper).toBeDefined()
    expect(mockedS3Service).toBeDefined()
    expect(mockedCompanyRepository).toBeDefined()
    expect(mockedMembershipRepository).toBeDefined()
  })

  it('should create a company successfully', async () => {
    const result = await sut.execute(MOCKED_REQUEST, MOCKED_LOGO_FILE, MOCKED_USER_ID)

    expect(result).toBeDefined()
    expect(result).toBe(MOCKED_EXPECTED_COMPANY)
  })

  it('should upload the logo file to S3', async () => {
    await sut.execute(MOCKED_REQUEST, MOCKED_LOGO_FILE, MOCKED_USER_ID)

    expect(mockedS3Service.uploadFile).toHaveBeenCalledWith(MOCKED_LOGO_FILE, MOCKED_LOGO_FILE.originalname, {
      folder: 'logos',
    })
  })

  it('should map the request to domain with upload result', async () => {
    await sut.execute(MOCKED_REQUEST, MOCKED_LOGO_FILE, MOCKED_USER_ID)

    expect(mockedCompanyMapper.fromCreateRequestToDomain).toHaveBeenCalledWith({
      request: MOCKED_REQUEST,
      uploadResult: MOCKED_UPLOAD_RESULT,
      fileType: MOCKED_LOGO_FILE.mimetype,
    })
  })

  it('should save the company to the repository', async () => {
    await sut.execute(MOCKED_REQUEST, MOCKED_LOGO_FILE, MOCKED_USER_ID)

    expect(mockedCompanyRepository.create).toHaveBeenCalledWith(MOCKED_MAPPED_COMPANY)
  })

  it('should throw an error if no logo file is provided', async () => {
    await expect(
      sut.execute(MOCKED_REQUEST, undefined as unknown as Express.Multer.File, MOCKED_USER_ID),
    ).rejects.toThrow(BadRequestException)
  })

  it('should return the created company with logo information', async () => {
    const result = await sut.execute(MOCKED_REQUEST, MOCKED_LOGO_FILE, MOCKED_USER_ID)

    expect(result.logoKey).toBe(MOCKED_EXPECTED_COMPANY.logoKey)
    expect(result.logoBucket).toBe(MOCKED_EXPECTED_COMPANY.logoBucket)
    expect(result.logoFileType).toBe(MOCKED_EXPECTED_COMPANY.logoFileType)
  })

  it('should create a membership with OWNER role for the logged user', async () => {
    await sut.execute(MOCKED_REQUEST, MOCKED_LOGO_FILE, MOCKED_USER_ID)

    expect(mockedMembershipMapper.fromCreateInputToDomain).toHaveBeenCalledWith({
      userId: MOCKED_USER_ID,
      companyId: MOCKED_EXPECTED_COMPANY.id,
      role: Role.OWNER,
      isActive: true,
    })
    expect(mockedMembershipRepository.create).toHaveBeenCalled()
  })

  it('should create an active membership if user has no active membership', async () => {
    jest.spyOn(mockedMembershipRepository, 'findActiveByUserId').mockResolvedValue(null)

    await sut.execute(MOCKED_REQUEST, MOCKED_LOGO_FILE, MOCKED_USER_ID)

    expect(mockedMembershipMapper.fromCreateInputToDomain).toHaveBeenCalledWith({
      userId: MOCKED_USER_ID,
      companyId: MOCKED_EXPECTED_COMPANY.id,
      role: Role.OWNER,
      isActive: true,
    })
  })

  it('should create an inactive membership if user already has an active membership', async () => {
    jest.spyOn(mockedMembershipRepository, 'findActiveByUserId').mockResolvedValue(MOCKED_ACTIVE_MEMBERSHIP)

    jest.spyOn(mockedMembershipMapper, 'fromCreateInputToDomain').mockReturnValue(MOCKED_INACTIVE_MEMBERSHIP)

    await sut.execute(MOCKED_REQUEST, MOCKED_LOGO_FILE, MOCKED_USER_ID)

    expect(mockedMembershipMapper.fromCreateInputToDomain).toHaveBeenCalledWith({
      userId: MOCKED_USER_ID,
      companyId: MOCKED_EXPECTED_COMPANY.id,
      role: Role.OWNER,
      isActive: false,
    })
  })
})
