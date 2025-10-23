import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneNumberInput from '../components/PhoneNumberInput';
import VerificationCodeInput from '../components/VerificationCodeInput';
import { sendVerificationCode, register } from '../services/authService';
import './RegisterPage.css';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleSendCode = async () => {
    if (!phoneNumber) {
      setMessage('请输入手机号码');
      return;
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setMessage('请输入正确的手机号码');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('');
      
      const response = await sendVerificationCode(phoneNumber);
      if (response.success) {
        setMessage('验证码发送成功');
        // 开始60秒倒计时
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
        setMessage(response.message || '发送验证码失败');
      }
    } catch (error) {
      setMessage('发送验证码失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!phoneNumber) {
      setMessage('请输入手机号码');
      return;
    }

    if (!verificationCode) {
      setMessage('请输入验证码');
      return;
    }

    if (!isAgreed) {
      setMessage('请同意《淘贝用户协议》');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('');
      
      const response = await register(phoneNumber, verificationCode);
      if (response.success) {
        // 根据后端返回的消息判断是新注册还是已注册用户
        if (response.message?.includes('已注册')) {
          setMessage('该手机号已注册，将直接为您登录');
        } else {
          setMessage('注册成功');
        }
        
        // 保存用户登录状态到localStorage
        if (response.data) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        // 跳转到已登录状态的首页
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setMessage(response.message || '注册失败');
      }
    } catch (error) {
      setMessage('注册失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const isRegisterDisabled = !phoneNumber || !verificationCode || !isAgreed || isLoading;

  return (
    <div className="register-page">
      <div className="register-header">
        <button className="back-btn" onClick={handleBackToHome}>
          ← 返回首页
        </button>
        <div className="logo">
          <span className="logo-text">淘贝</span>
        </div>
        <div className="header-spacer"></div>
      </div>
      
      <div className="register-content">
        <div className="register-container">
          <h1 className="register-title">用户注册</h1>
          
          <div className="register-form">
            <div className="form-group">
              <label htmlFor="phone">手机号码</label>
              <PhoneNumberInput
                value={phoneNumber}
                onChange={setPhoneNumber}
                placeholder="请输入手机号码"
              />
            </div>

            <div className="form-group">
              <label htmlFor="code">验证码</label>
              <div className="code-input-group">
                <VerificationCodeInput
                  value={verificationCode}
                  onChange={setVerificationCode}
                  placeholder="请输入验证码"
                />
                <button
                  className="send-code-btn"
                  onClick={handleSendCode}
                  disabled={isLoading || countdown > 0}
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="agreement-label">
                <input
                  type="checkbox"
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                  className="agreement-checkbox"
                />
                <span className="checkmark"></span>
                同意《淘贝用户协议》
              </label>
            </div>

            {message && (
              <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <button
              className="register-btn"
              onClick={handleRegister}
              disabled={isRegisterDisabled}
            >
              {isLoading ? '注册中...' : '注册'}
            </button>
          </div>
          
          <div className="register-footer">
            <p className="login-prompt">
              已有账号？
              <button className="login-link" onClick={handleGoToLogin}>
                立即登录
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;