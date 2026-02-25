import swaggerJsdoc from 'swagger-jsdoc'
import { config } from './env'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance System API',
      version: '1.0.0',
      description: 'REST API для учёта доходов и расходов малого бизнеса',
    },
    servers: [
      { url: `http://localhost:${config.PORT}`, description: 'Local' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            companyId: { type: 'integer' },
            categoryId: { type: 'integer' },
            type: { type: 'string', enum: ['income', 'expense'] },
            amount: { type: 'string' },
            currency: { type: 'string', example: 'KZT' },
            date: { type: 'string', format: 'date' },
            comment: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            companyId: { type: 'integer' },
            type: { type: 'string', enum: ['income', 'expense'] },
            name: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)
