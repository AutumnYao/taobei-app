import React, { useState, useEffect } from 'react';

const HomePage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  useEffect(() => {
    // 从localStorage获取token并解析用户信息
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // 解析JWT token获取用户信息
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.phoneNumber) {
          setPhoneNumber(payload.phoneNumber);
        }
      } catch (error) {
        console.error('解析token失败:', error);
      }
    }
  }, []);

  return (
    <div className="container">
      <h1>欢迎来到淘贝{phoneNumber ? `, ${phoneNumber}` : ''}</h1>
      <p>登录成功！</p>
    </div>
  );
};

export default HomePage;