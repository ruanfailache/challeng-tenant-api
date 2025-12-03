import { IsNotEmpty } from 'class-validator'

export class CreateCompanyRequest {
  @IsNotEmpty()
  name: string
}
