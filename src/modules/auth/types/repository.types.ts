import { Role } from "@/types";

export interface CreateUserData {
  email: string;
  passwordHash: string;
  role?: Role;
}
