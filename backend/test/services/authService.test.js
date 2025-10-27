const authService = require('../../src/services/authService');

describe('AuthService', () => {
  describe('sendVerificationCode', () => {
    it('应该生成6位数字验证码', async () => {
      const phoneNumber = '13800138000';
      const result = await authService.sendVerificationCode(phoneNumber);
      
      expect(result.success).toBe(true);
      expect(result.code).toMatch(/^\d{6}$/);
    });

    it('应该将验证码保存到数据库', async () => {
      const phoneNumber = '13800138000';
      const result = await authService.sendVerificationCode(phoneNumber);
      
      expect(result.success).toBe(true);
      // TODO: 验证数据库中是否保存了验证码
    });

    it('应该设置验证码60秒有效期', async () => {
      const phoneNumber = '13800138000';
      const result = await authService.sendVerificationCode(phoneNumber);
      
      expect(result.success).toBe(true);
      expect(result.expiresIn).toBe(60);
    });
  });

  describe('smsLogin', () => {
    it('应该验证验证码的正确性', async () => {
      const phoneNumber = '13800138000';
      const wrongCode = '000000';
      
      const result = await authService.smsLogin(phoneNumber, wrongCode);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('验证码错误');
    });

    it('应该检查验证码是否过期', async () => {
      const phoneNumber = '13800138000';
      const expiredCode = '123456';
      
      const result = await authService.smsLogin(phoneNumber, expiredCode);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('验证码已过期，请重新获取');
    });

    it('应该为未注册用户自动注册', async () => {
      const phoneNumber = '13900139000'; // 新用户
      const validCode = '123456';
      
      const result = await authService.smsLogin(phoneNumber, validCode);
      
      expect(result.success).toBe(true);
      expect(result.isNewUser).toBe(true);
      expect(result.userId).toBeDefined();
      expect(result.token).toBeDefined();
    });

    it('应该为已注册用户直接登录', async () => {
      const phoneNumber = '13800138000'; // 已存在用户
      const validCode = '123456';
      
      const result = await authService.smsLogin(phoneNumber, validCode);
      
      expect(result.success).toBe(true);
      expect(result.isNewUser).toBe(false);
      expect(result.userId).toBeDefined();
      expect(result.token).toBeDefined();
    });
  });

  describe('passwordLogin', () => {
    it('应该验证用户是否存在', async () => {
      const account = 'nonexistent@example.com';
      const password = 'password123';
      
      const result = await authService.passwordLogin(account, password);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('该账号不存在，请检查或前往注册');
    });

    it('应该验证密码正确性', async () => {
      const account = '13800138000';
      const wrongPassword = 'wrong-password';
      
      const result = await authService.passwordLogin(account, wrongPassword);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('账号或密码错误');
    });

    it('应该跟踪登录失败次数', async () => {
      const account = '13800138000';
      const wrongPassword = 'wrong-password';
      
      // 连续失败登录
      for (let i = 0; i < 3; i++) {
        await authService.passwordLogin(account, wrongPassword);
      }
      
      const result = await authService.passwordLogin(account, wrongPassword);
      
      expect(result.requireCaptcha).toBe(true);
    });

    it('应该在成功登录时返回用户信息和令牌', async () => {
      const account = '13800138000';
      const correctPassword = 'correct-password';
      
      const result = await authService.passwordLogin(account, correctPassword);
      
      expect(result.success).toBe(true);
      expect(result.userId).toBeDefined();
      expect(result.token).toBeDefined();
    });
  });

  describe('register', () => {
    it('应该验证验证码', async () => {
      const userData = {
        phoneNumber: '13800138000',
        verificationCode: 'wrong-code',
        password: 'password123',
        confirmPassword: 'password123',
        agreeTerms: true
      };
      
      const result = await authService.register(userData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('验证码错误');
    });

    it('应该验证密码一致性', async () => {
      const userData = {
        phoneNumber: '13800138000',
        verificationCode: '123456',
        password: 'password123',
        confirmPassword: 'different-password',
        agreeTerms: true
      };
      
      const result = await authService.register(userData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('两次输入的密码不一致');
    });

    it('应该验证用户协议同意状态', async () => {
      const userData = {
        phoneNumber: '13800138000',
        verificationCode: '123456',
        password: 'password123',
        confirmPassword: 'password123',
        agreeTerms: false
      };
      
      const result = await authService.register(userData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('请同意用户协议');
    });

    it('应该检查用户是否已存在', async () => {
      const userData = {
        phoneNumber: '13800138000', // 已存在用户
        verificationCode: '123456',
        password: 'password123',
        confirmPassword: 'password123',
        agreeTerms: true
      };
      
      const result = await authService.register(userData);
      
      expect(result.success).toBe(true);
      expect(result.isExistingUser).toBe(true);
      expect(result.message).toBe('该手机号已注册，将直接为您登录');
    });

    it('应该为新用户创建账号', async () => {
      const userData = {
        phoneNumber: '13900139000', // 新用户
        verificationCode: '123456',
        password: 'password123',
        confirmPassword: 'password123',
        agreeTerms: true
      };
      
      const result = await authService.register(userData);
      
      expect(result.success).toBe(true);
      expect(result.isExistingUser).toBe(false);
      expect(result.userId).toBeDefined();
      expect(result.token).toBeDefined();
    });
  });
});