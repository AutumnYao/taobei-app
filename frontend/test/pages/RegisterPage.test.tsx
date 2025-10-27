import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../../src/pages/RegisterPage';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// 包装组件以提供Router上下文
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('RegisterPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('应该渲染所有必需的输入字段', () => {
    renderWithRouter(<RegisterPage />);
    
    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const codeInput = screen.getByPlaceholderText('请输入验证码');
    const passwordInput = screen.getByPlaceholderText('请设置密码');
    const confirmPasswordInput = screen.getByPlaceholderText('请确认密码');
    
    expect(phoneInput).toBeInTheDocument();
    expect(codeInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();
  });

  it('应该包含验证码获取按钮', () => {
    renderWithRouter(<RegisterPage />);
    
    const getCodeButton = screen.getByText('获取验证码');
    expect(getCodeButton).toBeInTheDocument();
  });

  it('应该包含用户协议和隐私政策的同意选项', () => {
    renderWithRouter(<RegisterPage />);
    
    const agreeCheckbox = screen.getByRole('checkbox');
    const termsLink = screen.getByText('用户协议');
    const privacyLink = screen.getByText('隐私政策');
    
    expect(agreeCheckbox).toBeInTheDocument();
    expect(termsLink).toBeInTheDocument();
    expect(privacyLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute('href', '#terms');
    expect(privacyLink).toHaveAttribute('href', '#privacy');
  });

  it('应该在未同意协议时禁用注册按钮', () => {
    renderWithRouter(<RegisterPage />);
    
    const registerButton = screen.getByText('立即注册');
    expect(registerButton).toBeDisabled();
  });

  it('应该在同意协议后启用注册按钮', () => {
    renderWithRouter(<RegisterPage />);
    
    const agreeCheckbox = screen.getByRole('checkbox');
    const registerButton = screen.getByText('立即注册');
    
    fireEvent.click(agreeCheckbox);
    expect(registerButton).not.toBeDisabled();
  });

  it('应该验证手机号格式', async () => {
    renderWithRouter(<RegisterPage />);
    
    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const agreeCheckbox = screen.getByRole('checkbox');
    const registerButton = screen.getByText('立即注册');
    
    // 输入无效手机号
    fireEvent.change(phoneInput, { target: { value: 'invalid-phone' } });
    fireEvent.click(agreeCheckbox);
    fireEvent.click(registerButton);
    
    // TODO: 验证错误信息显示
    // 当前骨架代码还未实现验证逻辑
  });

  it('应该验证密码一致性', async () => {
    renderWithRouter(<RegisterPage />);
    
    const passwordInput = screen.getByPlaceholderText('请设置密码');
    const confirmPasswordInput = screen.getByPlaceholderText('请确认密码');
    const agreeCheckbox = screen.getByRole('checkbox');
    const registerButton = screen.getByText('立即注册');
    
    // 输入不一致的密码
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'different-password' } });
    fireEvent.click(agreeCheckbox);
    fireEvent.click(registerButton);
    
    // TODO: 验证错误信息显示
    // 当前骨架代码还未实现验证逻辑
  });

  it('应该验证验证码输入', async () => {
    renderWithRouter(<RegisterPage />);
    
    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const codeInput = screen.getByPlaceholderText('请输入验证码');
    const passwordInput = screen.getByPlaceholderText('请设置密码');
    const confirmPasswordInput = screen.getByPlaceholderText('请确认密码');
    const agreeCheckbox = screen.getByRole('checkbox');
    const registerButton = screen.getByText('立即注册');
    
    // 填写表单但不输入验证码
    fireEvent.change(phoneInput, { target: { value: '13800138000' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(agreeCheckbox);
    fireEvent.click(registerButton);
    
    // TODO: 验证错误信息显示
    // 当前骨架代码还未实现验证逻辑
  });

  it('应该在点击"返回登录"时导航到登录页面', () => {
    renderWithRouter(<RegisterPage />);
    
    const backButton = screen.getByText('返回登录');
    fireEvent.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('应该在加载状态时显示"注册中..."', async () => {
    renderWithRouter(<RegisterPage />);
    
    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const codeInput = screen.getByPlaceholderText('请输入验证码');
    const passwordInput = screen.getByPlaceholderText('请设置密码');
    const confirmPasswordInput = screen.getByPlaceholderText('请确认密码');
    const agreeCheckbox = screen.getByRole('checkbox');
    const registerButton = screen.getByText('立即注册');
    
    // 填写完整表单
    fireEvent.change(phoneInput, { target: { value: '13800138000' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(agreeCheckbox);
    
    // 提交表单
    fireEvent.click(registerButton);
    
    // TODO: 验证加载状态
    // 当前骨架代码还未实现异步逻辑
  });

  it('应该正确显示页面标题', () => {
    renderWithRouter(<RegisterPage />);
    
    const title = screen.getByText('用户注册');
    expect(title).toBeInTheDocument();
  });

  it('应该包含验证码输入组件', () => {
    renderWithRouter(<RegisterPage />);
    
    const codeInput = screen.getByPlaceholderText('请输入验证码');
    const getCodeButton = screen.getByText('获取验证码');
    
    expect(codeInput).toBeInTheDocument();
    expect(getCodeButton).toBeInTheDocument();
  });

  it('应该在手机号为空时禁用获取验证码按钮', () => {
    renderWithRouter(<RegisterPage />);
    
    const getCodeButton = screen.getByText('获取验证码');
    expect(getCodeButton).toBeDisabled();
  });

  it('应该在输入手机号后启用获取验证码按钮', () => {
    renderWithRouter(<RegisterPage />);
    
    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const getCodeButton = screen.getByText('获取验证码');
    
    fireEvent.change(phoneInput, { target: { value: '13800138000' } });
    
    expect(getCodeButton).not.toBeDisabled();
  });
});