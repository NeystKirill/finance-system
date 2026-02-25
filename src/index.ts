import 'dotenv/config'
import './config/env' 

import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import swaggerUi from 'swagger-ui-express'

import { config } from './config/env'
import { swaggerSpec } from './config/swagger'
import { logger } from './config/logger'
import { requestLogger } from './middleware/requestLogger'
import { errorHandler } from './utils/errors'

import authRoutes from './routes/auth.routes'
import { categoriesCompanyRouter, categoryRouter } from './routes/categories.routes'
import { transactionsCompanyRouter, transactionRouter } from './routes/transactions.routes'
import reportsRoutes from './routes/reports.routes'
import importRoutes from './routes/import.routes'

const app = express()

app.use(helmet())

app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }))

app.use(compression())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(requestLogger)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20,
  message: { error: 'Слишком много запросов, попробуйте позже' },
  standardHeaders: true,
  legacyHeaders: false,
})

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Слишком много запросов, попробуйте позже' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/auth', authLimiter)
app.use('/companies', apiLimiter)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/docs.json', (_req, res) => res.json(swaggerSpec))

app.use('/auth', authRoutes)

app.use('/companies/:companyId/categories', categoriesCompanyRouter)
app.use('/categories', categoryRouter)

app.use('/companies/:companyId/transactions', transactionsCompanyRouter)
app.use('/transactions', transactionRouter)

app.use('/companies/:companyId/reports', reportsRoutes)
app.use('/companies/:companyId/import', importRoutes)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() })
})

app.use((_req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' })
})

app.use(errorHandler)

app.listen(config.PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${config.PORT}`)
  logger.info(`📚 Swagger docs: http://localhost:${config.PORT}/docs`)
})

export default app
