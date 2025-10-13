import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PhoneNumberInput from '../../src/components/PhoneNumberInput';

describe('PhoneNumberInput Component', () => {
  // 基于UI-PhoneNumberInput的acceptanceCriteria
  it('应该显示输入框和占位符文本', () => {
    const mockOnChange = vi.fn();
    render(<PhoneNumberInput value="" onChange={mockOnChange} />);
    
    const input = screen.getByTestId('phone-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', '请输入手机号');
    expect(input).toHaveAttribute('type', 'tel');
  });

  it('应该显示传入的值', () => {
    const mockOnChange = vi.fn();
    const testValue = '13812345678';
    render(<PhoneNumberInput value={testValue} onChange={mockOnChange} />);
    
    const input = screen.getByTestId('phone-input');
    expect(input).toHaveValue(testValue);
  });

  it('输入时应该调用onChange回调', () => {
    const mockOnChange = vi.fn();
    render(<PhoneNumberInput value="" onChange={mockOnChange} />);
    
    const input = screen.getByTestId('phone-input');
    fireEvent.change(input, { target: { value: '138' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('138');
  });

  it('应该验证有效的手机号格式', async () => {
    const mockOnValidation = vi.fn();
    const mockOnChange = vi.fn();
    
    render(
      <PhoneNumberInput 
        value="13812345678" 
        onChange={mockOnChange}
        onValidation={mockOnValidation}
      />
    );
    
    await waitFor(() => {
      expect(mockOnValidation).toHaveBeenCalledWith(true, '');
    });
    
    const input = screen.getByTestId('phone-input');
    expect(input).not.toHaveClass('error');
  });

  it('应该验证无效的手机号格式并显示错误', async () => {
    const mockOnValidation = vi.fn();
    const mockOnChange = vi.fn();
    
    render(
      <PhoneNumberInput 
        value="123456" 
        onChange={mockOnChange}
        onValidation={mockOnValidation}
      />
    );
    
    await waitFor(() => {
      expect(mockOnValidation).toHaveBeenCalledWith(false, '请输入正确的手机号码');
    });
    
    const input = screen.getByTestId('phone-input');
    expect(input).toHaveClass('error');
    
    const errorMessage = screen.getByTestId('phone-error');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent('请输入正确的手机号码');
  });

  it('空值应该被认为是有效的', async () => {
    const mockOnValidation = vi.fn();
    const mockOnChange = vi.fn();
    
    render(
      <PhoneNumberInput 
        value="" 
        onChange={mockOnChange}
        onValidation={mockOnValidation}
      />
    );
    
    await waitFor(() => {
      expect(mockOnValidation).toHaveBeenCalledWith(true, '');
    });
    
    const input = screen.getByTestId('phone-input');
    expect(input).not.toHaveClass('error');
  });

  it('应该支持各种有效的手机号格式', async () => {
    const validPhones = [
      '13812345678',
      '15987654321',
      '18612345678',
      '17712345678',
      '19912345678'
    ];
    
    for (const phone of validPhones) {
      const mockOnValidation = vi.fn();
      const mockOnChange = vi.fn();
      
      const { unmount } = render(
        <PhoneNumberInput 
          value={phone} 
          onChange={mockOnChange}
          onValidation={mockOnValidation}
        />
      );
      
      await waitFor(() => {
        expect(mockOnValidation).toHaveBeenCalledWith(true, '');
      });
      
      unmount();
    }
  });

  it('应该拒绝无效的手机号格式', async () => {
    const invalidPhones = [
      '12812345678', // 不是1开头的有效号段
      '1381234567',  // 少一位
      '138123456789', // 多一位
      'abcdefghijk',  // 非数字
      '138-1234-5678' // 包含特殊字符
    ];
    
    for (const phone of invalidPhones) {
      const mockOnValidation = vi.fn();
      const mockOnChange = vi.fn();
      
      const { unmount } = render(
        <PhoneNumberInput 
          value={phone} 
          onChange={mockOnChange}
          onValidation={mockOnValidation}
        />
      );
      
      await waitFor(() => {
        expect(mockOnValidation).toHaveBeenCalledWith(false, '请输入正确的手机号码');
      });
      
      unmount();
    }
  });
});