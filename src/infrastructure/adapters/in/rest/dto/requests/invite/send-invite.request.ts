import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator'
import { Role } from '@/generated/prisma/enums'

export class SendInviteRequest {
  @ApiProperty({ description: 'Email of the user to invite' })
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({ description: 'Role to assign to the invited user', enum: Role })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role
}
