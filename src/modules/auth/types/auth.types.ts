import { Role } from "@/types";

export interface RegisterParams {
  email: string;
  password: string;
  role?: Role;
}

export interface LoginParams {
  email: string;
  password: string;
  mfaToken?: string;
}
