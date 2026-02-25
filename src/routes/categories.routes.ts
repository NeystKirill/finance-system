import { Router } from 'express'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categories.controller'
import { authenticate, requireRole, requireCompanyAccess } from '../middleware/auth'
import { Role } from '@prisma/client'

const companyRouter = Router({ mergeParams: true })
const categoryRouter = Router()

/**
 * @swagger
 * /companies/{companyId}/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Список категорий компании
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [income, expense] }
 *     responses:
 *       200: { description: Массив категорий }
 *   post:
 *     tags: [Categories]
 *     summary: Создать категорию
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
 *             required: [name, type]
 *             properties:
 *               name: { type: string }
 *               type: { type: string, enum: [income, expense] }
 *     responses:
 *       201: { description: Созданная категория }
 */
companyRouter.get('/', authenticate, requireCompanyAccess, getCategories)
companyRouter.post('/', authenticate, requireRole(Role.OWNER, Role.ACCOUNTANT), requireCompanyAccess, createCategory)

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Обновить категорию
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               type: { type: string, enum: [income, expense] }
 *     responses:
 *       200: { description: Обновлённая категория }
 *   delete:
 *     tags: [Categories]
 *     summary: Удалить категорию
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Категория удалена }
 */
categoryRouter.put('/:id', authenticate, requireRole(Role.OWNER, Role.ACCOUNTANT), updateCategory)
categoryRouter.delete('/:id', authenticate, requireRole(Role.OWNER, Role.ACCOUNTANT), deleteCategory)

export { companyRouter as categoriesCompanyRouter, categoryRouter }
