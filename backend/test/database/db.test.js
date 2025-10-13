const db = require('../../src/database/db');

describe('Database Operations', () => {
  beforeEach(async () => {
    // 每个测试前清理数据库
    await db.clearTestData();
  });

  describe('findUserByPhone', () => {
    // 基于DB-FindUserByPhone的acceptanceCriteria
    it('应该找到存在的用户', async () => {
      // 先创建一个测试用户
      await db.createTestUser('13812345678');
      
      const user = await db.findUserByPhone('13812345678');
      
      expect(user).toBeDefined();
      expect(user.phoneNumber).toBe('13812345678');
      expect(user.id).toBeDefined();
    });

    it('应该对不存在的用户返回null', async () => {
      const user = await db.findUserByPhone('13812345679');
      
      expect(user).toBeNull();
    });

    it('应该正确处理无效的手机号格式', async () => {
      const user = await db.findUserByPhone('invalid');
      
      expect(user).toBeNull();
    });
  });

  describe('saveVerificationCode', () => {
    // 基于DB-SaveVerificationCode的acceptanceCriteria
    it('应该成功保存验证码', async () => {
      const result = await db.saveVerificationCode('13812345678', '123456');
      
      expect(result).toBe(true);
    });

    it('应该覆盖同一手机号的旧验证码', async () => {
      // 保存第一个验证码
      await db.saveVerificationCode('13812345678', '123456');
      
      // 等待1秒，避免频率限制
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // 保存第二个验证码
      const result = await db.saveVerificationCode('13812345678', '654321');
      
      expect(result).toBe(true);
      
      // 验证只有最新的验证码有效
      const isValid = await db.verifyCode('13812345678', '654321');
      expect(isValid).toBe(true);
      
      const isOldValid = await db.verifyCode('13812345678', '123456');
      expect(isOldValid).toBe(false);
    });

    it('应该设置5分钟的过期时间', async () => {
      await db.saveVerificationCode('13812345678', '123456');
      
      // 模拟时间过期（这需要数据库支持时间模拟）
      await db.simulateTimeExpiry('13812345678', 6); // 6分钟后
      
      const isValid = await db.verifyCode('13812345678', '123456');
      expect(isValid).toBe(false);
    });
  });

  describe('verifyCode', () => {
    // 基于DB-VerifyCode的acceptanceCriteria
    it('应该验证正确的验证码', async () => {
      await db.saveVerificationCode('13812345678', '123456');
      
      const isValid = await db.verifyCode('13812345678', '123456');
      
      expect(isValid).toBe(true);
    });

    it('应该拒绝错误的验证码', async () => {
      await db.saveVerificationCode('13812345678', '123456');
      
      const isValid = await db.verifyCode('13812345678', '654321');
      
      expect(isValid).toBe(false);
    });

    it('应该拒绝过期的验证码', async () => {
      await db.saveVerificationCode('13812345678', '123456');
      
      // 模拟时间过期
      await db.simulateTimeExpiry('13812345678', 6); // 6分钟后
      
      const isValid = await db.verifyCode('13812345678', '123456');
      
      expect(isValid).toBe(false);
    });

    it('应该拒绝不存在的手机号', async () => {
      const isValid = await db.verifyCode('13812345679', '123456');
      
      expect(isValid).toBe(false);
    });

    it('验证成功后应该删除验证码', async () => {
      await db.saveVerificationCode('13812345678', '123456');
      
      // 第一次验证
      const firstVerify = await db.verifyCode('13812345678', '123456');
      expect(firstVerify).toBe(true);
      
      // 第二次验证应该失败（验证码已被删除）
      const secondVerify = await db.verifyCode('13812345678', '123456');
      expect(secondVerify).toBe(false);
    });
  });

  describe('createLoginSession', () => {
    // 基于DB-CreateLoginSession的acceptanceCriteria
    it('应该为有效用户创建登录会话', async () => {
      // 先创建测试用户
      const user = await db.createTestUser('13812345678');
      
      const session = await db.createLoginSession(user.id);
      
      expect(session).toBeDefined();
      expect(session.token).toBeDefined();
      expect(session.userId).toBe(user.id);
      expect(session.expiresAt).toBeDefined();
      expect(typeof session.token).toBe('string');
      expect(session.token.length).toBeGreaterThan(0);
    });

    it('应该生成唯一的会话令牌', async () => {
      const user = await db.createTestUser('13812345678');
      
      const session1 = await db.createLoginSession(user.id);
      const session2 = await db.createLoginSession(user.id);
      
      expect(session1.token).not.toBe(session2.token);
    });

    it('应该设置7天的过期时间', async () => {
      const user = await db.createTestUser('13812345678');
      
      const session = await db.createLoginSession(user.id);
      
      const now = new Date();
      const expiresAt = new Date(session.expiresAt);
      const diffDays = (expiresAt - now) / (1000 * 60 * 60 * 24);
      
      expect(diffDays).toBeCloseTo(7, 1); // 允许1天的误差
    });

    it('应该拒绝无效的用户ID', async () => {
      await expect(db.createLoginSession('invalid-user-id')).rejects.toThrow();
    });
  });
});