export function getMockedPrismaService() {
  return {
    PrismaService: jest.fn().mockImplementation(() => {
      return {
        $connect: jest.fn().mockResolvedValue(undefined),
        $disconnect: jest.fn().mockResolvedValue(undefined),
        user: {
          create: jest.fn(),
          findUnique: jest.fn(),
        },
        company: {
          create: jest.fn(),
          findUnique: jest.fn(),
          update: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
        },
        membership: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findUnique: jest.fn(),
          findMany: jest.fn(),
          update: jest.fn(),
          updateMany: jest.fn(),
        },
      }
    }),
  }
}
