import { Role } from '@prisma/client'
import { Request } from 'express'

export interface JwtPayload {
  userId: number
  email: string
  role: Role
}

export interface AuthRequest extends Request {
  user?: JwtPayload
}

export interface CsvRow {
  date: string
  type: string
  category: string
  amount: string
  comment?: string
}
