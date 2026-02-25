import bcrypt from 'bcrypt'
import { Role } from '@prisma/client'
import prisma from '../utils/prisma'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'
import { AppError } from '../utils/errors'
import { JwtPayload } from '../types'

const REFRESH_TTL_DAYS = 7

const buildRefreshExpiry = () => {
  const d = new Date()
  d.setDate(d.getDate() + REFRESH_TTL_DAYS)
  return d
}

const issueTokens = async (payload: JwtPayload) => {
  const accessToken = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: payload.userId, expiresAt: buildRefreshExpiry() },
  })

  return { accessToken, refreshToken }
}

export const registerOwner = async (email: string, password: string, companyName: string) => {
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) throw new AppError('Email уже занят', 409)

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: Role.OWNER,
      companies: { create: { name: companyName } },
    },
    include: { companies: { select: { id: true, name: true } } },
  })

  const tokens = await issueTokens({ userId: user.id, email: user.email, role: user.role })

  return {
    user: { id: user.id, email: user.email, role: user.role },
    company: user.companies[0],
    ...tokens,
  }
}

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } })

  
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError('Неверный email или пароль', 401)
  }

  const tokens = await issueTokens({ userId: user.id, email: user.email, role: user.role })

  return { user: { id: user.id, email: user.email, role: user.role }, ...tokens }
}

export const refreshTokens = async (token: string) => {
  const stored = await prisma.refreshToken.findUnique({ where: { token } })

  if (!stored || stored.expiresAt < new Date()) {
    
    if (stored) await prisma.refreshToken.delete({ where: { token } })
    throw new AppError('Невалидный refresh token', 401)
  }

  let payload: JwtPayload
  try {
    payload = verifyRefreshToken(token)
  } catch {
    await prisma.refreshToken.delete({ where: { token } })
    throw new AppError('Невалидный refresh token', 401)
  }

  
  await prisma.refreshToken.delete({ where: { token } })

  return issueTokens({ userId: payload.userId, email: payload.email, role: payload.role })
}

export const logoutUser = async (refreshToken: string) => {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
}
