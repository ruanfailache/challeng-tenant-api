import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CreateUserUseCase } from '@/application/usecases/user/create-user.usecase'
import { LoginUserUseCase } from '@/application/usecases/user/login-user.usecase'
import { Public } from '@/infrastructure/security/decorators/public.decorator'
import { SecurityService } from '@/infrastructure/security/services/security.service'
import { LoginRequest } from '../dto/requests/auth/login.request'
import { CreateUserRequest } from '../dto/requests/user/create-user.request'
import { AuthResponse } from '../dto/responses/auth/auth.response'

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly securityService: SecurityService,
  ) {}

  @Public()
  @Post('/signup')
  @ApiOperation({ summary: 'User Sign Up', description: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered', type: AuthResponse })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async signUp(@Body() createUserRequest: CreateUserRequest): Promise<AuthResponse> {
    const user = await this.createUserUseCase.execute(createUserRequest)
    const accessToken = await this.securityService.generateToken(user)
    return new AuthResponse(accessToken)
  }

  @Public()
  @Post('/login')
  @ApiOperation({ summary: 'User Login', description: 'Authenticate user and return access token' })
  @ApiResponse({ status: 200, description: 'User successfully authenticated', type: AuthResponse })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginRequest: LoginRequest): Promise<AuthResponse> {
    const user = await this.loginUserUseCase.execute(loginRequest)
    const accessToken = await this.securityService.generateToken(user)
    return new AuthResponse(accessToken)
  }
}
