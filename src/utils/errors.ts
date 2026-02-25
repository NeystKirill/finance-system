import { Request, Response, NextFunction } from 'express'
import { logger } from '../config/logger'

export class AppError extends Error {
  public statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message })
  }

  
  if ((err as any).code === 'P2002') {
    return res.status(409).json({ error: 'Запись с такими данными уже существует' })
  }

  
  if ((err as any).code === 'P2025') {
    return res.status(404).json({ error: 'Запись не найдена' })
  }

  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  })

  return res.status(500).json({ error: 'Внутренняя ошибка сервера' })
}
