export interface LoginState {
  qrUrl: string;
  isLoading: boolean;
  isLoginProcessing: boolean;
  error: string | null;
}

export const initialLoginState: LoginState = {
  qrUrl: "",
  isLoading: true,
  isLoginProcessing: false,
  error: null,
};

export type LoginIntent =
  | { type: 'MOUNT' }                            // Инициализация
  | { type: 'TIMER_TICK' }                       // Тик таймера QR
  | { type: 'RETRY_CLICKED' }                    // Повтор загрузки QR
  | { type: 'LOGIN_CLICKED'; provider: 'telegram' | 'max' }; // Вход через провайдера