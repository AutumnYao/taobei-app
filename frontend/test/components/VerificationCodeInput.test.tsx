import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VerificationCodeInput from '../../src/components/VerificationCodeInput';

describe('VerificationCodeInput', () => {
  const mockOnSendCode = jest.fn();

  beforeEach(() => {
    mockOnSendCode.mockClear();
  });

  it('应该包含验证码输入框', () => {
    render(<VerificationCodeInput onSendCode={mockOnSendCode} />);
    
    const codeInput = screen.getByPlaceholderText('请输入验证码');
    expect(codeInput).toBeInTheDocument();
  });

  it('应该包含获取验证码按钮', () => {
    render(<VerificationCodeInput onSendCode={mockOnSendCode} />);
    
    const sendButton = screen.getByText('获取验证码');
    expect(sendButton).toBeInTheDocument();
  });

  it('应该在初始状态下启用获取验证码按钮', () => {
    render(<VerificationCodeInput onSendCode={mockOnSendCode} />);
    
    const sendButton = screen.getByText('获取验证码');
    expect(sendButton).not.toBeDisabled();
  });

  it('应该在点击获取验证码时调用回调函数', () => {
    render(<VerificationCodeInput onSendCode={mockOnSendCode} />);
    
    const sendButton = screen.getByText('获取验证码');
    fireEvent.click(sendButton);
    
    expect(mockOnSendCode).toHaveBeenCalled();
  });

  it('应该在发送验证码时显示"发送中..."', async () => {
    render(<VerificationCodeInput onSendCode={mockOnSendCode} />);
    
    const sendButton = screen.getByText('获取验证码');
    fireEvent.click(sendButton);
    
    // 应该显示发送中状态
    const sendingButton = screen.getByText('发送中...');
    expect(sendingButton).toBeInTheDocument();
    expect(sendingButton).toBeDisabled();
  });

  it('应该在发送后开始60秒倒计时', async () => {
    render(<VerificationCodeInput onSendCode={mockOnSendCode} />);
    
    const sendButton = screen.getByText('获取验证码');
    fireEvent.click(sendButton);
    
    // 等待发送完成，应该显示倒计时
    await waitFor(() => {
      const countdownButton = screen.getByText(/\d+s后重发/);
      expect(countdownButton).toBeInTheDocument();
      expect(countdownButton).toBeDisabled();
    }, { timeout: 2000 });
  });

  it('应该在倒计时结束后重新启用按钮', async () => {
    // 模拟快速倒计时
    jest.useFakeTimers();
    
    render(<VerificationCodeInput onSendCode={mockOnSendCode} />);
    
    const sendButton = screen.getByText('获取验证码');
    fireEvent.click(sendButton);
    
    // 等待发送完成
    await waitFor(() => {
      const countdownButton = screen.getByText(/\d+s后重发/);
      expect(countdownButton).toBeInTheDocument();
    });
    
    // 快进60秒
    jest.advanceTimersByTime(60000);
    
    // 应该重新显示"获取验证码"
    await waitFor(() => {
      const resetButton = screen.getByText('获取验证码');
      expect(resetButton).toBeInTheDocument();
      expect(resetButton).not.toBeDisabled();
    });
    
    jest.useRealTimers();
  });

  it('应该正确处理验证码输入', () => {
    render(<VerificationCodeInput onSendCode={mockOnSendCode} />);
    
    const codeInput = screen.getByPlaceholderText('请输入验证码') as HTMLInputElement;
    
    fireEvent.change(codeInput, { target: { value: '123456' } });
    
    expect(codeInput.value).toBe('123456');
  });

  it('应该限制验证码输入长度为6位', () => {
    render(<VerificationCodeInput onSendCode={mockOnSendCode} />);
    
    const codeInput = screen.getByPlaceholderText('请输入验证码');
    
    expect(codeInput).toHaveAttribute('maxLength', '6');
  });

  it('应该设置正确的输入类型', () => {
    render(<VerificationCodeInput onSendCode={mockOnSendCode} />);
    
    const codeInput = screen.getByPlaceholderText('请输入验证码');
    
    expect(codeInput).toHaveAttribute('type', 'text');
    expect(codeInput).toBeRequired();
  });

  it('应该在发送失败时显示错误信息', async () => {
    // 模拟发送失败
    const failingOnSendCode = jest.fn().mockRejectedValue(new Error('发送失败'));
    
    render(<VerificationCodeInput onSendCode={failingOnSendCode} />);
    
    const sendButton = screen.getByText('获取验证码');
    fireEvent.click(sendButton);
    
    // TODO: 验证错误处理
    // 当前骨架代码可能不包含完整的错误处理
    await waitFor(() => {
      // 应该重新启用按钮或显示错误信息
    }, { timeout: 2000 });
  });

  it('应该支持键盘操作', () => {
    render(<VerificationCodeInput onSendCode={mockOnSendCode} />);
    
    const codeInput = screen.getByPlaceholderText('请输入验证码');
    const sendButton = screen.getByText('获取验证码');
    
    // 测试Tab键导航
    codeInput.focus();
    fireEvent.keyDown(codeInput, { key: 'Tab' });
    
    expect(sendButton).toHaveFocus();
  });

  it('应该在组件卸载时清理定时器', () => {
    const { unmount } = render(<VerificationCodeInput onSendCode={mockOnSendCode} />);
    
    const sendButton = screen.getByText('获取验证码');
    fireEvent.click(sendButton);
    
    // 卸载组件
    unmount();
    
    // TODO: 验证定时器被清理
    // 这需要检查组件内部的清理逻辑
  });
});