import multer from "multer";
import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError.js";

// Utility function to create a multer instance with custom validation
export function uploadFileMiddleware(
  maxSizeKB: number,
  allowedTypes: string[]
) {
  const storage = multer.memoryStorage();

  const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new ApiError(
          400,
          `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`
        ),
        false
      );
    }
  };

  const upload = multer({
    storage,
    limits: { fileSize: maxSizeKB * 1024 }, // convert KB to bytes
    fileFilter,
  });

  // Middleware function
  return (req: Request, res: Response, next: NextFunction) => {
    upload.single("file")(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res
            .status(400)
            .json(
              new ApiError(
                400,
                `File too large. Max size allowed is ${maxSizeKB}KB.`
              )
            );
        }
        console.log("Multer error:", err);

        return res
          .status(400)
          .json(new ApiError(400, "Multer error: " + err.message));
      } else if (err) {
        // custom errors from fileFilter
        return res
          .status(400)
          .json(new ApiError(err.status || 400, err.message || "Upload error"));
      }
      next();
    });
  };
}

export const uploadMultipleFileMiddleware = (
  numberofFiles: number,
  maxSizeKB: number,
  allowedTypes: string[]
) => {
  const storage = multer.memoryStorage();

  const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new ApiError(
          400,
          `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`
        ),
        false
      );
    }
  };

  const upload = multer({
    storage,
    limits: { fileSize: maxSizeKB * 1024 }, // size per file
    fileFilter,
  });

  return (req: Request, res: Response, next: NextFunction) => {
    upload.array("files", numberofFiles)(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res
            .status(400)
            .json(
              new ApiError(
                400,
                `File too large. Max size allowed is ${maxSizeKB}KB.`
              )
            );
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res
            .status(400)
            .json(new ApiError(400, "Too many files. Max 3 allowed."));
        }
        return res
          .status(400)
          .json(new ApiError(400, "Multer error: " + err.message));
      } else if (err) {
        return res
          .status(400)
          .json(new ApiError(err.status || 400, err.message || "Upload error"));
      }
      next();
    });
  };
};

export const uploadMultipleDiffFileMiddleware = (
  fieldsConfig: {
    name: string;
    maxCount: number;
    maxSizeKB: number;
    allowedTypes: string[];
  }[]
) => {
  const storage = multer.memoryStorage();

  const upload = multer({
    storage,
    limits: {
      // this is just a global upper limit; we’ll enforce per-field inside fileFilter
      fileSize: Math.max(...fieldsConfig.map((f) => f.maxSizeKB)) * 1024,
    },
    fileFilter: (req: Request, file: Express.Multer.File, cb: any) => {
      const fieldConfig = fieldsConfig.find((f) => f.name === file.fieldname);
      if (!fieldConfig) {
        return cb(
          new ApiError(400, `Unexpected field: ${file.fieldname}`),
          false
        );
      }

      // type check
      if (!fieldConfig.allowedTypes.includes(file.mimetype)) {
        return cb(
          new ApiError(
            400,
            `Invalid file type for ${file.fieldname}. Allowed: ${fieldConfig.allowedTypes.join(
              ", "
            )}`
          ),
          false
        );
      }

      // size check
      if (file.size > fieldConfig.maxSizeKB * 1024) {
        return cb(
          new ApiError(
            400,
            `File too large for ${file.fieldname}. Max size: ${fieldConfig.maxSizeKB}KB`
          ),
          false
        );
      }

      cb(null, true);
    },
  });

  return (req: Request, res: Response, next: NextFunction) => {
    upload.fields(
      fieldsConfig.map(({ name, maxCount }) => ({ name, maxCount }))
    )(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        return res
          .status(400)
          .json(new ApiError(400, "Multer error: " + err.message));
      } else if (err) {
        return res
          .status(400)
          .json(new ApiError(err.status || 400, err.message || "Upload error"));
      }
      next();
    });
  };
};
