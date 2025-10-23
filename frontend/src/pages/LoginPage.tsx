import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [phoneError, setPhoneError] = useState('');
  const navigate = useNavigate();

  // 验证手机号格式
  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  // 处理手机号输入变化
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    
    // 实时验证手机号格式
    if (value && !validatePhoneNumber(value)) {
      setPhoneError('请输入正确的手机号码');
    } else {
      setPhoneError('');
    }
  };

  // 发送验证码
  const handleSendCode = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setMessage('请输入正确的手机号');
      return;
    }

    setIsSendingCode(true);
    setMessage('');

    try {
      const result = await authService.sendVerificationCode(phoneNumber);
      if (result.success) {
        setMessage('验证码发送成功');
        // 开始倒计时
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setMessage(result.message || '验证码发送失败');
      }
    } catch (error) {
      setMessage('网络错误，请稍后重试');
    } finally {
      setIsSendingCode(false);
    }
  };

  // 处理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhoneNumber(phoneNumber)) {
      setMessage('请输入正确的手机号');
      return;
    }

    if (!verificationCode) {
      setMessage('请输入验证码');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const result = await authService.login(phoneNumber, verificationCode);
      if (result.success) {
        setMessage('登录成功');
        // 保存用户信息到localStorage
        if (result.data) {
          localStorage.setItem('token', result.data.token);
          localStorage.setItem('user', JSON.stringify(result.data.user));
        }
        // 显示登录成功提示后跳转到首页
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        if (result.error === 'USER_NOT_REGISTERED') {
          setMessage('用户未注册，请先注册');
        } else {
          setMessage(result.message || '登录失败');
        }
      }
    } catch (error) {
      setMessage('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <button className="back-button" onClick={() => navigate('/')}>
            ← 返回首页
          </button>
          <h1>用户登录</h1>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="phoneNumber">手机号</label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="请输入手机号"
              maxLength={11}
              required
              className={phoneError ? 'error' : ''}
            />
            {phoneError && (
              <div className="error-message">
                {phoneError}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="verificationCode">验证码</label>
            <div className="verification-input-group">
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="请输入验证码"
                maxLength={6}
                required
              />
              <button
                type="button"
                className="send-code-button"
                onClick={handleSendCode}
                disabled={isSendingCode || countdown > 0 || !validatePhoneNumber(phoneNumber)}
              >
                {countdown > 0 ? `${countdown}s` : isSendingCode ? '发送中...' : '获取验证码'}
              </button>
            </div>
          </div>

          {message && (
            <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            还没有账号？
            <button
              type="button"
              className="link-button"
              onClick={() => navigate('/register')}
            >
              立即注册
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;