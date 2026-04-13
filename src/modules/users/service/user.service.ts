import { userRepository } from "../repository/user.repository";
import { uploadImage, deleteImage } from "@/config/cloudinary";
import {
  createValidationError,
  createNotFoundError,
  createForbiddenError,
} from "@/utils/AppError";
import {
  UpdateProfileParams,
  AddressParams,
  UpdateAddressParams,
} from "../types/user.types";

export const getProfile = async (userId: string) => {
  const profile = await userRepository.findProfileByUserId(userId);

  if (!profile) {
    throw createNotFoundError("Profile not found");
  }

  return profile;
};

export const updateProfile = async (
  userId: string,
  params: UpdateProfileParams,
) => {
  let profileData = await userRepository.findProfileByUserId(userId);
  let profile = {};

  if (!profileData) {
    profile = await userRepository.createProfile(userId, {
      firstName: params.firstName,
      lastName: params.lastName,
      phone: params.phone,
    });
  } else {
    profile = await userRepository.updateProfile(userId, params);
  }

  return profile;
};

export const uploadAvatar = async (userId: string, imageBase64: string) => {
  const existingProfile = await userRepository.findProfileByUserId(userId);

  if (existingProfile?.avatarPublicId) {
    try {
      await deleteImage(existingProfile.avatarPublicId);
    } catch (error) {
      console.error("Failed to delete old avatar:", error);
    }
  }

  const result = await uploadImage(
    imageBase64,
    `marketplace/avatars/${userId}`,
  );

  const profile = await userRepository.updateProfile(userId, {
    avatarUrl: result.url,
    avatarPublicId: result.publicId,
  });

  return profile;
};

export const deleteAvatar = async (userId: string) => {
  const profile = await userRepository.findProfileByUserId(userId);

  if (!profile) {
    throw createNotFoundError("Profile not found");
  }

  if (profile.avatarPublicId) {
    try {
      await deleteImage(profile.avatarPublicId);
    } catch (error) {
      console.error("Failed to delete avatar:", error);
    }
  }

  const updatedProfile = await userRepository.updateProfile(userId, {
    avatarUrl: undefined,
    avatarPublicId: undefined,
  });

  return updatedProfile;
};

export const getAddresses = async (userId: string) => {
  return userRepository.findAddressesByUserId(userId);
};

export const getAddress = async (userId: string, addressId: string) => {
  const address = await userRepository.findAddressById(addressId);

  if (!address) {
    throw createNotFoundError("Address not found");
  }

  if (address.userId !== userId) {
    throw createForbiddenError("Not authorized to access this address");
  }

  return address;
};

export const createAddress = async (userId: string, params: AddressParams) => {
  return userRepository.createAddress({
    userId,
    street: params.street,
    city: params.city,
    state: params.state,
    country: params.country,
    postalCode: params.postalCode,
    isDefault: params.isDefault,
  });
};

export const updateAddress = async (
  userId: string,
  addressId: string,
  params: UpdateAddressParams,
) => {
  const address = await userRepository.findAddressById(addressId);

  if (!address) {
    throw createNotFoundError("Address not found");
  }

  if (address.userId !== userId) {
    throw createForbiddenError("Not authorized to update this address");
  }

  return userRepository.updateAddress(addressId, userId, params);
};

export const deleteAddress = async (userId: string, addressId: string) => {
  const address = await userRepository.findAddressById(addressId);

  if (!address) {
    throw createNotFoundError("Address not found");
  }

  if (address.userId !== userId) {
    throw createForbiddenError("Not authorized to delete this address");
  }

  return userRepository.deleteAddress(addressId);
};

export const setDefaultAddress = async (userId: string, addressId: string) => {
  const address = await userRepository.findAddressById(addressId);

  if (!address) {
    throw createNotFoundError("Address not found");
  }

  if (address.userId !== userId) {
    throw createForbiddenError("Not authorized to update this address");
  }

  return userRepository.setDefaultAddress(addressId, userId);
};

export const userService = {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  getAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
