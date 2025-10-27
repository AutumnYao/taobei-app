const express = require('express');
const authService = require('../services/authService');

const router = express.Router();

// POST /api/auth/send-code - 发送验证码
router.post('/send-code', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // 验证请求参数
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_PHONE_NUMBER',
        message: '手机号不能为空'
      });
    }

    // 调用认证服务发送验证码
    const result = await authService.sendVerificationCode(phoneNumber);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      // 根据错误类型返回相应的状态码
      let statusCode = 500;
      if (result.error === 'INVALID_PHONE_FORMAT') {
        statusCode = 400;
      } else if (result.error === 'RATE_LIMIT_EXCEEDED') {
        statusCode = 429;
      }
      return res.status(statusCode).json(result);
    }
  } catch (error) {
    console.error('发送验证码接口错误:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
});

// POST /api/auth/login - 用户登录
router.post('/login', async (req, res) => {
  try {
    const { phoneNumber, verificationCode } = req.body;

    // 验证请求参数
    if (!phoneNumber || !verificationCode) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_PARAMETERS',
        message: '手机号和验证码不能为空'
      });
    }

    // 调用认证服务进行登录
    const result = await authService.login(phoneNumber, verificationCode);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      // 根据错误类型返回相应的状态码
      let statusCode = 400;
      if (result.error === 'USER_NOT_REGISTERED') {
        statusCode = 400; // 用户未注册
      } else if (result.error === 'INVALID_OR_EXPIRED_CODE') {
        statusCode = 400; // 验证码错误或过期
      } else if (result.error === 'INVALID_PHONE_FORMAT') {
        statusCode = 400; // 手机号格式错误
      } else {
        statusCode = 500; // 其他服务器错误
      }
      
      return res.status(statusCode).json(result);
    }
  } catch (error) {
    console.error('登录接口错误:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
});

// POST /api/auth/register - 用户注册
router.post('/register', async (req, res) => {
  try {
    const { phoneNumber, verificationCode } = req.body;

    // 验证请求参数
    if (!phoneNumber || !verificationCode) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_PARAMETERS',
        message: '手机号和验证码不能为空'
      });
    }

    // 调用认证服务进行注册
    const result = await authService.register(phoneNumber, verificationCode);

    if (result.success) {
      return res.status(201).json(result);
    } else {
      // 根据错误类型返回相应的状态码
      let statusCode = 400;
      if (result.error === 'USER_ALREADY_EXISTS') {
        statusCode = 409; // 用户已存在
      } else if (result.error === 'INVALID_OR_EXPIRED_CODE') {
        statusCode = 400; // 验证码错误或过期
      } else if (result.error === 'INVALID_PHONE_FORMAT') {
        statusCode = 400; // 手机号格式错误
      } else {
        statusCode = 500; // 其他服务器错误
      }
      
      return res.status(statusCode).json(result);
    }
  } catch (error) {
    console.error('注册接口错误:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
});

module.exports = router;