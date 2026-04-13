export interface TokenPayload {
  sub: string;
  email: string;
  role: "ADMIN" | "SELLER" | "BUYER";
  iat: number;
}
