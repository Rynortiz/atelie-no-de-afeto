import { Router } from "express";
import { UploadController } from "../controllers/upload.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeAdmin } from "../middlewares/role.middleware";
import { uploadImage } from "../middlewares/upload.middleware";

const router = Router();
const uploadController = new UploadController();

// Upload de imagem é operação administrativa: exige login + papel ADMIN.
router.post(
  "/imagem",
  authenticate,
  authorizeAdmin,
  uploadImage,
  uploadController.upload,
);

router.delete(
  "/imagem/:filename",
  authenticate,
  authorizeAdmin,
  uploadController.delete,
);

export default router;
