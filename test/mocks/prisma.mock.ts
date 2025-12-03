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
        },
      }
    }),
  }
}
