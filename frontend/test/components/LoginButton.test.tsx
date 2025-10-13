import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginButton from '../../src/components/LoginButton';

describe('LoginButton Component', () => {
  // 基于UI-LoginButton的acceptanceCriteria
  it('应该显示默认文本"亲，请登录"', () => {
    render(<LoginButton />);
    
    const button = screen.getByTestId('login-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('亲，请登录');
  });

  it('应该显示自定义文本', () => {
    const customText = '立即登录';
    render(<LoginButton text={customText} />);
    
    const button = screen.getByTestId('login-button');
    expect(button).toHaveTextContent(customText);
  });

  it('点击时应该触发onClick回调', () => {
    const mockOnClick = vi.fn();
    render(<LoginButton onClick={mockOnClick} />);
    
    const button = screen.getByTestId('login-button');
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('应该具有正确的CSS类名', () => {
    render(<LoginButton />);
    
    const button = screen.getByTestId('login-button');
    expect(button).toHaveClass('login-button');
  });

  it('应该是一个可点击的按钮元素', () => {
    render(<LoginButton />);
    
    const button = screen.getByTestId('login-button');
    expect(button.tagName).toBe('BUTTON');
    expect(button).toBeEnabled();
  });

  it('没有onClick回调时点击不应该报错', () => {
    render(<LoginButton />);
    
    const button = screen.getByTestId('login-button');
    
    expect(() => {
      fireEvent.click(button);
    }).not.toThrow();
  });
});