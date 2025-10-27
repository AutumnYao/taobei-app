import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VerificationCodeInput from '../components/VerificationCodeInput';

const RegisterPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // 手机号验证
    if (!phoneNumber) {
      newErrors.phoneNumber = '请输入手机号';
    } else if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
      newErrors.phoneNumber = '请输入正确的手机号';
    }

    // 验证码验证
    if (!verificationCode) {
      newErrors.verificationCode = '请输入验证码';
    } else if (verificationCode.length !== 6) {
      newErrors.verificationCode = '验证码应为6位数字';
    }

    // 密码验证
    if (!password) {
      newErrors.password = '请设置密码';
    } else if (password.length < 6) {
      newErrors.password = '密码长度至少6位';
    }

    // 确认密码验证
    if (!confirmPassword) {
      newErrors.confirmPassword = '请确认密码';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    // 同意条款验证
    if (!agreeToTerms) {
      newErrors.agreeToTerms = '请同意用户协议和隐私政策';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          password,
          confirmPassword,
          verificationCode,
          agreeTerms: agreeToTerms,
        }),
      });

      const data = await response.json();

      if (response.ok || response.status === 409) {
        // 注册成功或已注册用户登录
        if (response.status === 409) {
          // 已注册用户，直接登录
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data.userId.toString());
          console.log('已注册用户登录成功，跳转到首页', data);
          // 使用setTimeout确保状态更新完成后再跳转
          setTimeout(() => {
            navigate('/home', { replace: true });
          }, 100);
        } else {
          // 新用户注册成功
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data.userId.toString());
          console.log('新用户注册成功，跳转到首页', data);
          // 使用setTimeout确保状态更新完成后再跳转
          setTimeout(() => {
            navigate('/home', { replace: true });
          }, 100);
        }
      } else {
        // 注册失败，显示错误信息
        setErrors({ general: data.error || data.message || '注册失败，请重试' });
      }
    } catch (error) {
      console.error('注册错误:', error);
      setErrors({ general: '网络错误，请检查网络连接后重试' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="register-container">
      <div className="register-header">
        <div className="logo">
          <span className="logo-text">淘宝</span>
        </div>
        <h2>用户注册</h2>
      </div>
      
      <div className="register-form-container">
        <form onSubmit={handleRegister} className="register-form">
          {/* 通用错误信息 */}
          {errors.general && (
            <div className="error-message general-error">{errors.general}</div>
          )}

          {/* 手机号输入 */}
          <div className="form-group">
            <div className="input-wrapper">
              <span className="input-prefix">中国大陆 +86</span>
              <input
                type="tel"
                className="form-control"
                placeholder="请输入手机号"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
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

          {/* 密码输入 */}
          <div className="form-group">
            <input
              type="password"
              className="form-control"
              placeholder="请设置密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          {/* 确认密码 */}
          <div className="form-group">
            <input
              type="password"
              className="form-control"
              placeholder="请确认密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {errors.confirmPassword && (
              <div className="error-message">{errors.confirmPassword}</div>
            )}
          </div>

          {/* 同意条款 */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                required
              />
              <span className="checkmark"></span>
              我已阅读并同意 <a href="#terms" className="link">用户协议</a> 和 <a href="#privacy" className="link">隐私政策</a>
            </label>
            {errors.agreeToTerms && (
              <div className="error-message">{errors.agreeToTerms}</div>
            )}
          </div>

          {/* 提交按钮 */}
          <div className="form-group">
            <button
              type="submit"
              className="btn btn-primary btn-register"
              disabled={isLoading || !agreeToTerms}
            >
              {isLoading ? '注册中...' : '同意协议并注册'}
            </button>
          </div>

          {/* 返回登录 */}
          <div className="form-group">
            <div className="back-to-login">
              已有账号？
              <button
                type="button"
                className="btn-link"
                onClick={handleBackToLogin}
              >
                立即登录
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;