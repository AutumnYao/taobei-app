import React, { useState, useEffect } from 'react';

interface VerificationCodeInputProps {
  phoneNumber: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  phoneNumber,
  value,
  onChange,
  error
}) => {
  const [countdown, setCountdown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // 验证手机号格式
  const validatePhoneNumber = (phone: string) => {
    if (!phone) {
      return '请先输入手机号';
    }
    if (phone.length !== 11) {
      return '手机号应为11位数字';
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return '请输入正确的手机号格式';
    }
    return '';
  };

  const handleSendCode = async () => {
    if (countdown > 0 || isSending) return;

    // 验证手机号
    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) {
      setSendError(phoneError);
      return;
    }

    setIsSending(true);
    setSendError('');
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCountdown(data.data.countdown || 60);
        setSendError(''); // 清除错误信息
      } else {
        setSendError(data.message || '发送失败，请重试');
      }
    } catch (error) {
      console.error('发送验证码错误:', error);
      setSendError('网络错误，请检查网络连接后重试');
    } finally {
      setIsSending(false);
    }
  };

  const getButtonText = () => {
    if (isSending) return '发送中...';
    if (countdown > 0) return `${countdown}s后重发`;
    return '获取验证码';
  };

  const isButtonDisabled = () => {
    return !phoneNumber || countdown > 0 || isSending || validatePhoneNumber(phoneNumber) !== '';
  };

  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // 只允许数字
    if (value.length <= 6) {
      onChange(value);
    }
  };

  return (
    <div className="form-group">
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="请输入验证码"
          value={value}
          onChange={handleVerificationCodeChange}
          maxLength={6}
          required
        />
        <button
          type="button"
          className="btn btn-code"
          onClick={handleSendCode}
          disabled={isButtonDisabled()}
        >
          {getButtonText()}
        </button>
      </div>
      {error && (
        <div className="error-message">{error}</div>
      )}
      {sendError && (
        <div className="error-message">{sendError}</div>
      )}
    </div>
  );
};

export default VerificationCodeInput;