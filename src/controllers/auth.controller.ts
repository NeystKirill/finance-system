import { Request, Response, NextFunction } from 'express'
import * as authService from '../services/auth.service'
import { registerSchema, loginSchema, refreshTokenSchema } from '../utils/validators'
import { AppError } from '../utils/errors'
import { AuthRequest } from '../types'

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = registerSchema.safeParse(req.body)
    if (!body.success) return next(new AppError(body.error.errors[0].message, 400))

    const result = await authService.registerOwner(
      body.data.email,
      body.data.password,
      body.data.companyName
    )
    return res.status(201).json(result)
  } catch (err) {
    return next(err)
  }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = loginSchema.safeParse(req.body)
    if (!body.success) return next(new AppError('Некорректные данные', 400))

    const result = await authService.loginUser(body.data.email, body.data.password)
    return res.json(result)
  } catch (err) {
    return next(err)
  }
}

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = refreshTokenSchema.safeParse(req.body)
    if (!body.success) return next(new AppError('refreshToken обязателен', 400))

    const tokens = await authService.refreshTokens(body.data.refreshToken)
    return res.json(tokens)
  } catch (err) {
    return next(err)
  }
}

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = refreshTokenSchema.safeParse(req.body)
    if (!body.success) return next(new AppError('refreshToken обязателен', 400))

    await authService.logoutUser(body.data.refreshToken)
    return res.json({ message: 'Выход выполнен' })
  } catch (err) {
    return next(err)
  }
}
