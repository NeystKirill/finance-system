import { Response, NextFunction } from 'express'
import { Role } from '@prisma/client'
import { AuthRequest } from '../types'
import { verifyAccessToken } from '../utils/jwt'
import { AppError } from '../utils/errors'
import prisma from '../utils/prisma'

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization

  if (!auth?.startsWith('Bearer ')) {
    return next(new AppError('Требуется авторизация', 401))
  }

  try {
    req.user = verifyAccessToken(auth.split(' ')[1])
    return next()
  } catch {
    return next(new AppError('Токен недействителен или истёк', 401))
  }
}

export const requireRole = (...roles: Role[]) => (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError('Недостаточно прав', 403))
  }
  return next()
}

export const requireCompanyAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const companyId = parseInt(req.params.companyId)
  if (isNaN(companyId)) return next(new AppError('Некорректный companyId', 400))

  const company = await prisma.company.findUnique({ where: { id: companyId } })
  if (!company) return next(new AppError('Компания не найдена', 404))

  
  if (req.user?.role === Role.OWNER && company.ownerId !== req.user.userId) {
    return next(new AppError('Нет доступа к этой компании', 403))
  }

  return next()
}
