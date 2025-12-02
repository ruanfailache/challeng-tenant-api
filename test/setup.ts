import { getMockedPrismaService } from '@mocks/lib/prisma.mock'

jest.mock(
  '@/infrastructure/adapters/out/database/services/prisma.service',
  () => getMockedPrismaService(),
)
