import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { SendEmailOptions } from '../dto/send-email-options.dto'
import type { SendEmailResult } from '../dto/send-email-result.dto'

@Injectable()
export class SesService {
  private readonly logger = new Logger(SesService.name)
  private readonly sesClient: SESClient
  private readonly sourceEmail: string

  constructor(private readonly configService: ConfigService) {
    this.sourceEmail = this.configService.get<string>('AWS_SES_SOURCE_EMAIL', '')
    this.sesClient = this.createSesClient()
  }

  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const { to, subject, body, isHtml, cc, bcc, replyTo } = options

    const command = new SendEmailCommand({
      Source: this.sourceEmail,
      Destination: {
        ToAddresses: this.toArray(to),
        CcAddresses: cc ? this.toArray(cc) : undefined,
        BccAddresses: bcc ? this.toArray(bcc) : undefined,
      },
      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
        Body: isHtml ? { Html: { Charset: 'UTF-8', Data: body } } : { Text: { Charset: 'UTF-8', Data: body } },
      },
      ReplyToAddresses: replyTo ? this.toArray(replyTo) : undefined,
    })

    const response = await this.sesClient.send(command)

    this.logger.log(`Email sent to ${this.toArray(to).join(', ')}: ${response.MessageId}`)

    return { messageId: response.MessageId ?? '' }
  }

  private createSesClient(): SESClient {
    return new SESClient({
      region: this.configService.get<string>('AWS_REGION', 'us-east-1'),
      endpoint: this.configService.get<string>('AWS_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY', ''),
      },
    })
  }

  private toArray(value: string | string[]): string[] {
    return Array.isArray(value) ? value : [value]
  }
}
