export interface IServiceResponse {
  success: boolean;
  code: number;
  message: string;
  status?: string;
  moreInformation?: string;
  userFriendlyError?: string;
  data?: any;
  error?: Error;
}
