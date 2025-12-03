import { getMockedPrismaService } from '@mocks/prisma.mock'

jest.mock('@/infrastructure/adapters/out/database/services/prisma.service', () => getMockedPrismaService())
