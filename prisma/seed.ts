import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import { Pool } from 'pg'
import {
  PrismaClient,
  Role,
} from '../src/infrastructure/adapters/out/database/generated/client'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const SALT_ROUNDS = 10

  console.log('🧹 Limpando dados existentes...')
  await prisma.invite.deleteMany()
  await prisma.membership.deleteMany()
  await prisma.company.deleteMany()
  await prisma.user.deleteMany()

  console.log('👤 Criando usuários...')
  const hashedPassword = await bcrypt.hash('senha123', SALT_ROUNDS)

  const [user1, user2, user3, user4] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'joao.silva@email.com',
        password: hashedPassword,
        name: 'João Silva',
      },
    }),
    prisma.user.create({
      data: {
        email: 'maria.santos@email.com',
        password: hashedPassword,
        name: 'Maria Santos',
      },
    }),
    prisma.user.create({
      data: {
        email: 'pedro.oliveira@email.com',
        password: hashedPassword,
        name: 'Pedro Oliveira',
      },
    }),
    prisma.user.create({
      data: {
        email: 'ana.costa@email.com',
        password: hashedPassword,
        name: 'Ana Costa',
      },
    }),
  ])

  console.log('🏢 Criando empresas...')
  const [company1, company2, company3] = await Promise.all([
    prisma.company.create({
      data: {
        name: 'Tech Solutions',
        logoUrl: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Tech',
      },
    }),
    prisma.company.create({
      data: {
        name: 'Marketing Digital Pro',
        logoUrl: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=MDP',
      },
    }),
    prisma.company.create({
      data: {
        name: 'Consultoria Empresarial',
        logoUrl: 'https://via.placeholder.com/150/00FF00/FFFFFF?text=CE',
      },
    }),
  ])

  console.log('🔗 Criando memberships...')
  await Promise.all([
    prisma.membership.create({
      data: {
        userId: user1.id,
        companyId: company1.id,
        role: Role.OWNER,
        isActive: true,
      },
    }),
    prisma.membership.create({
      data: {
        userId: user2.id,
        companyId: company1.id,
        role: Role.ADMIN,
        isActive: true,
      },
    }),
    prisma.membership.create({
      data: {
        userId: user3.id,
        companyId: company1.id,
        role: Role.MEMBER,
        isActive: true,
      },
    }),
    prisma.membership.create({
      data: {
        userId: user2.id,
        companyId: company2.id,
        role: Role.OWNER,
        isActive: false,
      },
    }),
    prisma.membership.create({
      data: {
        userId: user4.id,
        companyId: company2.id,
        role: Role.ADMIN,
        isActive: true,
      },
    }),
    prisma.membership.create({
      data: {
        userId: user1.id,
        companyId: company2.id,
        role: Role.MEMBER,
        isActive: false,
      },
    }),
    prisma.membership.create({
      data: {
        userId: user3.id,
        companyId: company3.id,
        role: Role.OWNER,
        isActive: false,
      },
    }),
  ])

  console.log('📧 Criando convites...')
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await Promise.all([
    prisma.invite.create({
      data: {
        email: 'carlos.ferreira@email.com',
        userId: user1.id,
        companyId: company1.id,
        role: Role.MEMBER,
        token: randomUUID(),
        expiresAt: futureDate,
      },
    }),
    prisma.invite.create({
      data: {
        email: user3.email,
        userId: user1.id,
        companyId: company1.id,
        role: Role.MEMBER,
        token: randomUUID(),
        expiresAt: futureDate,
        acceptedAt: new Date(),
      },
    }),
    prisma.invite.create({
      data: {
        email: 'teste@email.com',
        userId: user2.id,
        companyId: company2.id,
        role: Role.MEMBER,
        token: randomUUID(),
        expiresAt: futureDate,
        revokedAt: new Date(),
      },
    }),
  ])

  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
