const jwt = require('jsonwebtoken');
const dbService = require('../database/dbService');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 生成6位随机验证码
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 验证手机号格式
const validatePhoneNumber = (phoneNumber) => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phoneNumber);
};

// 生成JWT令牌
const generateToken = (userId, phoneNumber) => {
  return jwt.sign(
    { userId, phoneNumber },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const authService = {
  // 发送验证码
  sendVerificationCode: async (phoneNumber) => {
    try {
      // 验证手机号格式
      if (!validatePhoneNumber(phoneNumber)) {
        throw new Error('请输入正确的手机号码');
      }

      // 生成验证码
      const code = generateVerificationCode();
      console.log(`验证码: ${code} (发送到 ${phoneNumber})`);

      // 设置过期时间（60秒后）
      const expiresAt = new Date(Date.now() + 60 * 1000).toISOString();

      // 保存到数据库
      await dbService.saveVerificationCode(phoneNumber, code, expiresAt);

      return {
        message: '验证码已发送',
        countdown: 60
      };
    } catch (error) {
      throw error;
    }
  },

  // 短信登录
  smsLogin: async (phoneNumber, verificationCode) => {
    try {
      // 验证验证码
      const isValidCode = await dbService.verifyCode(phoneNumber, verificationCode);
      
      if (!isValidCode) {
        // 检查是否是验证码错误还是过期
        throw new Error('验证码错误');
      }

      // 查找用户
      let user = await dbService.findUserByPhone(phoneNumber);
      
      if (!user) {
        // 用户不存在，自动注册
        user = await dbService.createUser({
          phoneNumber,
          loginMethod: 'sms'
        });
        
        // 生成JWT令牌
        const token = generateToken(user.id, phoneNumber);
        
        return {
          userId: user.id,
          token,
          message: '该手机号未注册，已自动完成注册',
          statusCode: 201
        };
      } else {
        // 用户存在，直接登录
        await dbService.updateUserLoginMethod(phoneNumber, 'sms');
        
        // 生成JWT令牌
        const token = generateToken(user.id, phoneNumber);
        
        return {
          userId: user.id,
          token,
          message: '登录成功'
        };
      }
    } catch (error) {
      throw error;
    }
  },

  // 密码登录
  passwordLogin: async (account, password, captcha) => {
    try {
      // 检查账号是否被锁定
      const isLocked = await dbService.isAccountLocked(account);
      if (isLocked) {
        throw new Error('账号暂时不可登录，请稍后再试或联系客服');
      }

      // 查找用户
      const user = await dbService.findUserByPhone(account);
      if (!user) {
        await dbService.updateLoginAttempts(account, false);
        throw new Error('该账号不存在，请检查或前往注册');
      }

      // 检查登录尝试次数
      const attempts = await dbService.getLoginAttempts(account);
      if (attempts >= 3 && !captcha) {
        const error = new Error('需要图形验证码');
        error.requireCaptcha = true;
        error.statusCode = 428;
        throw error;
      }

      // 验证密码
      const isValidPassword = await dbService.validatePassword(account, password);
      if (!isValidPassword) {
        const result = await dbService.updateLoginAttempts(account, false);
        if (result.locked) {
          throw new Error('账号暂时不可登录，请稍后再试或联系客服');
        }
        throw new Error('账号或密码错误');
      }

      // 登录成功
      await dbService.updateLoginAttempts(account, true);
      await dbService.updateUserLoginMethod(account, 'password');

      // 生成JWT令牌
      const token = generateToken(user.id, account);

      return {
        userId: user.id,
        token,
        message: '登录成功'
      };
    } catch (error) {
      throw error;
    }
  },

  // 用户注册
  register: async (phoneNumber, verificationCode, password, confirmPassword, agreeTerms) => {
    try {
      // 验证验证码
      const isValidCode = await dbService.verifyCode(phoneNumber, verificationCode);
      if (!isValidCode) {
        throw new Error('验证码错误');
      }

      // 检查手机号是否已注册
      const existingUser = await dbService.findUserByPhone(phoneNumber);
      if (existingUser) {
        // 已注册用户直接登录
        await dbService.updateUserLoginMethod(phoneNumber, 'password');
        const token = generateToken(existingUser.id, phoneNumber);
        
        return {
          userId: existingUser.id,
          token,
          isExistingUser: true
        };
      }

      // 创建新用户
      const user = await dbService.createUser({
        phoneNumber,
        password,
        loginMethod: 'password'
      });

      // 生成JWT令牌
      const token = generateToken(user.id, phoneNumber);

      return {
        userId: user.id,
        token,
        isExistingUser: false
      };
    } catch (error) {
      throw error;
    }
  }
};

module.exports = authService;