import { Router } from 'express'
import { register, login, refresh, logout } from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth'

const router = Router()

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Регистрация Owner + создание компании
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, companyName]
 *             properties:
 *               email:       { type: string, format: email }
 *               password:    { type: string, minLength: 6 }
 *               companyName: { type: string }
 *     responses:
 *       201: { description: Успешная регистрация }
 *       409: { description: Email уже занят }
 */
router.post('/register', register)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Вход
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Токены и данные пользователя }
 *       401: { description: Неверный email или пароль }
 */
router.post('/login', login)

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Обновление access токена
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: Новая пара токенов }
 */
router.post('/refresh', refresh)

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Выход (инвалидация refresh токена)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: Успешный выход }
 */
router.post('/logout', authenticate, logout)

export default router
