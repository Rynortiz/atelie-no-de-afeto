import multer, { FileFilterCallback, MulterError } from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

const UPLOAD_DIR = path.resolve("uploads");

// Garante a existência da pasta antes de qualquer gravação.
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ─── Regras de validação ─────────────────────────────────────
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const MAX_SIZE_MB = 5;

/**
 * Gera um nome único para o arquivo.
 * Combina timestamp + hash aleatório e ainda confere no disco,
 * eliminando qualquer chance de colisão de nomes.
 */
const generateUniqueFilename = (originalName: string): string => {
  const ext = path.extname(originalName).toLowerCase();
  let filename: string;
  let attempts = 0;

  do {
    const hash = crypto.randomBytes(16).toString("hex");
    filename = `${Date.now()}-${hash}${ext}`;
    attempts++;
    // Salvaguarda: em caso absurdamente improvável de repetição, tenta de novo.
  } while (fs.existsSync(path.join(UPLOAD_DIR, filename)) && attempts < 5);

  return filename;
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, generateUniqueFilename(file.originalname)),
});

/**
 * Filtro de arquivos: valida MIME type E extensão.
 * Checar os dois evita que um arquivo malicioso passe apenas
 * forjando o MIME type declarado pelo cliente.
 */
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    return cb(
      new AppError(
        "Formato inválido. Envie uma imagem JPG, PNG, WEBP ou GIF.",
        400,
      ) as unknown as null,
      false,
    );
  }

  if (!ALLOWED_EXTS.includes(ext)) {
    return cb(
      new AppError(
        `Extensão "${ext}" não permitida. Use: ${ALLOWED_EXTS.join(", ")}.`,
        400,
      ) as unknown as null,
      false,
    );
  }

  cb(null, true);
};

const multerUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE_MB * 1024 * 1024, // tamanho máximo por arquivo
    files: 1, // apenas um arquivo por requisição
  },
}).single("image");

/**
 * Wrapper que traduz os erros técnicos do Multer em mensagens
 * claras para o cliente (app mobile e front web).
 */
export const uploadImage = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  multerUpload(req, res, (err: unknown) => {
    if (err instanceof MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(
          new AppError(`A imagem excede o limite de ${MAX_SIZE_MB}MB.`, 400),
        );
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return next(new AppError("Envie apenas uma imagem por vez.", 400));
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return next(new AppError('O campo do arquivo deve se chamar "image".', 400));
      }
      return next(new AppError(err.message, 400));
    }

    if (err) return next(err);

    next();
  });
};

export const UPLOAD_RULES = { ALLOWED_MIMES, ALLOWED_EXTS, MAX_SIZE_MB };
