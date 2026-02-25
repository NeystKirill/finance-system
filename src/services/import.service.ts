import fs from 'fs'
import { parse } from 'csv-parse'
import { TransactionType } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import prisma from '../utils/prisma'
import { logger } from '../config/logger'
import { CsvRow } from '../types'

export const createImportJob = async (companyId: number, userId: number, fileName: string) => {
  return prisma.importJob.create({
    data: { companyId, userId, status: 'pending', fileName },
  })
}

export const getImportJob = async (jobId: number, companyId: number) => {
  return prisma.importJob.findFirst({ where: { id: jobId, companyId } })
}

export const runImport = async (
  jobId: number,
  companyId: number,
  userId: number,
  filePath: string
) => {
  const errors: string[] = []
  let totalRows = 0
  let successRows = 0

  try {
    const rows = await parseCsv(filePath)
    totalRows = rows.length

    for (let i = 0; i < rows.length; i++) {
      try {
        await processRow(rows[i], companyId, userId)
        successRows++
      } catch (err: any) {
        const line = i + 2 
        errors.push(`Строка ${line}: ${err.message}`)
        logger.warn(`[import:${jobId}] line ${line} failed: ${err.message}`)
      }
    }

    const failedRows = totalRows - successRows

    await prisma.importJob.update({
      where: { id: jobId },
      data: {
        status: failedRows === totalRows && totalRows > 0 ? 'failed' : 'success',
        totalRows,
        successRows,
        failedRows,
        errors: errors.length > 0 ? errors : undefined,
      },
    })

    logger.info(`[import:${jobId}] done. success=${successRows}, failed=${failedRows}`)
  } catch (err: any) {
    logger.error(`[import:${jobId}] fatal: ${err.message}`)
    await prisma.importJob.update({
      where: { id: jobId },
      data: { status: 'failed', errors: [`Ошибка обработки файла: ${err.message}`] },
    })
  } finally {
    fs.unlink(filePath, () => {})
  }
}

async function processRow(row: CsvRow, companyId: number, userId: number) {
  if (!row.date || !/^\d{4}-\d{2}-\d{2}$/.test(row.date.trim())) {
    throw new Error(`Некорректная дата: "${row.date}"`)
  }

  const type = row.type?.trim()
  if (type !== 'income' && type !== 'expense') {
    throw new Error(`Некорректный type: "${row.type}"`)
  }

  const amount = parseFloat(row.amount)
  if (isNaN(amount) || amount <= 0) {
    throw new Error(`Некорректная сумма: "${row.amount}"`)
  }

  const categoryName = row.category?.trim()
  if (!categoryName) {
    throw new Error('Название категории не может быть пустым')
  }

  const txType = type as TransactionType

  
  const category = await prisma.category.upsert({
    where: { companyId_name_type: { companyId, name: categoryName, type: txType } },
    update: {},
    create: { companyId, name: categoryName, type: txType },
  })

  await prisma.transaction.create({
    data: {
      companyId,
      categoryId: category.id,
      type: txType,
      amount: new Decimal(amount),
      currency: 'KZT',
      date: new Date(row.date.trim()),
      comment: row.comment?.trim() || undefined,
      createdBy: userId,
    },
  })
}

function parseCsv(filePath: string): Promise<CsvRow[]> {
  return new Promise((resolve, reject) => {
    const rows: CsvRow[] = []
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, skip_empty_lines: true, trim: true }))
      .on('data', (row: CsvRow) => rows.push(row))
      .on('error', reject)
      .on('end', () => resolve(rows))
  })
}
