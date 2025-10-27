# 淘贝 (TaoBei) - 用户认证系统

一个基于 React + Node.js 的现代化用户认证系统，支持密码登录、短信验证码登录和用户注册功能。

## 📋 项目概述

淘贝是一个完整的用户认证解决方案，提供了安全可靠的登录和注册功能。系统采用前后端分离架构，具有良好的用户体验和安全性。

## ✨ 功能特性

### 🔐 用户登录
- **多种登录方式**：支持密码登录和短信验证码登录
- **标签页切换**：用户可在密码登录和短信登录之间自由切换
- **安全防护**：
  - 密码错误3次后需要图形验证码
  - 账户锁定机制防止暴力破解
  - JWT Token 认证
- **用户体验**：
  - 记住我/自动登录选项
  - 密码显示/隐藏切换
  - 实时表单验证

### 📱 短信验证码
- **验证码生成**：6位随机数字验证码
- **倒计时功能**：60秒倒计时防止频繁请求
- **自动注册**：未注册用户使用短信登录时自动完成注册
- **验证码过期**：60秒有效期，过期自动失效

### 👤 用户注册
- **完整注册流程**：手机号、验证码、密码、确认密码
- **智能处理**：已注册用户直接登录，无需重复注册
- **协议确认**：必须同意用户协议才能注册
- **密码验证**：确认密码必须与原密码一致

### 🏠 个性化首页
- **欢迎信息**：显示用户手机号的个性化欢迎
- **登录状态**：显示登录成功状态

## 🛠 技术栈

### 前端
- **React 18** - 现代化前端框架
- **TypeScript** - 类型安全的JavaScript
- **React Router** - 单页应用路由
- **Vite** - 快速构建工具
- **Axios** - HTTP客户端

### 后端
- **Node.js** - JavaScript运行时
- **Express** - Web应用框架
- **SQLite** - 轻量级数据库
- **JWT** - JSON Web Token认证
- **bcryptjs** - 密码加密
- **CORS** - 跨域资源共享

### 测试
- **Jest** - 后端测试框架
- **Vitest** - 前端测试框架
- **Testing Library** - React组件测试
- **Supertest** - API测试

## 📁 项目结构

```
taobei_test/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── app.js          # 应用入口
│   │   ├── controllers/    # 控制器
│   │   ├── database/       # 数据库服务
│   │   ├── routes/         # 路由定义
│   │   └── services/       # 业务逻辑
│   └── test/               # 后端测试
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── pages/          # 页面组件
│   │   └── test/           # 前端测试
│   └── public/             # 静态资源
├── database.sqlite         # SQLite数据库文件
└── .artifacts/             # 接口文档
```

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

1. **克隆项目**
```bash
git clone <repository-url>
cd taobei_test
```

2. **安装后端依赖**
```bash
cd backend
npm install
```

3. **安装前端依赖**
```bash
cd ../frontend
npm install
```

### 运行项目

1. **启动后端服务**
```bash
cd backend
npm start
```
后端服务将在 `http://localhost:3000` 启动

2. **启动前端应用**
```bash
cd frontend
npm run dev
```
前端应用将在 `http://localhost:5173` 启动

### 开发模式

- **后端开发模式**（自动重启）：
```bash
cd backend
npm run dev
```

- **前端开发模式**（已默认启用热重载）：
```bash
cd frontend
npm run dev
```

## 🧪 测试

### 运行后端测试
```bash
cd backend
npm test
```

### 运行前端测试
```bash
cd frontend
npm test
```

### 测试覆盖率
```bash
cd backend
npm test -- --coverage
```

## 📊 数据库结构

### users 表
- `id` - 用户ID（主键）
- `phone_number` - 手机号（唯一）
- `password_hash` - 密码哈希
- `login_method` - 登录方式（sms/password）
- `created_at` - 创建时间
- `updated_at` - 更新时间

### verification_codes 表
- `id` - 验证码ID（主键）
- `phone_number` - 手机号
- `code` - 验证码
- `expires_at` - 过期时间
- `created_at` - 创建时间

### login_attempts 表
- `id` - 尝试ID（主键）
- `phone_number` - 手机号
- `attempts` - 尝试次数
- `locked_until` - 锁定到期时间
- `last_attempt` - 最后尝试时间

## 🔧 配置说明

### 环境变量
在后端根目录创建 `.env` 文件：
```env
JWT_SECRET=your-secret-key
PORT=3000
```

### 数据库初始化
项目启动时会自动创建SQLite数据库和必要的表结构。

## 📝 API 接口

### 认证相关
- `POST /api/auth/send-verification-code` - 发送验证码
- `POST /api/auth/sms-login` - 短信登录
- `POST /api/auth/password-login` - 密码登录
- `POST /api/auth/register` - 用户注册

详细的API文档请参考 `.artifacts/` 目录下的接口文档。

## 🎯 使用说明

### 测试账户
系统支持任意手机号注册，验证码会在后端控制台输出。

### 登录流程
1. 访问 `http://localhost:5173`
2. 选择登录方式（密码登录/短信登录）
3. 输入手机号和密码/验证码
4. 点击登录按钮
5. 成功后跳转到首页

### 注册流程
1. 在登录页面点击"免费注册"
2. 输入手机号并获取验证码
3. 设置密码并确认
4. 同意用户协议
5. 点击注册按钮
6. 成功后自动登录并跳转到首页

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件至项目维护者

---

**注意**：这是一个演示项目，请勿在生产环境中直接使用。在生产环境部署前，请确保：
- 使用安全的JWT密钥
- 配置真实的短信服务
- 添加更多的安全验证
- 使用生产级数据库