import React, { useState, useEffect } from 'react';

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidation?: (isValid: boolean, errorMessage?: string) => void;
  className?: string;
}

// UI-PhoneNumberInput: 手机号输入框组件
const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value,
  onChange,
  onValidation,
  className
}) => {
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // TODO: 实现手机号格式验证逻辑
    const phoneRegex = /^1[3-9]\d{9}$/;
    const valid = phoneRegex.test(value) || value === '';
    const error = valid ? '' : '请输入正确的手机号码';
    
    setIsValid(valid);
    setErrorMessage(error);
    
    if (onValidation) {
      onValidation(valid, error);
    }
  }, [value, onValidation]);

  return (
    <div className="phone-input-container">
      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="请输入手机号"
        className={`phone-input ${!isValid ? 'error' : ''} ${className || ''}`}
        data-testid="phone-input"
      />
      {!isValid && errorMessage && (
        <div className="error-message" data-testid="phone-error">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default PhoneNumberInput;