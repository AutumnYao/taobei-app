import React, { useState, useEffect } from 'react';

interface VerificationCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  className?: string;
}

// UI-VerificationCodeInput: 验证码输入框组件
const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  value,
  onChange,
  maxLength = 6,
  className
}) => {
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    // TODO: 验证码格式验证（只允许数字）
    const codeRegex = /^\d*$/;
    setIsValid(codeRegex.test(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // 限制只能输入数字且不超过最大长度
    if (/^\d*$/.test(newValue) && newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  return (
    <div className="verification-code-input-container">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="请输入验证码"
        maxLength={maxLength}
        className={`verification-code-input ${!isValid ? 'error' : ''} ${className || ''}`}
        data-testid="verification-code-input"
      />
    </div>
  );
};

export default VerificationCodeInput;