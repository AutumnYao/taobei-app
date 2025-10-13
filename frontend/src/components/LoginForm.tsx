import React, { useState, useEffect } from 'react';
import PhoneNumberInput from './PhoneNumberInput';
import VerificationCodeInput from './VerificationCodeInput';
import { authService } from '../services/authService';
import styles from './LoginForm.module.css';

interface LoginFormProps {
  onLoginSuccess?: (userData: any) => void;
  onNavigateToRegister?: () => void;
}

// UI-LoginForm: 完整的用户登录表单
const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onNavigateToRegister
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canSendCode, setCanSendCode] = useState(true);
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  // 倒计时效果
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else {
      setCanSendCode(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    if (!isPhoneValid || !phoneNumber) {
      setError('请输入正确的手机号码');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const result = await authService.sendVerificationCode(phoneNumber);
      
      if (result.success) {
        // 开始60秒倒计时
        setCountdown(60);
        setCanSendCode(false);
      } else {
        setError(result.message || '发送验证码失败');
      }
    } catch (err) {
      setError('发送验证码失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!phoneNumber || !verificationCode) {
      setError('请输入手机号和验证码');
      return;
    }

    if (!isPhoneValid) {
      setError('请输入正确的手机号码');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const result = await authService.login(phoneNumber, verificationCode);
      
      if (result.success && result.data) {
        // 登录成功
        if (onLoginSuccess) {
          onLoginSuccess(result.data);
        }
      } else {
        // 根据错误类型显示不同的错误信息
        if (result.error === 'USER_NOT_REGISTERED') {
          setError('该手机号未注册，请先完成注册');
        } else if (result.error === 'INVALID_OR_EXPIRED_CODE') {
          setError('验证码错误或已过期');
        } else if (result.error === 'INVALID_PHONE_FORMAT') {
          setError('请输入正确的手机号码');
        } else {
          setError(result.message || '登录失败');
        }
      }
    } catch (err) {
      setError('登录失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneValidation = (isValid: boolean, errorMessage?: string) => {
    setIsPhoneValid(isValid);
    if (!isValid && errorMessage && phoneNumber) {
      setError(errorMessage);
    } else if (error === errorMessage) {
      setError('');
    }
  };

  return (
    <div className={styles.loginForm} data-testid="login-form">
      <h2 className={styles.title}>用户登录</h2>
      
      <div className={styles.inputGroup}>
        <div className={styles.phoneInputContainer}>
          <div className={styles.countryCode}>中国大陆 +86</div>
          <PhoneNumberInput
            value={phoneNumber}
            onChange={setPhoneNumber}
            onValidation={handlePhoneValidation}
            className={styles.phoneInput}
          />
        </div>
      </div>

      <div className={styles.inputGroup}>
        <div className={styles.codeInputContainer}>
          <VerificationCodeInput
            value={verificationCode}
            onChange={setVerificationCode}
            className={styles.codeInput}
          />
          <button
            onClick={handleSendCode}
            disabled={!canSendCode || isLoading || countdown > 0 || !isPhoneValid}
            className={styles.sendCodeButton}
            data-testid="send-code-button"
          >
            {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
          </button>
        </div>
      </div>

      <button
        onClick={handleLogin}
        disabled={isLoading || !phoneNumber || !verificationCode || !isPhoneValid}
        className={`${styles.loginButton} ${isLoading ? styles.loading : ''}`}
        data-testid="login-submit-button"
      >
        {isLoading ? '登录中...' : '登录'}
      </button>

      {error && (
        <div className={styles.errorMessage} data-testid="login-error">
          {error}
        </div>
      )}

      {onNavigateToRegister && (
        <div className={styles.registerLink}>
          还没有账号？<a href="#" onClick={(e) => { e.preventDefault(); onNavigateToRegister(); }}>立即注册</a>
        </div>
      )}
    </div>
  );
};

export default LoginForm;