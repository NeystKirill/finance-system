import { Response, NextFunction } from 'express'
import * as svc from '../services/transactions.service'
import { transactionSchema, transactionFilterSchema } from '../utils/validators'
import { AppError } from '../utils/errors'
import { AuthRequest } from '../types'

export const getTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query = transactionFilterSchema.safeParse(req.query)
    if (!query.success) return next(new AppError(query.error.errors[0].message, 400))

    const data = await svc.listTransactions({
      companyId: parseInt(req.params.companyId),
      ...query.data,
    })
    return res.json(data)
  } catch (err) { return next(err) }
}

export const createTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = transactionSchema.safeParse(req.body)
    if (!body.success) return next(new AppError(body.error.errors[0].message, 400))

    const data = await svc.createTransaction(
      parseInt(req.params.companyId),
      req.user!.userId,
      body.data
    )
    return res.status(201).json(data)
  } catch (err) { return next(err) }
}

export const updateTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = transactionSchema.partial().safeParse(req.body)
    if (!body.success) return next(new AppError(body.error.errors[0].message, 400))

    const data = await svc.updateTransaction(parseInt(req.params.id), body.data)
    return res.json(data)
  } catch (err) { return next(err) }
}

export const deleteTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await svc.deleteTransaction(parseInt(req.params.id))
    return res.json({ message: 'Операция удалена' })
  } catch (err) { return next(err) }
}
