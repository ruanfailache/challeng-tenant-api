import { randomUUID } from 'node:crypto'
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UploadOptions } from '../dto/upload-options.dto'
import { UploadResult } from '../dto/upload-result.dto'
import type { FileInput } from '../types/file-input.type'

const CONTENT_TYPE_MAP = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  txt: 'text/plain',
  csv: 'text/csv',
} as const

const DEFAULT_EXPIRES_IN = 3600

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name)
  private readonly s3Client: S3Client
  private readonly bucket: string

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET', '')
    this.s3Client = this.createS3Client()
  }

  async uploadFile(
    file: FileInput,
    originalName: string,
    options?: UploadOptions,
  ): Promise<UploadResult> {
    const fileId = randomUUID()
    const key = this.buildKey(fileId, originalName, options?.folder)
    const buffer = this.extractBuffer(file)
    const contentType =
      options?.contentType || this.detectContentType(originalName)

    await this.putObject(
      key,
      buffer,
      contentType,
      originalName,
      fileId,
      options?.metadata,
    )

    this.logger.log(`File uploaded: ${key}`)

    return { fileId, key, bucket: this.bucket }
  }

  getSignedUrl(key: string, expiresIn = DEFAULT_EXPIRES_IN): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key })
    return getSignedUrl(this.s3Client, command, { expiresIn })
  }

  private createS3Client(): S3Client {
    return new S3Client({
      region: this.configService.get<string>('AWS_REGION', 'us-east-1'),
      endpoint: this.configService.get<string>('AWS_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
          '',
        ),
      },
      forcePathStyle: true,
    })
  }

  private buildKey(
    fileId: string,
    originalName: string,
    folder?: string,
  ): string {
    const extension = this.extractExtension(originalName)
    const fileName = `${fileId}${extension ? `.${extension}` : ''}`
    return folder ? `${folder}/${fileName}` : fileName
  }

  private extractExtension(filename: string): string | undefined {
    return filename.split('.').pop()
  }

  private extractBuffer(file: FileInput): Buffer {
    return Buffer.isBuffer(file) ? file : file.buffer
  }

  private detectContentType(filename: string): string {
    const extension = this.extractExtension(filename)?.toLowerCase() || ''
    return CONTENT_TYPE_MAP[extension] || 'application/octet-stream'
  }

  private async putObject(
    key: string,
    buffer: Buffer,
    contentType: string,
    originalName: string,
    fileId: string,
    metadata?: Record<string, string>,
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      Metadata: { originalName, fileId, ...metadata },
    })

    await this.s3Client.send(command)
  }
}
