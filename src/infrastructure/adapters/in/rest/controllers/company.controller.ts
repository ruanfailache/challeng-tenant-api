import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { CreateCompanyUseCase } from '@/application/usecases/company/create-company.usecase'
import { CurrentUser } from '@/infrastructure/security/decorators/current-user.decorator'
import { type LoggedUserPayload } from '@/infrastructure/security/dto/payloads/logged-user.payload'
import { CreateCompanyRequest } from '../dto/requests/company/create-company.request'

@Controller('company')
@ApiTags('Companies')
export class CompanyController {
  constructor(private readonly createCompanyUseCase: CreateCompanyUseCase) {}

  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  @ApiOperation({
    summary: 'Create Company',
    description: 'Create a new company with logo',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Company successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Body() createCompanyRequest: CreateCompanyRequest,
    @UploadedFile() logo: Express.Multer.File,
    @CurrentUser() user: LoggedUserPayload,
  ) {
    return this.createCompanyUseCase.execute(
      createCompanyRequest,
      logo,
      user.userId,
    )
  }
}
