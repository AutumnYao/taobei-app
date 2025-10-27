import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SmsLoginForm from '../../src/components/SmsLoginForm';

describe('SmsLoginForm', () => {
  const mockOnLoginSuccess = jest.fn();

  beforeEach(() => {
    mockOnLoginSuccess.mockClear();
  });

  it('应该包含手机号输入框和验证码输入框', () => {
    render(<SmsLoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const codeInput = screen.getByPlaceholderText('请输入验证码');
    
    expect(phoneInput).toBeInTheDocument();
    expect(codeInput).toBeInTheDocument();
  });

  it('应该包含获取验证码按钮', () => {
    render(<SmsLoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const getCodeButton = screen.getByText('获取验证码');
    expect(getCodeButton).toBeInTheDocument();
  });

  it('应该包含登录按钮', () => {
    render(<SmsLoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const loginButton = screen.getByText('登录');
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveAttribute('type', 'submit');
  });

  it('应该在手机号为空时禁用获取验证码按钮', () => {
    render(<SmsLoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const getCodeButton = screen.getByText('获取验证码');
    expect(getCodeButton).toBeDisabled();
  });

  it('应该在输入手机号后启用获取验证码按钮', () => {
    render(<SmsLoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const getCodeButton = screen.getByText('获取验证码');
    
    fireEvent.change(phoneInput, { target: { value: '13800138000' } });
    
    expect(getCodeButton).not.toBeDisabled();
  });

  it('应该验证手机号格式', () => {
    render(<SmsLoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    
    // 输入无效手机号
    fireEvent.change(phoneInput, { target: { value: 'invalid-phone' } });
    
    // TODO: 验证手机号格式验证逻辑
    // 当前骨架代码还未实现格式验证
  });

  it('应该支持60秒倒计时功能', async () => {
    render(<SmsLoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const getCodeButton = screen.getByText('获取验证码');
    
    // 输入手机号并点击获取验证码
    fireEvent.change(phoneInput, { target: { value: '13800138000' } });
    fireEvent.click(getCodeButton);
    
    // 应该显示倒计时
    await waitFor(() => {
      const countdownButton = screen.getByText(/\d+s后重发/);
      expect(countdownButton).toBeInTheDocument();
      expect(countdownButton).toBeDisabled();
    });
  });

  it('应该在发送验证码时显示"发送中..."', async () => {
    render(<SmsLoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const getCodeButton = screen.getByText('获取验证码');
    
    // 输入手机号并点击获取验证码
    fireEvent.change(phoneInput, { target: { value: '13800138000' } });
    fireEvent.click(getCodeButton);
    
    // 应该显示发送中状态
    const sendingButton = screen.getByText('发送中...');
    expect(sendingButton).toBeInTheDocument();
    expect(sendingButton).toBeDisabled();
  });

  it('应该在提交时验证输入', async () => {
    render(<SmsLoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const codeInput = screen.getByPlaceholderText('请输入验证码');
    const loginButton = screen.getByText('登录');
    
    // 输入数据
    fireEvent.change(phoneInput, { target: { value: '13800138000' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });
    
    // 提交表单
    fireEvent.click(loginButton);
    
    // 验证表单提交被处理
    await waitFor(() => {
      // TODO: 验证提交逻辑
      // 当前骨架代码会模拟API调用
    });
  });

  it('应该在加载状态时显示"登录中..."', async () => {
    render(<SmsLoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const codeInput = screen.getByPlaceholderText('请输入验证码');
    const loginButton = screen.getByText('登录');
    
    // 输入数据并提交
    fireEvent.change(phoneInput, { target: { value: '13800138000' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(loginButton);
    
    // 应该显示加载状态
    await waitFor(() => {
      const loadingButton = screen.getByText('登录中...');
      expect(loadingButton).toBeInTheDocument();
      expect(loadingButton).toBeDisabled();
    });
  });

  it('应该在登录成功时调用回调函数', async () => {
    render(<SmsLoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const codeInput = screen.getByPlaceholderText('请输入验证码');
    const loginButton = screen.getByText('登录');
    
    // 输入数据并提交
    fireEvent.change(phoneInput, { target: { value: '13800138000' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(loginButton);
    
    // 等待异步操作完成
    await waitFor(() => {
      expect(mockOnLoginSuccess).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('应该显示错误和成功提示信息', async () => {
    render(<SmsLoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const codeInput = screen.getByPlaceholderText('请输入验证码');
    const loginButton = screen.getByText('登录');
    
    // 输入错误数据
    fireEvent.change(phoneInput, { target: { value: 'wrong-phone' } });
    fireEvent.change(codeInput, { target: { value: 'wrong-code' } });
    fireEvent.click(loginButton);
    
    // TODO: 验证错误信息显示
    // 当前骨架代码会显示通用错误信息
    await waitFor(() => {
      const errorMessage = screen.queryByText('登录失败，请检查手机号和验证码');
      expect(errorMessage).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('应该设置正确的输入类型和属性', () => {
    render(<SmsLoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const codeInput = screen.getByPlaceholderText('请输入验证码');
    
    expect(phoneInput).toHaveAttribute('type', 'tel');
    expect(codeInput).toHaveAttribute('type', 'text');
    expect(codeInput).toHaveAttribute('maxLength', '6');
    
    expect(phoneInput).toBeRequired();
    expect(codeInput).toBeRequired();
  });

  it('应该正确处理输入变化', () => {
    render(<SmsLoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const phoneInput = screen.getByPlaceholderText('请输入手机号') as HTMLInputElement;
    const codeInput = screen.getByPlaceholderText('请输入验证码') as HTMLInputElement;
    
    // 测试输入变化
    fireEvent.change(phoneInput, { target: { value: '13800138000' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });
    
    expect(phoneInput.value).toBe('13800138000');
    expect(codeInput.value).toBe('123456');
  });
});