import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import type { SendEmailOptions } from '@/infrastructure/adapters/out/aws/dto/send-email-options.dto'
import { SesService } from '@/infrastructure/adapters/out/aws/services/ses.service'

jest.mock('@aws-sdk/client-ses')

describe('SesService', () => {
  let sut: SesService

  let mockedConfigService: jest.Mocked<ConfigService>
  let mockedSesClient: jest.Mocked<SESClient>

  const mockConfig = {
    AWS_SES_SOURCE_EMAIL: 'noreply@example.com',
    AWS_REGION: 'us-east-1',
    AWS_ACCESS_KEY_ID: 'test-key',
    AWS_SECRET_ACCESS_KEY: 'test-secret',
  }

  beforeEach(async () => {
    mockedSesClient = {
      send: jest.fn().mockResolvedValue({ MessageId: 'test-message-id' }),
    } as unknown as jest.Mocked<SESClient>

    ;(SESClient as jest.Mock).mockImplementation(() => mockedSesClient)

    const moduleRef = await Test.createTestingModule({
      providers: [
        SesService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => mockConfig[key] || defaultValue),
          },
        },
      ],
    }).compile()

    sut = moduleRef.get<SesService>(SesService)
    mockedConfigService = moduleRef.get(ConfigService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('constructor', () => {
    it('should initialize SESClient with correct configuration', () => {
      expect(SESClient).toHaveBeenCalledWith({
        region: 'us-east-1',
        endpoint: undefined,
        credentials: {
          accessKeyId: 'test-key',
          secretAccessKey: 'test-secret',
        },
      })
    })

    it('should retrieve source email from config', () => {
      expect(mockedConfigService.get).toHaveBeenCalledWith('AWS_SES_SOURCE_EMAIL', '')
    })
  })

  describe('sendEmail', () => {
    const baseEmailOptions: SendEmailOptions = {
      to: 'recipient@example.com',
      subject: 'Test Subject',
      body: 'Test body content',
    }

    it('should send email with single recipient', async () => {
      const result = await sut.sendEmail(baseEmailOptions)

      expect(result).toEqual({ messageId: 'test-message-id' })
      expect(mockedSesClient.send).toHaveBeenCalledWith(expect.any(SendEmailCommand))
    })

    it('should send email with multiple recipients', async () => {
      const options: SendEmailOptions = {
        ...baseEmailOptions,
        to: ['recipient1@example.com', 'recipient2@example.com'],
      }

      const result = await sut.sendEmail(options)

      expect(result).toEqual({ messageId: 'test-message-id' })
      expect(mockedSesClient.send).toHaveBeenCalled()
    })

    it('should send HTML email when isHtml is true', async () => {
      const options: SendEmailOptions = {
        ...baseEmailOptions,
        body: '<h1>HTML Content</h1>',
        isHtml: true,
      }

      const result = await sut.sendEmail(options)

      expect(result.messageId).toBe('test-message-id')
      expect(mockedSesClient.send).toHaveBeenCalled()
    })

    it('should send plain text email when isHtml is false', async () => {
      const options: SendEmailOptions = {
        ...baseEmailOptions,
        isHtml: false,
      }

      const result = await sut.sendEmail(options)

      expect(result.messageId).toBe('test-message-id')
      expect(mockedSesClient.send).toHaveBeenCalled()
    })

    it('should include CC recipients when provided', async () => {
      const options: SendEmailOptions = {
        ...baseEmailOptions,
        cc: 'cc@example.com',
      }

      const result = await sut.sendEmail(options)

      expect(result.messageId).toBe('test-message-id')
      expect(mockedSesClient.send).toHaveBeenCalled()
    })

    it('should include multiple CC recipients', async () => {
      const options: SendEmailOptions = {
        ...baseEmailOptions,
        cc: ['cc1@example.com', 'cc2@example.com'],
      }

      const result = await sut.sendEmail(options)

      expect(result.messageId).toBe('test-message-id')
      expect(mockedSesClient.send).toHaveBeenCalled()
    })

    it('should include BCC recipients when provided', async () => {
      const options: SendEmailOptions = {
        ...baseEmailOptions,
        bcc: 'bcc@example.com',
      }

      const result = await sut.sendEmail(options)

      expect(result.messageId).toBe('test-message-id')
      expect(mockedSesClient.send).toHaveBeenCalled()
    })

    it('should include reply-to addresses when provided', async () => {
      const options: SendEmailOptions = {
        ...baseEmailOptions,
        replyTo: 'reply@example.com',
      }

      const result = await sut.sendEmail(options)

      expect(result.messageId).toBe('test-message-id')
      expect(mockedSesClient.send).toHaveBeenCalled()
    })

    it('should include multiple reply-to addresses', async () => {
      const options: SendEmailOptions = {
        ...baseEmailOptions,
        replyTo: ['reply1@example.com', 'reply2@example.com'],
      }

      const result = await sut.sendEmail(options)

      expect(result.messageId).toBe('test-message-id')
      expect(mockedSesClient.send).toHaveBeenCalled()
    })

    it('should return empty messageId when response has no MessageId', async () => {
      mockedSesClient.send = jest.fn().mockResolvedValue({ MessageId: undefined })

      const result = await sut.sendEmail(baseEmailOptions)

      expect(result.messageId).toBe('')
    })

    it('should throw error when SES client fails', async () => {
      mockedSesClient.send.mockImplementation(() => {
        throw new Error('SES send failed')
      })

      await expect(sut.sendEmail(baseEmailOptions)).rejects.toThrow('SES send failed')
    })

    it('should send email with all optional fields', async () => {
      const options: SendEmailOptions = {
        to: ['recipient@example.com'],
        subject: 'Full Email',
        body: '<p>Full content</p>',
        isHtml: true,
        cc: ['cc@example.com'],
        bcc: ['bcc@example.com'],
        replyTo: ['reply@example.com'],
      }

      const result = await sut.sendEmail(options)

      expect(result.messageId).toBe('test-message-id')
      expect(mockedSesClient.send).toHaveBeenCalled()
    })
  })
})
