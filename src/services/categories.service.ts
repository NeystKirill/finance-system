import { TransactionType } from '@prisma/client'
import prisma from '../utils/prisma'
import { AppError } from '../utils/errors'

export const listCategories = (companyId: number, type?: string) => {
  return prisma.category.findMany({
    where: {
      companyId,
      ...(type === 'income' || type === 'expense' ? { type: type as TransactionType } : {}),
    },
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
  })
}

export const createCategory = async (companyId: number, name: string, type: TransactionType) => {
  const exists = await prisma.category.findUnique({
    where: { companyId_name_type: { companyId, name, type } },
  })
  if (exists) throw new AppError('Категория с таким именем и типом уже существует', 409)

  return prisma.category.create({ data: { companyId, name, type } })
}

export const updateCategory = async (id: number, data: Partial<{ name: string; type: TransactionType }>) => {
  const cat = await prisma.category.findUnique({ where: { id } })
  if (!cat) throw new AppError('Категория не найдена', 404)

  return prisma.category.update({ where: { id }, data })
}

export const deleteCategory = async (id: number) => {
  const cat = await prisma.category.findUnique({ where: { id } })
  if (!cat) throw new AppError('Категория не найдена', 404)

  const usedCount = await prisma.transaction.count({ where: { categoryId: id } })
  if (usedCount > 0) {
    throw new AppError(`Нельзя удалить: категория используется в ${usedCount} операциях`, 409)
  }

  await prisma.category.delete({ where: { id } })
}
