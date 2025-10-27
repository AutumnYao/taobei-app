import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../src/pages/LoginPage';

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

describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('应该默认展示"密码登录"标签页', () => {
    renderWithRouter(<LoginPage />);
    
    const passwordTab = screen.getByText('密码登录');
    const smsTab = screen.getByText('短信登录');
    
    expect(passwordTab).toHaveClass('active');
    expect(smsTab).not.toHaveClass('active');
  });

  it('应该支持切换到"短信登录"标签页', () => {
    renderWithRouter(<LoginPage />);
    
    const smsTab = screen.getByText('短信登录');
    fireEvent.click(smsTab);
    
    expect(smsTab).toHaveClass('active');
    
    const passwordTab = screen.getByText('密码登录');
    expect(passwordTab).not.toHaveClass('active');
  });

  it('应该包含"记住我/自动登录"选择项（默认勾选）', () => {
    renderWithRouter(<LoginPage />);
    
    const rememberMeCheckbox = screen.getByLabelText('记住我/自动登录');
    expect(rememberMeCheckbox).toBeInTheDocument();
    expect(rememberMeCheckbox).toBeChecked();
  });

  it('应该显示"隐私政策""用户协议"链接', () => {
    renderWithRouter(<LoginPage />);
    
    const privacyLink = screen.getByText('隐私政策');
    const termsLink = screen.getByText('用户协议');
    
    expect(privacyLink).toBeInTheDocument();
    expect(termsLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('href', '#privacy');
    expect(termsLink).toHaveAttribute('href', '#terms');
  });

  it('应该提供"免费注册""忘记密码"入口链接', () => {
    renderWithRouter(<LoginPage />);
    
    const registerButton = screen.getByText('免费注册');
    const forgotPasswordLink = screen.getByText('忘记密码');
    
    expect(registerButton).toBeInTheDocument();
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink).toHaveAttribute('href', '#forgot');
  });

  it('应该在点击"免费注册"时导航到注册页面', () => {
    renderWithRouter(<LoginPage />);
    
    const registerButton = screen.getByText('免费注册');
    fireEvent.click(registerButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  it('应该在登录成功时导航到首页', async () => {
    renderWithRouter(<LoginPage />);
    
    // 模拟登录成功
    // 这里需要触发登录表单的成功回调
    // 由于组件结构，我们需要通过子组件的回调来测试
    
    // TODO: 完善登录成功的测试逻辑
    // 当前骨架代码中的登录逻辑还未实现
  });

  it('应该正确渲染密码登录表单', () => {
    renderWithRouter(<LoginPage />);
    
    // 默认应该显示密码登录表单
    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const passwordInput = screen.getByPlaceholderText('请输入密码');
    const loginButton = screen.getByText('登录');
    
    expect(phoneInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(loginButton).toBeInTheDocument();
  });

  it('应该在切换到短信登录时渲染短信登录表单', () => {
    renderWithRouter(<LoginPage />);
    
    // 切换到短信登录
    const smsTab = screen.getByText('短信登录');
    fireEvent.click(smsTab);
    
    // 应该显示短信登录表单
    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const codeInput = screen.getByPlaceholderText('请输入验证码');
    const getCodeButton = screen.getByText('获取验证码');
    const loginButton = screen.getByText('登录');
    
    expect(phoneInput).toBeInTheDocument();
    expect(codeInput).toBeInTheDocument();
    expect(getCodeButton).toBeInTheDocument();
    expect(loginButton).toBeInTheDocument();
  });

  it('应该支持记住我选项的切换', () => {
    renderWithRouter(<LoginPage />);
    
    const rememberMeCheckbox = screen.getByLabelText('记住我/自动登录') as HTMLInputElement;
    
    // 默认应该是选中状态
    expect(rememberMeCheckbox.checked).toBe(true);
    
    // 点击取消选中
    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox.checked).toBe(false);
    
    // 再次点击选中
    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox.checked).toBe(true);
  });

  it('应该正确显示页面标题', () => {
    renderWithRouter(<LoginPage />);
    
    const title = screen.getByText('用户登录');
    expect(title).toBeInTheDocument();
  });
});