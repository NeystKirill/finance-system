import prisma from '../utils/prisma'
import { AppError } from '../utils/errors'

export const getSummary = async (companyId: number, date_from: string, date_to: string) => {
  const result = await prisma.transaction.groupBy({
    by: ['type'],
    where: {
      companyId,
      date: { gte: new Date(date_from), lte: new Date(date_to) },
    },
    _sum: { amount: true },
  })

  let totalIncome = 0
  let totalExpense = 0

  for (const row of result) {
    const amount = Number(row._sum.amount ?? 0)
    if (row.type === 'income') totalIncome = amount
    else totalExpense = amount
  }

  return {
    date_from,
    date_to,
    total_income: totalIncome,
    total_expense: totalExpense,
    profit: totalIncome - totalExpense,
  }
}

export const getByCategory = async (companyId: number, date_from: string, date_to: string) => {
  const rows = await prisma.transaction.groupBy({
    by: ['categoryId', 'type'],
    where: {
      companyId,
      date: { gte: new Date(date_from), lte: new Date(date_to) },
    },
    _sum: { amount: true },
  })

  const categoryIds = [...new Set(rows.map((r) => r.categoryId))]
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  })

  const catMap = new Map(categories.map((c) => [c.id, c.name]))

  const mapRow = (type: 'income' | 'expense') =>
    rows
      .filter((r) => r.type === type)
      .map((r) => ({
        categoryId: r.categoryId,
        categoryName: catMap.get(r.categoryId) ?? 'Неизвестно',
        amount: Number(r._sum.amount ?? 0),
      }))
      .sort((a, b) => b.amount - a.amount)

  return { date_from, date_to, income: mapRow('income'), expense: mapRow('expense') }
}

export const getTimeline = async (
  companyId: number,
  date_from: string,
  date_to: string,
  group: 'day' | 'week'
) => {
  const rows = await prisma.$queryRaw<Array<{ period: Date; type: string; total: string }>>`
    SELECT
      DATE_TRUNC(${group}, date) AS period,
      type,
      SUM(amount)::text          AS total
    FROM transactions
    WHERE
      company_id = ${companyId}
      AND date >= ${new Date(date_from)}
      AND date <= ${new Date(date_to)}
    GROUP BY DATE_TRUNC(${group}, date), type
    ORDER BY period ASC
  `

  const map = new Map<string, { period: string; income: number; expense: number }>()

  for (const row of rows) {
    const key = row.period.toISOString().split('T')[0]
    if (!map.has(key)) map.set(key, { period: key, income: 0, expense: 0 })
    const entry = map.get(key)!
    if (row.type === 'income') entry.income = Number(row.total)
    else entry.expense = Number(row.total)
  }

  return { date_from, date_to, group, timeline: Array.from(map.values()) }
}
