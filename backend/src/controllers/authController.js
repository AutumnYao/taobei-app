const authService = require('../services/authService');

const authController = {
  // 发送验证码
  sendVerificationCode: async (req, res) => {
    try {
      const { phoneNumber } = req.body;

      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          message: '手机号不能为空'
        });
      }

      const result = await authService.sendVerificationCode(phoneNumber);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // 短信登录
  smsLogin: async (req, res) => {
    try {
      const { phoneNumber, verificationCode } = req.body;

      if (!phoneNumber || !verificationCode) {
        return res.status(400).json({
          success: false,
          message: '手机号和验证码不能为空'
        });
      }

      const result = await authService.smsLogin(phoneNumber, verificationCode);
      
      const statusCode = result.statusCode || 200;
      res.status(statusCode).json({
        success: true,
        data: {
          userId: result.userId,
          token: result.token,
          message: result.message
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // 密码登录
  passwordLogin: async (req, res) => {
    try {
      const { account, password, captcha } = req.body;

      if (!account || !password) {
        return res.status(400).json({
          success: false,
          message: '账号和密码不能为空'
        });
      }

      const result = await authService.passwordLogin(account, password, captcha);
      
      res.status(200).json({
        success: true,
        data: {
          userId: result.userId,
          token: result.token,
          message: result.message
        }
      });
    } catch (error) {
      const statusCode = error.statusCode || 400;
      const response = {
        success: false,
        message: error.message
      };

      // 如果需要验证码，添加额外信息
      if (error.requireCaptcha) {
        response.requireCaptcha = true;
      }

      res.status(statusCode).json(response);
    }
  },

  // 用户注册
  register: async (req, res) => {
    try {
      const { phoneNumber, verificationCode, password, confirmPassword, agreeTerms } = req.body;

      // 验证必填字段
      if (!phoneNumber || !verificationCode || !password || !confirmPassword) {
        return res.status(400).json({
          success: false,
          error: '所有字段都不能为空'
        });
      }

      // 验证密码一致性
      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: '两次输入的密码不一致'
        });
      }

      // 验证是否同意用户协议
      if (!agreeTerms) {
        return res.status(400).json({
          success: false,
          error: '请同意用户协议'
        });
      }

      const result = await authService.register(phoneNumber, verificationCode, password, confirmPassword, agreeTerms);
      
      // 如果是已注册用户，返回409状态码
      if (result.isExistingUser) {
        return res.status(409).json({
          success: true,
          message: '该手机号已注册，将直接为您登录',
          userId: result.userId,
          token: result.token
        });
      }

      // 新用户注册成功，返回201状态码
      res.status(201).json({
        success: true,
        message: '注册成功',
        userId: result.userId,
        token: result.token
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = authController;