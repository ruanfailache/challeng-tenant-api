import { Body, Controller, Post } from '@nestjs/common'
import { CreateUserUseCase } from '@/application/usecases/user/create-user.usecase'
import { Public } from '@/infrastructure/security/decorators/public.decorator'
import { CreateUserRequest } from '../dto/requests/user/create-user.request'

@Controller('auth')
export class AuthController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Public()
  @Post('/signup')
  signUp(@Body() createUserRequest: CreateUserRequest) {
    return this.createUserUseCase.execute(createUserRequest)
  }
}
