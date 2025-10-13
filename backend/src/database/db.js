// 使用内存数据库模拟，避免sqlite3编译问题
const crypto = require('crypto');

class Database {
  constructor() {
    // 使用内存存储模拟数据库
    this.users = new Map();
    this.verificationCodes = new Map();
    this.loginSessions = new Map();
    this.init();
  }

  init() {
    // 内存数据库已初始化，无需创建表
    console.log('内存数据库初始化完成');
  }

  // DB-FindUserByPhone: 根据手机号查找用户记录
  async findUserByPhone(phoneNumber) {
    try {
      const user = this.users.get(phoneNumber);
      return user || null;
    } catch (error) {
      console.error('查找用户失败:', error);
      return null;
    }
  }

  // DB-SaveVerificationCode: 保存验证码到数据库
  async saveVerificationCode(phoneNumber, code) {
    try {
      // 检查是否在60秒内已经发送过验证码
      const codes = this.verificationCodes.get(phoneNumber) || [];
      const now = new Date();
      const recentCode = codes.find(c => 
        (now - c.createdAt) < 60000 // 60秒内
      );

      if (recentCode) {
        // 如果60秒内已发送过，返回特殊错误标识
        throw new Error('RATE_LIMIT_EXCEEDED');
      }

      // 清除该手机号的旧验证码
      this.verificationCodes.set(phoneNumber, []);

      // 设置5分钟后过期
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      
      // 保存新验证码
      const codeData = {
        id: Date.now(),
        phoneNumber,
        code,
        expiresAt,
        used: false,
        createdAt: new Date()
      };
      
      const newCodes = this.verificationCodes.get(phoneNumber) || [];
      newCodes.push(codeData);
      this.verificationCodes.set(phoneNumber, newCodes);

      return true;
    } catch (error) {
      console.error('保存验证码失败:', error);
      if (error.message === 'RATE_LIMIT_EXCEEDED') {
        throw error; // 重新抛出频率限制错误
      }
      return false;
    }
  }

  // DB-VerifyCode: 验证验证码
  async verifyCode(phoneNumber, code) {
    try {
      const codes = this.verificationCodes.get(phoneNumber) || [];
      const now = new Date();
      
      // 查找有效的验证码
      const validCodeIndex = codes.findIndex(c => 
        c.code === code && 
        !c.used && 
        c.expiresAt > now
      );
      
      if (validCodeIndex === -1) {
        return false;
      }
      
      // 删除验证码（而不是标记为已使用）
      codes.splice(validCodeIndex, 1);
      this.verificationCodes.set(phoneNumber, codes);
      
      // 确保用户存在
      let user = this.users.get(phoneNumber);
      if (!user) {
        user = {
          id: Date.now(),
          phone_number: phoneNumber,
          created_at: new Date()
        };
        this.users.set(phoneNumber, user);
      }
      
      return true;
    } catch (error) {
      console.error('验证码验证失败:', error);
      return false;
    }
  }

  // 创建登录会话
  async createLoginSession(userId) {
    try {
      // 验证用户ID
      if (!userId || typeof userId !== 'number') {
        throw new Error('Invalid user ID');
      }
      
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7天后过期
      
      const session = {
        id: Date.now(),
        userId: userId,  // 使用userId而不是user_id
        token,
        expiresAt: expiresAt.toISOString(),
        created_at: new Date()
      };
      
      this.loginSessions.set(token, session);
      
      return session;
    } catch (error) {
      console.error('创建登录会话失败:', error);
      throw error;
    }
  }

  close() {
    // 内存数据库无需关闭
    console.log('内存数据库连接已关闭');
  }

  async clearTestData() {
    // 清空内存数据
    this.users.clear();
    this.verificationCodes.clear();
    this.loginSessions.clear();
  }

  async createTestUser(phoneNumber) {
    const user = {
      id: Date.now(),
      phone_number: phoneNumber,
      created_at: new Date()
    };
    this.users.set(phoneNumber, user);
    return user;
  }

  async simulateTimeExpiry(phoneNumber, minutesAgo) {
    const codes = this.verificationCodes.get(phoneNumber) || [];
    codes.forEach(code => {
      code.expiresAt = new Date(Date.now() - minutesAgo * 60 * 1000);
    });
  }
}

// 创建单例实例
const db = new Database();
module.exports = db;