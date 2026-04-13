import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { config } from './index';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadImage = async (file: string, folder: string = 'marketplace'): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file,
      {
        folder,
        resource_type: 'image',
        secure: true,
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          reject(new Error(error.message));
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        } else {
          reject(new Error('Upload failed'));
        }
      }
    );
  });
};

export const deleteImage = async (publicId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error: UploadApiErrorResponse | undefined) => {
      if (error) {
        reject(new Error(error.message));
      } else {
        resolve();
      }
    });
  });
};

export const getSignedUrl = (publicId: string, expiresIn: number = 3600): string => {
  return cloudinary.url(publicId, {
    sign_signature: true,
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
    secure: true,
  });
};

export { cloudinary };
