import { Response, NextFunction } from 'express'
import { TransactionType } from '@prisma/client'
import * as svc from '../services/categories.service'
import { categorySchema } from '../utils/validators'
import { AppError } from '../utils/errors'
import { AuthRequest } from '../types'

export const getCategories = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await svc.listCategories(parseInt(req.params.companyId), req.query.type as string)
    return res.json(data)
  } catch (err) { return next(err) }
}

export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = categorySchema.safeParse(req.body)
    if (!body.success) return next(new AppError(body.error.errors[0].message, 400))

    const data = await svc.createCategory(
      parseInt(req.params.companyId),
      body.data.name,
      body.data.type as TransactionType
    )
    return res.status(201).json(data)
  } catch (err) { return next(err) }
}

export const updateCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = categorySchema.partial().safeParse(req.body)
    if (!body.success) return next(new AppError(body.error.errors[0].message, 400))

    const data = await svc.updateCategory(parseInt(req.params.id), body.data as any)
    return res.json(data)
  } catch (err) { return next(err) }
}

export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await svc.deleteCategory(parseInt(req.params.id))
    return res.json({ message: 'Категория удалена' })
  } catch (err) { return next(err) }
}
