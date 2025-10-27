import React, { useState } from 'react';
import VerificationCodeInput from './VerificationCodeInput';

interface SmsLoginFormProps {
  onLoginSuccess: () => void;
}

const SmsLoginForm: React.FC<SmsLoginFormProps> = ({ onLoginSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // 验证手机号格式
  const validatePhoneNumber = (phone: string) => {
    if (!phone) {
      return '请输入手机号';
    }
    if (phone.length !== 11) {
      return '手机号应为11位数字';
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return '请输入正确的手机号格式';
    }
    return '';
  };

  // 验证验证码
  const validateVerificationCode = (code: string) => {
    if (!code) {
      return '请输入验证码';
    }
    if (code.length !== 6) {
      return '验证码应为6位数字';
    }
    if (!/^\d{6}$/.test(code)) {
      return '验证码只能包含数字';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // 表单验证
    const phoneError = validatePhoneNumber(phoneNumber);
    const codeError = validateVerificationCode(verificationCode);
    
    if (phoneError || codeError) {
      setErrors({
        phoneNumber: phoneError,
        verificationCode: codeError
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/sms-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          verificationCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 保存token到localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('userId', data.data.userId);
        onLoginSuccess();
      } else {
        setErrors({ general: data.message });
      }
    } catch (error) {
      setErrors({ general: '网络错误，请稍后重试' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // 只允许数字
    if (value.length <= 11) {
      setPhoneNumber(value);
      // 清除手机号相关错误
      if (errors.phoneNumber) {
        setErrors(prev => ({ ...prev, phoneNumber: '' }));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 手机号输入 */}
      <div className="form-group">
        <input
          type="tel"
          className="form-control"
          placeholder="请输入手机号"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          maxLength={11}
          required
        />
        {errors.phoneNumber && (
          <div className="error-message">{errors.phoneNumber}</div>
        )}
      </div>

      {/* 验证码输入 */}
      <VerificationCodeInput
        phoneNumber={phoneNumber}
        value={verificationCode}
        onChange={setVerificationCode}
        error={errors.verificationCode}
      />

      {/* 通用错误信息 */}
      {errors.general && (
        <div className="error-message">{errors.general}</div>
      )}

      {/* 登录按钮 */}
      <div className="form-group">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? '登录中...' : '登录'}
        </button>
      </div>
    </form>
  );
};

export default SmsLoginForm;