import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 检查用户是否已登录
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('解析用户数据失败:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="home-header">
          <div className="logo">
            <span className="logo-text">淘贝</span>
          </div>
          
          {user && (
            <div className="user-info">
              <span className="welcome-text">欢迎，{user.phoneNumber}</span>
              <button className="logout-button" onClick={handleLogout}>
                退出登录
              </button>
            </div>
          )}
        </div>

        <div className="home-content">
          <div className="welcome-section">
            <h1 className="welcome-title">欢迎来到淘贝</h1>
            <p className="welcome-subtitle">您的购物新体验</p>
          </div>

          {!user ? (
            <div className="auth-buttons">
              <button className="login-button" onClick={handleLogin}>
                亲，请登录
              </button>
              <button className="register-button" onClick={handleRegister}>
                免费注册
              </button>
            </div>
          ) : (
            <div className="user-actions">
              <div className="action-grid">
                <div className="action-card">
                  <div className="action-icon">🛍️</div>
                  <h3>开始购物</h3>
                  <p>浏览精选商品</p>
                </div>
                <div className="action-card">
                  <div className="action-icon">📦</div>
                  <h3>我的订单</h3>
                  <p>查看订单状态</p>
                </div>
                <div className="action-card">
                  <div className="action-icon">❤️</div>
                  <h3>我的收藏</h3>
                  <p>管理收藏商品</p>
                </div>
                <div className="action-card">
                  <div className="action-icon">👤</div>
                  <h3>个人中心</h3>
                  <p>管理个人信息</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="home-footer">
          <p>&copy; 2024 淘贝. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;