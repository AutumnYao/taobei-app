import React from 'react';

interface LoginButtonProps {
  onClick?: () => void;
  text?: string;
}

// UI-LoginButton: 首页的登录按钮组件
const LoginButton: React.FC<LoginButtonProps> = ({ 
  onClick = () => {}, 
  text = "亲，请登录" 
}) => {
  return (
    <button 
      onClick={onClick}
      className="login-button"
      data-testid="login-button"
    >
      {text}
    </button>
  );
};

export default LoginButton;