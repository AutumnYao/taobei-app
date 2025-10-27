import React, { useState } from 'react';

interface PasswordLoginFormProps {
  onLoginSuccess: () => void;
}

const PasswordLoginForm: React.FC<PasswordLoginFormProps> = ({ onLoginSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [requireCaptcha, setRequireCaptcha] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:3000/api/auth/password-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: phoneNumber,
          password,
          captcha: requireCaptcha ? captcha : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 保存token到localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('userId', data.data.userId);
        onLoginSuccess();
      } else {
        if (response.status === 428) {
          setRequireCaptcha(true);
        }
        setErrors({ general: data.message });
      }
    } catch (error) {
      setErrors({ general: '网络错误，请稍后重试' });
    } finally {
      setIsLoading(false);
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
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
        {errors.phoneNumber && (
          <div className="error-message">{errors.phoneNumber}</div>
        )}
      </div>

      {/* 密码输入 */}
      <div className="form-group">
        <input
          type="password"
          className="form-control"
          placeholder="请输入密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {errors.password && (
          <div className="error-message">{errors.password}</div>
        )}
      </div>

      {/* 验证码输入（当需要时显示） */}
      {requireCaptcha && (
        <div className="form-group">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="请输入图形验证码"
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
              required
            />
            <div style={{ 
              width: '100px', 
              height: '40px', 
              background: '#f0f0f0', 
              border: '1px solid #d9d9d9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#999'
            }}>
              验证码
            </div>
          </div>
        </div>
      )}

      {/* 记住我选项 */}
      <div className="checkbox-group">
        <input 
          type="checkbox" 
          id="rememberMe"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        <label htmlFor="rememberMe">记住我/自动登录</label>
      </div>

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

      {/* 忘记密码链接 */}
      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <a href="#forgot" style={{ color: '#ff6600', fontSize: '14px', textDecoration: 'none' }}>
          忘记密码？
        </a>
      </div>
    </form>
  );
};

export default PasswordLoginForm;