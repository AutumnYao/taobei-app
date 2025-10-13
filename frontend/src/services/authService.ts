// 前端认证服务
export interface SendCodeRequest {
  phoneNumber: string;
}

export interface SendCodeResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface LoginRequest {
  phoneNumber: string;
  verificationCode: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  error?: string;
  data?: {
    token: string;
    user: {
      id: number;
      phoneNumber: string;
    };
    expiresAt: string;
  };
}

class AuthService {
  private baseUrl = 'http://localhost:3001/api/auth';

  async sendVerificationCode(phoneNumber: string): Promise<SendCodeResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('发送验证码网络错误:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: '网络错误，请稍后重试'
      };
    }
  }

  async login(phoneNumber: string, verificationCode: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, verificationCode }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('登录网络错误:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: '网络错误，请稍后重试'
      };
    }
  }
}

export const authService = new AuthService();