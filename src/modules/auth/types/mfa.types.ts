export interface MfaSetupResult {
  secret: string;
  otpauthUrl: string;
  qrCode: string;
}
