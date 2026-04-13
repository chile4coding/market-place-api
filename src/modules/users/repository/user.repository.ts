import { prisma } from "@/config/database";
import { Role } from "@/types";

const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

const findProfileByUserId = async (userId: string) => {
  return prisma.profile.findUnique({
    where: { userId },
    include: {
      user: true,
    },
  });
};

const createProfile = async (
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  },
) => {
  return prisma.profile.create({
    data: {
      userId,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    },
  });
};

const updateProfile = async (
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
    avatarPublicId?: string;
  },
) => {
  return prisma.profile.update({
    where: { userId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      avatarUrl: data.avatarUrl,
      avatarPublicId: data.avatarPublicId,
    },
  });
};

const deleteProfile = async (userId: string) => {
  return prisma.profile.delete({
    where: { userId },
  });
};

const findAddressesByUserId = async (userId: string) => {
  return prisma.address.findMany({
    where: { userId },
    orderBy: { isDefault: "desc" },
  });
};

const findAddressById = async (id: string) => {
  return prisma.address.findUnique({
    where: { id },
  });
};

const createAddress = async (data: {
  userId: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault?: boolean;
}) => {
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: data.userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  return prisma.address.create({
    data: {
      userId: data.userId,
      street: data.street,
      city: data.city,
      state: data.state,
      country: data.country,
      postalCode: data.postalCode,
      isDefault: data.isDefault || false,
    },
  });
};

const updateAddress = async (
  id: string,
  userId: string,
  data: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    isDefault?: boolean;
  },
) => {
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  return prisma.address.update({
    where: { id },
    data: {
      street: data.street,
      city: data.city,
      state: data.state,
      country: data.country,
      postalCode: data.postalCode,
      isDefault: data.isDefault,
    },
  });
};

const deleteAddress = async (id: string) => {
  return prisma.address.delete({
    where: { id },
  });
};

const setDefaultAddress = async (id: string, userId: string) => {
  await prisma.address.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  });

  return prisma.address.update({
    where: { id },
    data: { isDefault: true },
  });
};

export const userRepository = {
  findUserById,
  findProfileByUserId,
  createProfile,
  updateProfile,
  deleteProfile,
  findAddressesByUserId,
  findAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
