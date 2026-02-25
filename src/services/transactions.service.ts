import { TransactionType } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import prisma from '../utils/prisma'
import { AppError } from '../utils/errors'

interface ListParams {
  companyId: number
  date_from?: string
  date_to?: string
  type?: string
  category_id?: number
  limit: number
  offset: number
}

export const listTransactions = async (params: ListParams) => {
  const { companyId, date_from, date_to, type, category_id, limit, offset } = params

  const where: any = { companyId }

  if (date_from || date_to) {
    where.date = {
      ...(date_from ? { gte: new Date(date_from) } : {}),
      ...(date_to ? { lte: new Date(date_to) } : {}),
    }
  }

  if (type === 'income' || type === 'expense') where.type = type as TransactionType
  if (category_id) where.categoryId = category_id

  const [data, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: { select: { id: true, name: true, type: true } } },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.transaction.count({ where }),
  ])

  return { data, total, limit, offset }
}

export const createTransaction = async (
  companyId: number,
  userId: number,
  body: {
    categoryId: number
    type: string
    amount: number
    currency: string
    date: string
    comment?: string
  }
) => {
  const category = await prisma.category.findFirst({
    where: { id: body.categoryId, companyId },
  })
  if (!category) throw new AppError('Категория не найдена в этой компании', 404)

  return prisma.transaction.create({
    data: {
      companyId,
      categoryId: body.categoryId,
      type: body.type as TransactionType,
      amount: new Decimal(body.amount),
      currency: body.currency,
      date: new Date(body.date),
      comment: body.comment,
      createdBy: userId,
    },
    include: { category: { select: { id: true, name: true, type: true } } },
  })
}

export const updateTransaction = async (
  id: number,
  data: Partial<{ type: string; amount: number; currency: string; date: string; comment: string; categoryId: number }>
) => {
  const tx = await prisma.transaction.findUnique({ where: { id } })
  if (!tx) throw new AppError('Операция не найдена', 404)

  const update: any = { ...data }
  if (data.amount !== undefined) update.amount = new Decimal(data.amount)
  if (data.date) update.date = new Date(data.date)
  if (data.type) update.type = data.type as TransactionType

  return prisma.transaction.update({
    where: { id },
    data: update,
    include: { category: { select: { id: true, name: true, type: true } } },
  })
}

export const deleteTransaction = async (id: number) => {
  const tx = await prisma.transaction.findUnique({ where: { id } })
  if (!tx) throw new AppError('Операция не найдена', 404)
  await prisma.transaction.delete({ where: { id } })
}
