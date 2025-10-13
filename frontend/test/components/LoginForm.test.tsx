import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginForm from '../../src/components/LoginForm';

// Mock authService
vi.mock('../../src/services/authService', () => ({
  authService: {
    sendVerificationCode: vi.fn(),
    login: vi.fn()
  }
}));

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 基于UI-LoginForm的acceptanceCriteria
  it('应该显示完整的登录表单', () => {
    render(<LoginForm />);
    
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.getByText('用户登录')).toBeInTheDocument();
    expect(screen.getByTestId('phone-input')).toBeInTheDocument();
    expect(screen.getByTestId('verification-code-input')).toBeInTheDocument();
    expect(screen.getByTestId('send-code-button')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
  });

  it('初始状态下登录按钮应该被禁用', () => {
    render(<LoginForm />);
    
    const loginButton = screen.getByTestId('login-submit-button');
    expect(loginButton).toBeDisabled();
  });

  it('初始状态下获取验证码按钮应该可用', () => {
    render(<LoginForm />);
    
    const sendCodeButton = screen.getByTestId('send-code-button');
    expect(sendCodeButton).toBeEnabled();
    expect(sendCodeButton).toHaveTextContent('获取验证码');
  });

  it('输入有效手机号和验证码后登录按钮应该可用', async () => {
    render(<LoginForm />);
    
    const phoneInput = screen.getByTestId('phone-input');
    const codeInput = screen.getByTestId('verification-code-input');
    const loginButton = screen.getByTestId('login-submit-button');
    
    fireEvent.change(phoneInput, { target: { value: '13812345678' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });
    
    await waitFor(() => {
      expect(loginButton).toBeEnabled();
    });
  });

  it('点击获取验证码应该调用发送验证码服务', async () => {
    const { authService } = await import('../../src/services/authService');
    authService.sendVerificationCode.mockResolvedValue({ success: true });
    
    render(<LoginForm />);
    
    const phoneInput = screen.getByTestId('phone-input');
    const sendCodeButton = screen.getByTestId('send-code-button');
    
    fireEvent.change(phoneInput, { target: { value: '13812345678' } });
    fireEvent.click(sendCodeButton);
    
    await waitFor(() => {
      expect(authService.sendVerificationCode).toHaveBeenCalledWith('13812345678');
    });
  });

  it('发送验证码后应该开始倒计时', async () => {
    const { authService } = await import('../../src/services/authService');
    authService.sendVerificationCode.mockResolvedValue({ success: true });
    
    render(<LoginForm />);
    
    const phoneInput = screen.getByTestId('phone-input');
    const sendCodeButton = screen.getByTestId('send-code-button');
    
    fireEvent.change(phoneInput, { target: { value: '13812345678' } });
    fireEvent.click(sendCodeButton);
    
    await waitFor(() => {
      expect(sendCodeButton).toHaveTextContent(/\d+秒后重试/);
      expect(sendCodeButton).toBeDisabled();
    });
  });

  it('点击登录应该调用登录服务', async () => {
    const { authService } = await import('../../src/services/authService');
    authService.login.mockResolvedValue({ 
      success: true, 
      data: { token: 'test-token', user: { id: '1', phoneNumber: '13812345678' } }
    });
    
    const mockOnLoginSuccess = vi.fn();
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const phoneInput = screen.getByTestId('phone-input');
    const codeInput = screen.getByTestId('verification-code-input');
    const loginButton = screen.getByTestId('login-submit-button');
    
    fireEvent.change(phoneInput, { target: { value: '13812345678' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });
    
    await waitFor(() => {
      expect(loginButton).toBeEnabled();
    });
    
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('13812345678', '123456');
    });
  });

  it('登录成功应该调用onLoginSuccess回调', async () => {
    const { authService } = await import('../../src/services/authService');
    const userData = { token: 'test-token', user: { id: '1', phoneNumber: '13812345678' } };
    authService.login.mockResolvedValue({ success: true, data: userData });
    
    const mockOnLoginSuccess = vi.fn();
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const phoneInput = screen.getByTestId('phone-input');
    const codeInput = screen.getByTestId('verification-code-input');
    const loginButton = screen.getByTestId('login-submit-button');
    
    fireEvent.change(phoneInput, { target: { value: '13812345678' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(mockOnLoginSuccess).toHaveBeenCalledWith(userData);
    });
  });

  it('未注册手机号应该显示注册提示', async () => {
    const { authService } = await import('../../src/services/authService');
    authService.login.mockRejectedValue(new Error('该手机号未注册，请先完成注册'));
    
    render(<LoginForm />);
    
    const phoneInput = screen.getByTestId('phone-input');
    const codeInput = screen.getByTestId('verification-code-input');
    const loginButton = screen.getByTestId('login-submit-button');
    
    fireEvent.change(phoneInput, { target: { value: '13812345678' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      const errorMessage = screen.getByTestId('login-error');
      expect(errorMessage).toHaveTextContent('该手机号未注册，请先完成注册');
    });
  });

  it('验证码错误应该显示错误信息', async () => {
    const { authService } = await import('../../src/services/authService');
    authService.login.mockRejectedValue(new Error('验证码错误或已过期'));
    
    render(<LoginForm />);
    
    const phoneInput = screen.getByTestId('phone-input');
    const codeInput = screen.getByTestId('verification-code-input');
    const loginButton = screen.getByTestId('login-submit-button');
    
    fireEvent.change(phoneInput, { target: { value: '13812345678' } });
    fireEvent.change(codeInput, { target: { value: '000000' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      const errorMessage = screen.getByTestId('login-error');
      expect(errorMessage).toHaveTextContent('验证码错误或已过期');
    });
  });

  it('手机号格式错误应该显示验证错误', async () => {
    render(<LoginForm />);
    
    const phoneInput = screen.getByTestId('phone-input');
    fireEvent.change(phoneInput, { target: { value: '123456' } });
    
    await waitFor(() => {
      const errorMessage = screen.getByTestId('login-error');
      expect(errorMessage).toHaveTextContent('请输入正确的手机号码');
    });
  });

  it('加载状态下按钮应该被禁用并显示加载文本', async () => {
    const { authService } = await import('../../src/services/authService');
    authService.login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    render(<LoginForm />);
    
    const phoneInput = screen.getByTestId('phone-input');
    const codeInput = screen.getByTestId('verification-code-input');
    const loginButton = screen.getByTestId('login-submit-button');
    
    fireEvent.change(phoneInput, { target: { value: '13812345678' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(loginButton);
    
    expect(loginButton).toHaveTextContent('登录中...');
    expect(loginButton).toBeDisabled();
  });
});