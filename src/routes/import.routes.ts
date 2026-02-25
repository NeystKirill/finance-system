import { Router } from 'express'
import { importCsv, getImportJob } from '../controllers/import.controller'
import { authenticate, requireRole, requireCompanyAccess } from '../middleware/auth'
import { uploadCsv } from '../middleware/upload'
import { Role } from '@prisma/client'

const router = Router({ mergeParams: true })

/**
 * @swagger
 * /companies/{companyId}/import/csv:
 *   post:
 *     tags: [Import]
 *     summary: Загрузить CSV файл с транзакциями
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       202: { description: Импорт запущен, возвращает jobId }
 */
router.post('/csv', authenticate, requireRole(Role.OWNER, Role.ACCOUNTANT), requireCompanyAccess, uploadCsv.single('file'), importCsv)

/**
 * @swagger
 * /companies/{companyId}/import/{jobId}:
 *   get:
 *     tags: [Import]
 *     summary: Статус задачи импорта
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Статус, кол-во строк, ошибки }
 */
router.get('/:jobId', authenticate, requireCompanyAccess, getImportJob)

export default router
