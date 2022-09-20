import crypto from 'crypto';
import multer from 'multer';

export default {
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file: any, cb: any) => {
      crypto.randomBytes(16, (err: any, hash) => {
        if (err) cb(err);

        file.key = `${hash.toString('hex')}-${file.originalname}`;

        cb(null, file.key);
      });
    },
  }),
};
