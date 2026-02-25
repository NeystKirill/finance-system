import { Router } from 'express'
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../controllers/transactions.controller'
import { authenticate, requireRole, requireCompanyAccess } from '../middleware/auth'
import { Role } from '@prisma/client'

const companyRouter = Router({ mergeParams: true })
const txRouter = Router()

/**
 * @swagger
 * /companies/{companyId}/transactions:
 *   get:
 *     tags: [Transactions]
 *     summary: Список операций с фильтрами и пагинацией
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: date_from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: date_to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [income, expense] }
 *       - in: query
 *         name: category_id
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200: { description: Список операций + total }
 *   post:
 *     tags: [Transactions]
 *     summary: Создать операцию
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryId, type, amount, date]
 *             properties:
 *               categoryId: { type: integer }
 *               type:       { type: string, enum: [income, expense] }
 *               amount:     { type: number }
 *               currency:   { type: string, default: KZT }
 *               date:       { type: string, format: date }
 *               comment:    { type: string }
 *     responses:
 *       201: { description: Созданная операция }
 */
companyRouter.get('/', authenticate, requireCompanyAccess, getTransactions)
companyRouter.post('/', authenticate, requireRole(Role.OWNER, Role.ACCOUNTANT), requireCompanyAccess, createTransaction)

/**
 * @swagger
 * /transactions/{id}:
 *   put:
 *     tags: [Transactions]
 *     summary: Обновить операцию
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Обновлённая операция }
 *   delete:
 *     tags: [Transactions]
 *     summary: Удалить операцию
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Операция удалена }
 */
txRouter.put('/:id', authenticate, requireRole(Role.OWNER, Role.ACCOUNTANT), updateTransaction)
txRouter.delete('/:id', authenticate, requireRole(Role.OWNER, Role.ACCOUNTANT), deleteTransaction)

export { companyRouter as transactionsCompanyRouter, txRouter as transactionRouter }
