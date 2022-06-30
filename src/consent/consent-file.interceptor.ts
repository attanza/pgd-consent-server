import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const consentFileInterceptor: MulterOptions = {
  storage: diskStorage({
    // destination: './public/uploads',
    filename: (req, file, cb) => {
      const randomName = Math.floor(Date.now() / 1000).toString();
      return cb(null, `${randomName}${extname(file.originalname)}`);
    },
  }),
  limits: {
    fileSize: 5000000,
  },
  fileFilter: (req, file, cb): void => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
};
