# 用户登录注册系统

一个基于 React + Node.js + SQLite 的现代化用户登录注册系统，采用手机验证码验证方式，界面风格仿淘宝设计。

## 📋 项目概述

本项目是一个完整的用户认证系统，包含用户注册和登录功能。系统采用前后端分离架构，提供了完整的手机号验证码验证流程，具有良好的用户体验和安全性。

## ✨ 主要功能

### 🔐 用户登录
- 手机号格式验证
- 验证码获取与验证
- 60秒倒计时防重复发送
- 登录状态管理
- 自动跳转首页

### 📝 用户注册  
- 手机号唯一性检查
- 验证码验证机制
- 用户协议同意确认
- 自动登录并跳转
- 已注册用户直接登录

### 🛡️ 安全特性
- 手机号格式校验
- 验证码有效期控制（60秒）
- 频率限制防刷
- CORS 跨域保护
- Helmet 安全头设置

## 🏗️ 技术架构

### 前端技术栈
- **React 18** - 现代化 UI 框架
- **TypeScript** - 类型安全
- **Vite** - 快速构建工具
- **React Router** - 路由管理
- **CSS3** - 响应式样式设计

### 后端技术栈
- **Node.js** - 服务端运行环境
- **Express.js** - Web 应用框架
- **SQLite3** - 轻量级数据库
- **CORS** - 跨域资源共享
- **Helmet** - 安全中间件
- **Express Rate Limit** - 请求频率限制

### 测试框架
- **Jest** - 后端单元测试
- **Vitest** - 前端测试框架
- **Testing Library** - React 组件测试
- **Supertest** - API 接口测试

## 📁 项目结构

```
03/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── app.js          # 应用入口
│   │   ├── database/       # 数据库相关
│   │   ├── routes/         # 路由定义
│   │   └── services/       # 业务逻辑
│   ├── test/               # 后端测试
│   └── package.json
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API 服务
│   │   └── main.tsx        # 应用入口
│   ├── test/               # 前端测试
│   └── package.json
├── .artifacts/             # 接口规范
│   ├── api_interface.yml   # API 接口定义
│   ├── data_interface.yml  # 数据接口定义
│   └── ui_interface.yml    # UI 接口定义
└── README.md
```

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 启动服务

#### 1. 启动后端服务
```bash
cd backend
npm start
```
后端服务将在 `http://localhost:3001` 启动

#### 2. 启动前端服务
```bash
cd frontend
npm run dev
```
前端服务将在 `http://localhost:3000` 启动

### 访问应用
打开浏览器访问 `http://localhost:3000` 即可使用系统

## 🧪 运行测试

### 后端测试
```bash
cd backend
npm test
```

### 前端测试
```bash
cd frontend
npm test
```

## 📱 使用说明

### 用户注册流程
1. 访问注册页面
2. 输入有效的中国大陆手机号（11位）
3. 点击"获取验证码"按钮
4. 输入收到的6位验证码
5. 勾选"同意《淘贝用户协议》"
6. 点击"注册"按钮完成注册

### 用户登录流程
1. 访问登录页面
2. 输入已注册的手机号
3. 点击"获取验证码"按钮
4. 输入收到的6位验证码
5. 点击"登录"按钮完成登录

## 🔧 开发模式

### 后端开发
```bash
cd backend
npm run dev  # 使用 nodemon 自动重启
```

### 前端开发
```bash
cd frontend
npm run dev  # Vite 热重载开发服务器
```

## 📊 API 接口

### 获取验证码
```
POST /api/auth/send-code
Content-Type: application/json

{
  "phone": "13800138000"
}
```

### 用户注册
```
POST /api/auth/register
Content-Type: application/json

{
  "phone": "13800138000",
  "code": "123456"
}
```

### 用户登录
```
POST /api/auth/login
Content-Type: application/json

{
  "phone": "13800138000",
  "code": "123456"
}
```

## 🎨 界面特色

- **仿淘宝设计风格** - 熟悉的用户界面
- **响应式布局** - 适配各种设备尺寸
- **实时表单验证** - 即时反馈用户输入
- **友好的错误提示** - 清晰的错误信息展示
- **流畅的交互动画** - 提升用户体验

## 🔒 安全措施

- 手机号格式严格验证
- 验证码有效期限制（60秒）
- 请求频率限制防止恶意攻击
- HTTPS 传输加密（生产环境）
- 输入数据清理和验证

## 📈 性能优化

- 前端代码分割和懒加载
- 静态资源缓存策略
- 数据库查询优化
- 内存数据库提升测试速度

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 项目 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 邮箱: your-email@example.com

---

**注意**: 本项目仅用于学习和演示目的，生产环境使用前请进行充分的安全评估和测试。