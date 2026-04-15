import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from "cloudinary";
import { config } from "./index";
import { File } from "formidable";

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadImage = async (
  file: File,
  folder: string = "marketplace",
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const filePath = (file as any).path as string;

    if (!filePath) {
      return reject(new Error("File path not found"));
    }

    cloudinary.uploader.upload(
      filePath,
      {
        folder,
        resource_type: "image",
        secure: true,
        type: "private",
      },
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined,
      ) => {
        if (error) {
          reject(new Error(error.message));
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        } else {
          reject(new Error("Upload failed"));
        }
      },
    );
  });
};

export const deleteImage = async (publicId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      (error: UploadApiErrorResponse | undefined) => {
        if (error) {
          reject(new Error(error.message));
        } else {
          resolve();
        }
      },
    );
  });
};

export const getSignedUrl = (
  publicId: string,
  expiresIn: number = 30,
  format = "png",
): string => {
  const timestamp = Math.floor(Date.now() / 1000) + expiresIn;
  return cloudinary.utils.private_download_url(publicId, format, {
    expires_at: timestamp,
  });
};

export { cloudinary };
