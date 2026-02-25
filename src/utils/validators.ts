import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль минимум 6 символов'),
  companyName: z.string().min(1, 'Название компании обязательно'),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
})

export const categorySchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(100),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'type должен быть income или expense' }),
  }),
})

export const transactionSchema = z.object({
  categoryId: z.number().int().positive(),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Сумма должна быть больше 0'),
  currency: z.string().length(3).default('KZT'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Формат даты: YYYY-MM-DD'),
  comment: z.string().max(500).optional(),
})

export const dateRangeSchema = z.object({
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date_from: формат YYYY-MM-DD'),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date_to: формат YYYY-MM-DD'),
})

export const timelineSchema = dateRangeSchema.extend({
  group: z.enum(['day', 'week']).default('day'),
})

export const paginationSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

export const transactionFilterSchema = paginationSchema.extend({
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  type: z.enum(['income', 'expense']).optional(),
  category_id: z.coerce.number().int().positive().optional(),
})
