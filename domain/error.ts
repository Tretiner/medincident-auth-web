export type GenericError = {
  type: 'ERROR' | 'API_ERROR' | 'NETWORK_ERROR' | 'VALIDATION_ERROR';
  message: string;
  code?: string | number;
};

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: GenericError };