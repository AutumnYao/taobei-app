import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordLoginForm from '../components/PasswordLoginForm';
import SmsLoginForm from '../components/SmsLoginForm';

const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'password' | 'sms'>('password');
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    // TODO: 实现登录成功后的逻辑
    navigate('/home');
  };

  const handleNavigateToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* 左侧二维码区域 */}
        <div className="login-left">
          <div className="qr-section">
            <h3 className="qr-title">手机扫码登录</h3>
            <div className="qr-code">
              <div className="qr-placeholder">二维码占位符</div>
            </div>
            <p className="qr-tip">打开手机淘宝，扫一扫登录</p>
          </div>
        </div>

        {/* 右侧登录表单区域 */}
        <div className="login-right">
          {/* 标签页 */}
          <div className="login-tabs">
            <button 
              className={`login-tab ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              密码登录
            </button>
            <button 
              className={`login-tab ${activeTab === 'sms' ? 'active' : ''}`}
              onClick={() => setActiveTab('sms')}
            >
              短信登录
            </button>
          </div>

          {/* 表单内容 */}
          {activeTab === 'password' ? (
            <PasswordLoginForm onLoginSuccess={handleLoginSuccess} />
          ) : (
            <SmsLoginForm onLoginSuccess={handleLoginSuccess} />
          )}

          {/* 底部链接 */}
          <div className="links">
            <div>
              <a href="#privacy">隐私政策</a> | <a href="#terms">用户协议</a>
            </div>
            <div>
              <a 
                href="#register" 
                className="register-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigateToRegister();
                }}
              >
                免费注册
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;