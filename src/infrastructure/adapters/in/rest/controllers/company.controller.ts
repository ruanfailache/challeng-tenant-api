import { Body, Controller, Get, Param, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CreateCompanyUseCase } from '@/application/usecases/company/create-company.usecase'
import { ListUserCompaniesUseCase } from '@/application/usecases/company/list-user-companies.usecase'
import { SelectCompanyUseCase } from '@/application/usecases/company/select-company.usecase'
import { SendInviteUseCase } from '@/application/usecases/invite/send-invite.usecase'
import { CurrentUser } from '@/infrastructure/security/decorators/current-user.decorator'
import { type LoggedUserPayload } from '@/infrastructure/security/dto/payloads/logged-user.payload'
import { PageRequest } from '../dto/requests/common/pagination.request'
import { CreateCompanyRequest } from '../dto/requests/company/create-company.request'
import { SendInviteRequest } from '../dto/requests/invite/send-invite.request'

@Controller('company')
@ApiTags('Companies')
@ApiBearerAuth('JWT-auth')
export class CompanyController {
  constructor(
    private readonly createCompanyUseCase: CreateCompanyUseCase,
    private readonly listUserCompaniesUseCase: ListUserCompaniesUseCase,
    private readonly selectCompanyUseCase: SelectCompanyUseCase,
    private readonly sendInviteUseCase: SendInviteUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List User Companies',
    description: 'List all companies the logged user has membership',
  })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  list(@Query() pageRequest: PageRequest, @CurrentUser() user: LoggedUserPayload) {
    return this.listUserCompaniesUseCase.execute(user.userId, pageRequest.page, pageRequest.size)
  }

  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  @ApiOperation({
    summary: 'Create Company',
    description: 'Create a new company with logo',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: 'multipart/form-data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          required: ['true'],
          example: 'My Company',
        },
        logo: {
          type: 'string',
          format: 'binary',
          required: ['true'],
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Company successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Body() createCompanyRequest: CreateCompanyRequest,
    @UploadedFile() logo: Express.Multer.File,
    @CurrentUser() user: LoggedUserPayload,
  ) {
    return this.createCompanyUseCase.execute(createCompanyRequest, logo, user.userId)
  }

  @Patch(':id/select')
  @ApiOperation({
    summary: 'Select Company',
    description: 'Activate a company as the current active company for the user',
  })
  @ApiResponse({ status: 200, description: 'Company selected successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'User has no membership with this company',
  })
  select(@Param('id') companyId: string, @CurrentUser() user: LoggedUserPayload) {
    return this.selectCompanyUseCase.execute(user.userId, companyId)
  }

  @Post(':id/invite')
  @ApiOperation({
    summary: 'Send Invite',
    description: 'Send an invitation email to a user to join the company',
  })
  @ApiResponse({ status: 201, description: 'Invite sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Only owners and admins can send invites' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  sendInvite(
    @Param('id') companyId: string,
    @Body() sendInviteRequest: SendInviteRequest,
    @CurrentUser() user: LoggedUserPayload,
  ) {
    return this.sendInviteUseCase.execute(sendInviteRequest, companyId, user.userId)
  }
}
