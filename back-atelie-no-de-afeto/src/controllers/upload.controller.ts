import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { AppError } from "../utils/AppError";

const UPLOAD_DIR = path.resolve("uploads");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export class UploadController {
  /**
   * POST /api/upload/imagem
   * O middleware `uploadImage` já validou extensão, MIME, tamanho
   * e gerou um nome único antes de chegar aqui.
   */
  upload(req: Request, res: Response, next: NextFunction): void {
    if (!req.file) {
      next(new AppError("Nenhuma imagem enviada.", 400));
      return;
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(201).json({
      imageUrl,
      filename: req.file.filename,
      size: req.file.size,
    });
  }

  /**
   * DELETE /api/upload/imagem/:filename
   * `path.basename` neutraliza tentativas de path traversal
   * (ex.: ../../.env), restringindo a remoção à pasta de uploads.
   */
  delete(req: Request, res: Response, next: NextFunction): void {
    try {
      const { filename } = req.params;
      const safe = path.basename(filename);
      const filePath = path.join(UPLOAD_DIR, safe);

      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
}
