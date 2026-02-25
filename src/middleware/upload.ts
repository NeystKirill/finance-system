import multer from 'multer'
import path from 'path'
import { Request } from 'express'
import { AppError } from '../utils/errors'

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `import-${unique}${path.extname(file.originalname)}`)
  },
})

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const isCsv =
    file.mimetype === 'text/csv' ||
    file.mimetype === 'application/vnd.ms-excel' ||
    path.extname(file.originalname).toLowerCase() === '.csv'

  isCsv ? cb(null, true) : cb(new AppError('Разрешены только CSV файлы', 400))
}

export const uploadCsv = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
})
