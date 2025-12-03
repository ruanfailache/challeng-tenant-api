import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CreateUserUseCase } from '@/application/usecases/user/create-user.usecase'
import { Public } from '@/infrastructure/security/decorators/public.decorator'
import { CreateUserRequest } from '../dto/requests/user/create-user.request'

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Public()
  @Post('/signup')
  @ApiOperation({ summary: 'User Sign Up', description: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  signUp(@Body() createUserRequest: CreateUserRequest) {
    return this.createUserUseCase.execute(createUserRequest)
  }
}
