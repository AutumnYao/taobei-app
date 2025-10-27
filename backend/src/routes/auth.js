const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// 发送验证码
router.post('/send-verification-code', authController.sendVerificationCode);

// 短信登录
router.post('/sms-login', authController.smsLogin);

// 密码登录
router.post('/password-login', authController.passwordLogin);

// 用户注册
router.post('/register', authController.register);

module.exports = router;