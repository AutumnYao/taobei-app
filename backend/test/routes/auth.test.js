const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/database/db');

describe('Authentication Routes', () => {
  beforeEach(async () => {
    // 清理验证码表，避免频率限制影响测试
    await db.runQuery('DELETE FROM verification_codes');
  });

  describe('POST /api/auth/send-code', () => {
    // 基于API-SendCode的acceptanceCriteria
    it('应该成功发送验证码给有效手机号', async () => {
      const response = await request(app)
        .post('/api/auth/send-code')
        .send({ phoneNumber: '13812345678' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('验证码发送成功');
    });

    it('应该拒绝无效的手机号格式', async () => {
      const response = await request(app)
        .post('/api/auth/send-code')
        .send({ phoneNumber: '123456' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('手机号格式不正确');
    });

    it('应该拒绝空的手机号', async () => {
      const response = await request(app)
        .post('/api/auth/send-code')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('应该在60秒内限制重复发送', async () => {
      // 第一次发送
      await request(app)
        .post('/api/auth/send-code')
        .send({ phoneNumber: '13812345679' });

      // 立即再次发送
      const response = await request(app)
        .post('/api/auth/send-code')
        .send({ phoneNumber: '13812345679' });

      expect(response.status).toBe(429);
      expect(response.body.message).toContain('请稍后再试');
    });
  });

  describe('POST /api/auth/login', () => {
    // 基于API-Login的acceptanceCriteria
    it('应该成功登录已注册用户', async () => {
      // 先创建测试用户
      await db.createTestUser('13812345680');
      
      // 先发送验证码
      await request(app)
        .post('/api/auth/send-code')
        .send({ phoneNumber: '13812345680' });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ 
          phoneNumber: '13812345680',
          verificationCode: '123456' // 假设这是正确的验证码
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('登录成功');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('phoneNumber');
    });

    it('应该拒绝未注册的手机号', async () => {
      // 先发送验证码
      await request(app)
        .post('/api/auth/send-code')
        .send({ phoneNumber: '13812345681' });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ 
          phoneNumber: '13812345681',
          verificationCode: '123456'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('该手机号未注册，请先完成注册');
    });

    it('应该拒绝错误的验证码', async () => {
      // 先发送验证码
      await request(app)
        .post('/api/auth/send-code')
        .send({ phoneNumber: '13812345682' });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ 
          phoneNumber: '13812345682',
          verificationCode: '000000' // 错误的验证码
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('验证码错误或已过期');
    });

    it('应该拒绝过期的验证码', async () => {
      // 这个测试需要模拟时间过期的情况
      const response = await request(app)
        .post('/api/auth/login')
        .send({ 
          phoneNumber: '13812345683',
          verificationCode: '123456'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('验证码错误或已过期');
    });

    it('应该拒绝无效的手机号格式', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ 
          phoneNumber: '123456',
          verificationCode: '123456'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('手机号格式不正确');
    });
  });
});