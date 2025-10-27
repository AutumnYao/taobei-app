const request = require('supertest');
const app = require('../../src/app');

describe('Authentication Routes', () => {
  describe('POST /api/auth/send-verification-code', () => {
    it('应该验证手机号格式是否正确', async () => {
      const response = await request(app)
        .post('/api/auth/send-verification-code')
        .send({ phoneNumber: 'invalid-phone' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('请输入正确的手机号码');
    });

    it('应该生成6位随机验证码并打印到控制台', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      const response = await request(app)
        .post('/api/auth/send-verification-code')
        .send({ phoneNumber: '13800138000' });

      expect(response.status).toBe(200);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/验证码: \d{6}/));
      
      consoleSpy.mockRestore();
    });

    it('应该将验证码保存到数据库，有效期60秒', async () => {
      const response = await request(app)
        .post('/api/auth/send-verification-code')
        .send({ phoneNumber: '13800138000' });

      expect(response.status).toBe(200);
      // 验证数据库中是否保存了验证码
      // TODO: 添加数据库验证逻辑
    });

    it('应该返回成功响应和倒计时时间', async () => {
      const response = await request(app)
        .post('/api/auth/send-verification-code')
        .send({ phoneNumber: '13800138000' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('验证码已发送');
      expect(response.body.countdown).toBe(60);
    });

    it('应该处理请求过于频繁的情况', async () => {
      // 先发送一次验证码
      await request(app)
        .post('/api/auth/send-verification-code')
        .send({ phoneNumber: '13800138000' });

      // 立即再次发送
      const response = await request(app)
        .post('/api/auth/send-verification-code')
        .send({ phoneNumber: '13800138000' });

      expect(response.status).toBe(429);
      expect(response.body.error).toBe('请求过于频繁，请稍后再试');
    });
  });

  describe('POST /api/auth/sms-login', () => {
    it('应该验证验证码是否正确且未过期', async () => {
      const response = await request(app)
        .post('/api/auth/sms-login')
        .send({ 
          phoneNumber: '13800138000',
          verificationCode: 'wrong-code'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('验证码错误');
    });

    it('应该处理验证码已过期的情况', async () => {
      // 模拟过期的验证码
      const response = await request(app)
        .post('/api/auth/sms-login')
        .send({ 
          phoneNumber: '13800138000',
          verificationCode: '123456'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('验证码已过期，请重新获取');
    });

    it('应该检查手机号是否已注册 - 未注册用户自动完成注册', async () => {
      // 先发送验证码
      await request(app)
        .post('/api/auth/send-verification-code')
        .send({ phoneNumber: '13900139000' });

      const response = await request(app)
        .post('/api/auth/sms-login')
        .send({ 
          phoneNumber: '13900139000',
          verificationCode: '123456' // 假设这是正确的验证码
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('该手机号未注册，已自动完成注册');
      expect(response.body.userId).toBeDefined();
      expect(response.body.token).toBeDefined();
    });

    it('应该处理已注册用户直接登录', async () => {
      // 假设用户已存在
      const response = await request(app)
        .post('/api/auth/sms-login')
        .send({ 
          phoneNumber: '13800138000',
          verificationCode: '123456'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('登录成功');
      expect(response.body.userId).toBeDefined();
      expect(response.body.token).toBeDefined();
    });

    it('应该返回JWT令牌和用户信息', async () => {
      const response = await request(app)
        .post('/api/auth/sms-login')
        .send({ 
          phoneNumber: '13800138000',
          verificationCode: '123456'
        });

      expect(response.body.userId).toMatch(/^[a-f\d-]{36}$/i); // UUID格式
      expect(response.body.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/); // JWT格式
    });
  });

  describe('POST /api/auth/password-login', () => {
    it('应该验证账号是否存在', async () => {
      const response = await request(app)
        .post('/api/auth/password-login')
        .send({ 
          account: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('该账号不存在，请检查或前往注册');
    });

    it('应该验证密码是否正确', async () => {
      const response = await request(app)
        .post('/api/auth/password-login')
        .send({ 
          account: '13800138000',
          password: 'wrong-password'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('账号或密码错误');
    });

    it('应该在连续3次失败后要求图形验证码', async () => {
      // 连续3次错误登录
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/auth/password-login')
          .send({ 
            account: '13800138000',
            password: 'wrong-password'
          });
      }

      const response = await request(app)
        .post('/api/auth/password-login')
        .send({ 
          account: '13800138000',
          password: 'wrong-password'
        });

      expect(response.status).toBe(428);
      expect(response.body.error).toBe('需要图形验证码');
      expect(response.body.requireCaptcha).toBe(true);
    });

    it('应该在多次失败后锁定账号', async () => {
      // 模拟多次失败登录
      const response = await request(app)
        .post('/api/auth/password-login')
        .send({ 
          account: '13800138000',
          password: 'wrong-password'
        });

      expect(response.status).toBe(423);
      expect(response.body.error).toBe('账号暂时不可登录，请稍后再试或联系客服');
    });

    it('应该在成功登录时返回JWT令牌', async () => {
      const response = await request(app)
        .post('/api/auth/password-login')
        .send({ 
          account: '13800138000',
          password: 'correct-password'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('登录成功');
      expect(response.body.userId).toBeDefined();
      expect(response.body.token).toBeDefined();
    });
  });

  describe('POST /api/auth/register', () => {
    it('应该验证验证码是否正确且未过期', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ 
          phoneNumber: '13800138000',
          verificationCode: 'wrong-code',
          password: 'password123',
          confirmPassword: 'password123',
          agreeTerms: true
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('验证码错误');
    });

    it('应该验证两次密码输入是否一致', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ 
          phoneNumber: '13800138000',
          verificationCode: '123456',
          password: 'password123',
          confirmPassword: 'different-password',
          agreeTerms: true
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('两次输入的密码不一致');
    });

    it('应该验证是否同意用户协议', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ 
          phoneNumber: '13800138000',
          verificationCode: '123456',
          password: 'password123',
          confirmPassword: 'password123',
          agreeTerms: false
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('请同意用户协议');
    });

    it('应该检查手机号是否已注册 - 已注册用户直接登录', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ 
          phoneNumber: '13800138000', // 假设已注册
          verificationCode: '123456',
          password: 'password123',
          confirmPassword: 'password123',
          agreeTerms: true
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('该手机号已注册，将直接为您登录');
      expect(response.body.userId).toBeDefined();
      expect(response.body.token).toBeDefined();
    });

    it('应该为未注册用户完成注册', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ 
          phoneNumber: '13700137000', // 使用不同的手机号确保未注册
          verificationCode: '123456',
          password: 'password123',
          confirmPassword: 'password123',
          agreeTerms: true
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('注册成功');
      expect(response.body.userId).toBeDefined();
      expect(response.body.token).toBeDefined();
    });
  });
});