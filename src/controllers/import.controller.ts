import { Response, NextFunction } from 'express'
import * as svc from '../services/import.service'
import { AppError } from '../utils/errors'
import { AuthRequest } from '../types'

export const importCsv = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) return next(new AppError('Файл не загружен', 400))

    const companyId = parseInt(req.params.companyId)
    const job = await svc.createImportJob(companyId, req.user!.userId, req.file.originalname)

    
    svc.runImport(job.id, companyId, req.user!.userId, req.file.path).catch(() => {})

    return res.status(202).json({ message: 'Импорт запущен', jobId: job.id })
  } catch (err) { return next(err) }
}

export const getImportJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const job = await svc.getImportJob(
      parseInt(req.params.jobId),
      parseInt(req.params.companyId)
    )
    if (!job) return next(new AppError('Задача не найдена', 404))
    return res.json(job)
  } catch (err) { return next(err) }
}
