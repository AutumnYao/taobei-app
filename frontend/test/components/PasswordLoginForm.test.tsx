import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PasswordLoginForm from '../../src/components/PasswordLoginForm';

describe('PasswordLoginForm', () => {
  const mockOnLoginSuccess = jest.fn();

  beforeEach(() => {
    mockOnLoginSuccess.mockClear();
  });

  it('应该支持输入"账号/邮箱/手机号码"和"密码"', () => {
    render(<PasswordLoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const passwordInput = screen.getByPlaceholderText('请输入密码');
    
    expect(phoneInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  it('应该包含登录按钮', () => {
    render(<PasswordLoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const loginButton = screen.getByText('登录');
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveAttribute('type', 'submit');
  });

  it('应该在输入字段为空时仍允许提交（HTML5验证）', () => {
    render(<PasswordLoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const loginButton = screen.getByText('登录');
    expect(loginButton).not.toBeDisabled();
  });

  it('应该在提交时验证输入', async () => {
    render(<PasswordLoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const passwordInput = screen.getByPlaceholderText('请输入密码');
    const loginButton = screen.getByText('登录');
    
    // 输入有效数据
    fireEvent.change(phoneInput, { target: { value: '13800138000' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // 提交表单
    fireEvent.click(loginButton);
    
    // 验证表单提交被处理
    await waitFor(() => {
      // TODO: 验证提交逻辑
      // 当前骨架代码会模拟API调用
    });
  });

  it('应该在加载状态时显示"登录中..."', async () => {
    render(<PasswordLoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const passwordInput = screen.getByPlaceholderText('请输入密码');
    const loginButton = screen.getByText('登录');
    
    // 输入数据并提交
    fireEvent.change(phoneInput, { target: { value: '13800138000' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    // 应该显示加载状态
    await waitFor(() => {
      const loadingButton = screen.getByText('登录中...');
      expect(loadingButton).toBeInTheDocument();
      expect(loadingButton).toBeDisabled();
    });
  });

  it('应该在登录成功时调用回调函数', async () => {
    render(<PasswordLoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const passwordInput = screen.getByPlaceholderText('请输入密码');
    const loginButton = screen.getByText('登录');
    
    // 输入数据并提交
    fireEvent.change(phoneInput, { target: { value: '13800138000' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    // 等待异步操作完成
    await waitFor(() => {
      expect(mockOnLoginSuccess).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('应该显示错误信息', async () => {
    render(<PasswordLoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const passwordInput = screen.getByPlaceholderText('请输入密码');
    const loginButton = screen.getByText('登录');
    
    // 输入错误数据
    fireEvent.change(phoneInput, { target: { value: 'wrong-phone' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong-password' } });
    fireEvent.click(loginButton);
    
    // TODO: 验证错误信息显示
    // 当前骨架代码会显示通用错误信息
    await waitFor(() => {
      const errorMessage = screen.queryByText('登录失败，请检查手机号和密码');
      expect(errorMessage).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('应该支持键盘回车提交', () => {
    render(<PasswordLoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const passwordInput = screen.getByPlaceholderText('请输入密码');
    
    // 在密码输入框按回车
    fireEvent.keyPress(passwordInput, { key: 'Enter', code: 'Enter' });
    
    // TODO: 验证表单提交
    // 由于是在form元素内，回车应该触发提交
  });

  it('应该正确处理输入变化', () => {
    render(<PasswordLoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const phoneInput = screen.getByPlaceholderText('请输入手机号') as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText('请输入密码') as HTMLInputElement;
    
    // 测试输入变化
    fireEvent.change(phoneInput, { target: { value: '13800138000' } });
    fireEvent.change(passwordInput, { target: { value: 'test-password' } });
    
    expect(phoneInput.value).toBe('13800138000');
    expect(passwordInput.value).toBe('test-password');
  });

  it('应该设置正确的输入类型', () => {
    render(<PasswordLoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const passwordInput = screen.getByPlaceholderText('请输入密码');
    
    expect(phoneInput).toHaveAttribute('type', 'tel');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('应该设置必填属性', () => {
    render(<PasswordLoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const passwordInput = screen.getByPlaceholderText('请输入密码');
    
    expect(phoneInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });
});