import {
  Body,
  Controller,
  Get,
  Post,
  Query,
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
import { ListUserCompaniesUseCase } from '@/application/usecases/company/list-user-companies.usecase'
import { CurrentUser } from '@/infrastructure/security/decorators/current-user.decorator'
import { type LoggedUserPayload } from '@/infrastructure/security/dto/payloads/logged-user.payload'
import { PageRequest } from '../dto/requests/common/pagination.request'
import { CreateCompanyRequest } from '../dto/requests/company/create-company.request'

@Controller('company')
@ApiTags('Companies')
export class CompanyController {
  constructor(
    private readonly createCompanyUseCase: CreateCompanyUseCase,
    private readonly listUserCompaniesUseCase: ListUserCompaniesUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List User Companies',
    description: 'List all companies the logged user has membership',
  })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  list(
    @Query() pageRequest: PageRequest,
    @CurrentUser() user: LoggedUserPayload,
  ) {
    return this.listUserCompaniesUseCase.execute(
      user.userId,
      pageRequest.page,
      pageRequest.size,
    )
  }

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
