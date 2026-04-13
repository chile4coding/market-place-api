declare module 'speakeasy' {
  interface GenerateSecretOptions {
    name?: string;
    issuer?: string;
    length?: number;
  }

  interface GenerateSecretResult {
    otpauth_url: string;
    base32: string;
    hex: string;
    secret: string;
  }

  interface VerifyOptions {
    secret: string;
    encoding?: string;
    token: string;
    window?: number;
  }

  interface TotpOptions {
    secret: string;
    encoding?: string;
    step?: number;
  }

  export function generateSecret(options?: GenerateSecretOptions): GenerateSecretResult;
  export function totpVerify(options: VerifyOptions): boolean;
  export function totp(options: TotpOptions): string;
}
