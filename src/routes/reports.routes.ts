import { Router } from 'express'
import { getSummary, getByCategory, getTimeline } from '../controllers/reports.controller'
import { authenticate, requireCompanyAccess } from '../middleware/auth'

const router = Router({ mergeParams: true })

/**
 * @swagger
 * /companies/{companyId}/reports/summary:
 *   get:
 *     tags: [Reports]
 *     summary: Итого за период (доходы, расходы, прибыль)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: date_from
 *         required: true
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: date_to
 *         required: true
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: total_income, total_expense, profit }
 */
router.get('/summary', authenticate, requireCompanyAccess, getSummary)

/**
 * @swagger
 * /companies/{companyId}/reports/by-category:
 *   get:
 *     tags: [Reports]
 *     summary: Отчёт по категориям за период
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: date_from
 *         required: true
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: date_to
 *         required: true
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Суммы по категориям }
 */
router.get('/by-category', authenticate, requireCompanyAccess, getByCategory)

/**
 * @swagger
 * /companies/{companyId}/reports/timeline:
 *   get:
 *     tags: [Reports]
 *     summary: Данные для графика по дням или неделям
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: date_from
 *         required: true
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: date_to
 *         required: true
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: group
 *         schema: { type: string, enum: [day, week], default: day }
 *     responses:
 *       200: { description: "[{ period, income, expense }]" }
 */
router.get('/timeline', authenticate, requireCompanyAccess, getTimeline)

export default router
