import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VerificationCodeInput from '../../src/components/VerificationCodeInput';

describe('VerificationCodeInput Component', () => {
  // 基于UI-VerificationCodeInput的acceptanceCriteria
  it('应该显示输入框和占位符文本', () => {
    const mockOnChange = vi.fn();
    render(<VerificationCodeInput value="" onChange={mockOnChange} />);
    
    const input = screen.getByTestId('verification-code-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', '请输入验证码');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('应该显示传入的值', () => {
    const mockOnChange = vi.fn();
    const testValue = '123456';
    render(<VerificationCodeInput value={testValue} onChange={mockOnChange} />);
    
    const input = screen.getByTestId('verification-code-input');
    expect(input).toHaveValue(testValue);
  });

  it('应该设置默认最大长度为6', () => {
    const mockOnChange = vi.fn();
    render(<VerificationCodeInput value="" onChange={mockOnChange} />);
    
    const input = screen.getByTestId('verification-code-input');
    expect(input).toHaveAttribute('maxLength', '6');
  });

  it('应该支持自定义最大长度', () => {
    const mockOnChange = vi.fn();
    render(<VerificationCodeInput value="" onChange={mockOnChange} maxLength={4} />);
    
    const input = screen.getByTestId('verification-code-input');
    expect(input).toHaveAttribute('maxLength', '4');
  });

  it('应该只允许输入数字', () => {
    const mockOnChange = vi.fn();
    render(<VerificationCodeInput value="" onChange={mockOnChange} />);
    
    const input = screen.getByTestId('verification-code-input');
    
    // 尝试输入字母
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(mockOnChange).not.toHaveBeenCalled();
    
    // 尝试输入数字
    fireEvent.change(input, { target: { value: '123' } });
    expect(mockOnChange).toHaveBeenCalledWith('123');
  });

  it('应该限制输入长度不超过最大长度', () => {
    const mockOnChange = vi.fn();
    render(<VerificationCodeInput value="" onChange={mockOnChange} maxLength={6} />);
    
    const input = screen.getByTestId('verification-code-input');
    
    // 尝试输入超过6位的数字
    fireEvent.change(input, { target: { value: '1234567890' } });
    expect(mockOnChange).not.toHaveBeenCalled();
    
    // 输入6位数字应该成功
    fireEvent.change(input, { target: { value: '123456' } });
    expect(mockOnChange).toHaveBeenCalledWith('123456');
  });

  it('应该允许输入少于最大长度的数字', () => {
    const mockOnChange = vi.fn();
    render(<VerificationCodeInput value="" onChange={mockOnChange} />);
    
    const input = screen.getByTestId('verification-code-input');
    
    // 输入1位数字
    fireEvent.change(input, { target: { value: '1' } });
    expect(mockOnChange).toHaveBeenCalledWith('1');
    
    // 输入3位数字
    fireEvent.change(input, { target: { value: '123' } });
    expect(mockOnChange).toHaveBeenCalledWith('123');
  });

  it('应该拒绝包含特殊字符的输入', () => {
    const mockOnChange = vi.fn();
    render(<VerificationCodeInput value="" onChange={mockOnChange} />);
    
    const input = screen.getByTestId('verification-code-input');
    
    const invalidInputs = ['12-34', '12.34', '12 34', '12@34', '12#34'];
    
    invalidInputs.forEach(invalidInput => {
      mockOnChange.mockClear();
      fireEvent.change(input, { target: { value: invalidInput } });
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  it('应该允许删除字符', () => {
    const mockOnChange = vi.fn();
    render(<VerificationCodeInput value="123" onChange={mockOnChange} />);
    
    const input = screen.getByTestId('verification-code-input');
    
    // 删除一个字符
    fireEvent.change(input, { target: { value: '12' } });
    expect(mockOnChange).toHaveBeenCalledWith('12');
    
    // 清空输入
    fireEvent.change(input, { target: { value: '' } });
    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('应该正确处理粘贴操作', () => {
    const mockOnChange = vi.fn();
    render(<VerificationCodeInput value="" onChange={mockOnChange} />);
    
    const input = screen.getByTestId('verification-code-input');
    
    // 粘贴有效的数字
    fireEvent.change(input, { target: { value: '123456' } });
    expect(mockOnChange).toHaveBeenCalledWith('123456');
    
    // 粘贴超长的数字（应该被截断）
    mockOnChange.mockClear();
    fireEvent.change(input, { target: { value: '12345678901234567890' } });
    expect(mockOnChange).not.toHaveBeenCalled();
  });
});