import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import type { UploadOptions } from '@/infrastructure/adapters/out/aws/dto/upload-options.dto'
import type { UploadResult } from '@/infrastructure/adapters/out/aws/dto/upload-result.dto'
import { S3Service } from '@/infrastructure/adapters/out/aws/services/s3.service'

jest.mock('@aws-sdk/client-s3')
jest.mock('@aws-sdk/s3-request-presigner')

describe('S3Service', () => {
  let sut: S3Service
  let mockedConfigService: jest.Mocked<ConfigService>
  let mockedS3Client: jest.Mocked<S3Client>

  const mockConfig = {
    AWS_S3_BUCKET: 'test-bucket',
    AWS_REGION: 'us-east-1',
    AWS_ACCESS_KEY_ID: 'test-key',
    AWS_SECRET_ACCESS_KEY: 'test-secret',
  }

  beforeEach(async () => {
    mockedS3Client = {
      send: jest.fn().mockResolvedValue({}),
    } as unknown as jest.Mocked<S3Client>

    ;(S3Client as jest.Mock).mockImplementation(() => mockedS3Client)

    const moduleRef = await Test.createTestingModule({
      providers: [
        S3Service,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => mockConfig[key] || defaultValue),
          },
        },
      ],
    }).compile()

    sut = moduleRef.get<S3Service>(S3Service)
    mockedConfigService = moduleRef.get(ConfigService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('constructor', () => {
    it('should initialize S3Client with correct configuration', () => {
      expect(S3Client).toHaveBeenCalledWith({
        region: 'us-east-1',
        endpoint: undefined,
        credentials: {
          accessKeyId: 'test-key',
          secretAccessKey: 'test-secret',
        },
        forcePathStyle: true,
      })
    })

    it('should retrieve bucket name from config', () => {
      expect(mockedConfigService.get).toHaveBeenCalledWith('AWS_S3_BUCKET', '')
    })
  })

  describe('uploadFile', () => {
    const mockBuffer = Buffer.from('test-content')
    const originalName = 'test-file.jpg'

    it('should upload file with buffer input', async () => {
      const result = await sut.uploadFile(mockBuffer, originalName)

      expect(result).toEqual({
        fileId: expect.any(String),
        key: expect.stringContaining('.jpg'),
        bucket: 'test-bucket',
      })
      expect(mockedS3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand))
    })

    it('should upload file with Multer file input', async () => {
      const multerFile = { buffer: mockBuffer } as Express.Multer.File

      const result = await sut.uploadFile(multerFile, originalName)

      expect(result).toEqual({
        fileId: expect.any(String),
        key: expect.stringContaining('.jpg'),
        bucket: 'test-bucket',
      })
      expect(mockedS3Client.send).toHaveBeenCalledTimes(1)
    })

    it('should build key with folder when provided', async () => {
      const result = await sut.uploadFile(mockBuffer, originalName, {
        folder: 'uploads',
      })

      expect(result.key).toMatch(/^uploads\/[a-f0-9-]+\.jpg$/)
    })

    it('should build key without folder when not provided', async () => {
      const result = await sut.uploadFile(mockBuffer, originalName)

      expect(result.key).toMatch(/^[a-f0-9-]+\.jpg$/)
      expect(result.key).not.toContain('/')
    })

    it('should upload file successfully and return result', async () => {
      await sut.uploadFile(mockBuffer, 'test.pdf')

      expect(mockedS3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand))
    })

    it('should accept custom content type', async () => {
      const result = await sut.uploadFile(mockBuffer, originalName, {
        contentType: 'custom/type',
      })

      expect(result.fileId).toBeDefined()
      expect(mockedS3Client.send).toHaveBeenCalled()
    })

    it('should handle files with unknown extensions', async () => {
      const result = await sut.uploadFile(mockBuffer, 'file.unknown')

      expect(result.key).toContain('.unknown')
      expect(mockedS3Client.send).toHaveBeenCalled()
    })

    it('should generate unique fileId for each upload', async () => {
      const result1 = await sut.uploadFile(mockBuffer, originalName)
      const result2 = await sut.uploadFile(mockBuffer, originalName)

      expect(result1.fileId).not.toBe(result2.fileId)
      expect(result1.key).not.toBe(result2.key)
    })

    it('should include custom metadata', async () => {
      const result = await sut.uploadFile(mockBuffer, originalName, {
        metadata: { userId: '123' },
      })

      expect(result.fileId).toBeDefined()
      expect(mockedS3Client.send).toHaveBeenCalled()
    })

    it('should handle files without extension', async () => {
      const result = await sut.uploadFile(mockBuffer, 'filename')

      expect(result.key).toMatch(/^[a-f0-9-]+\.filename$/)
    })

    it('should organize files in folders when specified', async () => {
      const result = await sut.uploadFile(mockBuffer, originalName, {
        folder: 'test',
      })

      expect(result.key).toMatch(/^test\/[a-f0-9-]+\.jpg$/)
    })

    it('should throw error when S3 client fails', async () => {
      mockedS3Client.send.mockImplementation(() => {
        throw new Error('S3 upload failed')
      })

      await expect(sut.uploadFile(mockBuffer, originalName)).rejects.toThrow()
    })
  })

  describe('getSignedUrl', () => {
    const mockKey = 'test-folder/test-file.jpg'
    const mockSignedUrl = 'https://s3.amazonaws.com/signed-url'

    beforeEach(() => {
      ;(getSignedUrl as jest.Mock).mockResolvedValue(mockSignedUrl)
    })

    it('should generate signed URL with default expiration', async () => {
      const url = await sut.getSignedUrl(mockKey)

      expect(url).toBe(mockSignedUrl)
      expect(getSignedUrl).toHaveBeenCalledWith(mockedS3Client, expect.any(GetObjectCommand), { expiresIn: 3600 })
    })

    it('should generate signed URL with custom expiration', async () => {
      const customExpiration = 7200
      await sut.getSignedUrl(mockKey, customExpiration)

      expect(getSignedUrl).toHaveBeenCalledWith(mockedS3Client, expect.any(GetObjectCommand), {
        expiresIn: customExpiration,
      })
    })

    it('should throw error when presigned URL generation fails', async () => {
      const error = new Error('Presigned URL failed')
      ;(getSignedUrl as jest.Mock).mockRejectedValue(error)

      await expect(sut.getSignedUrl(mockKey)).rejects.toThrow('Presigned URL failed')
    })
  })
})
