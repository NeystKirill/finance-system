import { PrismaClient, Role, TransactionType } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding...')

  const hash = await bcrypt.hash('password123', 10)

  const owner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: { email: 'owner@example.com', passwordHash: hash, role: Role.OWNER },
  })

  await prisma.user.upsert({
    where: { email: 'accountant@example.com' },
    update: {},
    create: { email: 'accountant@example.com', passwordHash: hash, role: Role.ACCOUNTANT },
  })

  await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: { email: 'viewer@example.com', passwordHash: hash, role: Role.VIEWER },
  })

  let company = await prisma.company.findFirst({ where: { ownerId: owner.id } })
  if (!company) {
    company = await prisma.company.create({
      data: { name: 'Test Company LLC', ownerId: owner.id },
    })
  }

  const cats = [
    { name: 'Продажи', type: TransactionType.income },
    { name: 'Услуги', type: TransactionType.income },
    { name: 'Аренда', type: TransactionType.expense },
    { name: 'Зарплата', type: TransactionType.expense },
    { name: 'Маркетинг', type: TransactionType.expense },
  ]

  for (const c of cats) {
    await prisma.category.upsert({
      where: { companyId_name_type: { companyId: company.id, name: c.name, type: c.type } },
      update: {},
      create: { companyId: company.id, ...c },
    })
  }

  console.log('✅ Done!')
  console.log(`   owner@example.com        / password123  → OWNER (companyId: ${company.id})`)
  console.log(`   accountant@example.com   / password123  → ACCOUNTANT`)
  console.log(`   viewer@example.com       / password123  → VIEWER`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
