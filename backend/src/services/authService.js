const db = require('../database/db');

class AuthService {
  // 生成6位数字验证码
  generateVerificationCode() {
    // 在测试环境中使用固定验证码
    if (process.env.NODE_ENV === 'test') {
      return '123456';
    }
    // 生产环境生成随机验证码
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // 验证手机号格式
  validatePhoneNumber(phoneNumber) {
    // 中国大陆手机号格式验证：11位数字，以1开头
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phoneNumber);
  }

  // Auth-SendVerificationCode: 发送验证码
  async sendVerificationCode(phoneNumber) {
    try {
      // 验证手机号格式
      if (!this.validatePhoneNumber(phoneNumber)) {
        return {
          success: false,
          error: 'INVALID_PHONE_FORMAT',
          message: '手机号格式不正确'
        };
      }

      // 生成验证码
      const code = this.generateVerificationCode();

      // 保存验证码到数据库
      const saved = await db.saveVerificationCode(phoneNumber, code);
      
      if (!saved) {
        return {
          success: false,
          error: 'SAVE_CODE_FAILED',
          message: '验证码保存失败'
        };
      }

      // 模拟发送短信（实际项目中这里会调用短信服务）
      console.log(`发送验证码到 ${phoneNumber}: ${code}`);

      return {
        success: true,
        message: '验证码发送成功'
      };
    } catch (error) {
      console.error('发送验证码失败:', error);
      
      // 处理频率限制错误
      if (error.message === 'RATE_LIMIT_EXCEEDED') {
        return {
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: '发送过于频繁，请稍后再试'
        };
      }
      
      return {
        success: false,
        error: 'SEND_CODE_FAILED',
        message: '验证码发送失败'
      };
    }
  }

  // Auth-Login: 用户登录
  async login(phoneNumber, verificationCode) {
    try {
      // 验证手机号格式
      if (!this.validatePhoneNumber(phoneNumber)) {
        return {
          success: false,
          error: 'INVALID_PHONE_FORMAT',
          message: '手机号格式不正确'
        };
      }

      // 验证验证码
      const isCodeValid = await db.verifyCode(phoneNumber, verificationCode);
      
      if (!isCodeValid) {
        return {
          success: false,
          error: 'INVALID_OR_EXPIRED_CODE',
          message: '验证码错误或已过期'
        };
      }

      // 检查用户是否存在
      let user = await db.findUserByPhone(phoneNumber);
      if (!user) {
        return {
          success: false,
          error: 'USER_NOT_REGISTERED',
          message: '该手机号未注册，请先完成注册'
        };
      }

      // 创建登录会话
      const session = await db.createLoginSession(user.id);

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            phoneNumber: user.phoneNumber || user.phone_number
          },
          token: session.token,
          expiresAt: session.expiresAt
        },
        message: '登录成功'
      };
    } catch (error) {
      console.error('登录失败:', error);
      return {
        success: false,
        error: 'LOGIN_FAILED',
        message: '登录失败'
      };
    }
  }

  // Auth-Register: 用户注册
  async register(phoneNumber, verificationCode) {
    try {
      // 验证手机号格式
      if (!this.validatePhoneNumber(phoneNumber)) {
        return {
          success: false,
          error: 'INVALID_PHONE_FORMAT',
          message: '手机号格式不正确'
        };
      }

      // 验证验证码
      const isCodeValid = await db.verifyCode(phoneNumber, verificationCode);
      
      if (!isCodeValid) {
        return {
          success: false,
          error: 'INVALID_OR_EXPIRED_CODE',
          message: '验证码错误或已过期'
        };
      }

      // 检查用户是否已存在
      let user = await db.findUserByPhone(phoneNumber);
      if (user) {
        // 如果用户已存在，创建登录会话并返回用户数据
        const session = await db.createLoginSession(user.id);
        
        return {
          success: true,
          data: {
            user: {
              id: user.id,
              phoneNumber: user.phone_number
            },
            token: session.token,
            expiresAt: session.expiresAt
          },
          message: '该手机号已注册，将直接为您登录'
        };
      }

      // 创建新用户
      user = await db.createTestUser(phoneNumber);

      // 创建登录会话
      const session = await db.createLoginSession(user.id);

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            phoneNumber: user.phone_number
          },
          token: session.token,
          expiresAt: session.expiresAt
        },
        message: '注册成功'
      };
    } catch (error) {
      console.error('注册失败:', error);
      return {
        success: false,
        error: 'REGISTER_FAILED',
        message: '注册失败'
      };
    }
  }
}

// 创建单例实例
const authService = new AuthService();
module.exports = authService;