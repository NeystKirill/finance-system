import { Response, NextFunction } from 'express'
import * as svc from '../services/reports.service'
import { dateRangeSchema, timelineSchema } from '../utils/validators'
import { AppError } from '../utils/errors'
import { AuthRequest } from '../types'

export const getSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const q = dateRangeSchema.safeParse(req.query)
    if (!q.success) return next(new AppError(q.error.errors[0].message, 400))

    const data = await svc.getSummary(parseInt(req.params.companyId), q.data.date_from, q.data.date_to)
    return res.json(data)
  } catch (err) { return next(err) }
}

export const getByCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const q = dateRangeSchema.safeParse(req.query)
    if (!q.success) return next(new AppError(q.error.errors[0].message, 400))

    const data = await svc.getByCategory(parseInt(req.params.companyId), q.data.date_from, q.data.date_to)
    return res.json(data)
  } catch (err) { return next(err) }
}

export const getTimeline = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const q = timelineSchema.safeParse(req.query)
    if (!q.success) return next(new AppError(q.error.errors[0].message, 400))

    const data = await svc.getTimeline(
      parseInt(req.params.companyId),
      q.data.date_from,
      q.data.date_to,
      q.data.group
    )
    return res.json(data)
  } catch (err) { return next(err) }
}
