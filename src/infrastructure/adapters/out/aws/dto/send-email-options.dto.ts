export interface SendEmailOptions {
  to: string | string[]
  subject: string
  body: string
  isHtml?: boolean
  cc?: string | string[]
  bcc?: string | string[]
  replyTo?: string | string[]
}
