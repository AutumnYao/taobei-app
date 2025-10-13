const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

class Database {
  constructor() {
    const dbPath = process.env.NODE_ENV === 'test' 
      ? ':memory:' 
      : path.join(__dirname, '../../data/app.db');
    
    this.db = new sqlite3.Database(dbPath);
    this.init();
  }

  init() {
    // TODO: 初始化数据库表结构
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createVerificationCodesTable = `
      CREATE TABLE IF NOT EXISTS verification_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createLoginSessionsTable = `
      CREATE TABLE IF NOT EXISTS login_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `;

    this.db.serialize(() => {
      this.db.run(createUsersTable);
      this.db.run(createVerificationCodesTable);
      this.db.run(createLoginSessionsTable);
      
      // 插入测试用户
      this.db.run(`
        INSERT OR IGNORE INTO users (phone_number) VALUES ('13800138000')
      `, (err) => {
        if (err) {
          console.error('插入测试用户失败:', err);
        } else {
          console.log('测试用户已准备就绪: 13800138000');
        }
      });
      
      // 插入测试用例中使用的用户
      this.db.run(`
        INSERT OR IGNORE INTO users (phone_number) VALUES ('13812345680')
      `, (err) => {
        if (err) {
          console.error('插入测试用户失败:', err);
        } else {
          console.log('测试用户已准备就绪: 13812345680');
        }
      });
      
      // 插入更多测试用户，用于错误验证码测试
      this.db.run(`
        INSERT OR IGNORE INTO users (phone_number) VALUES ('13812345682')
      `, (err) => {
        if (err) {
          console.error('插入测试用户失败:', err);
        } else {
          console.log('测试用户已准备就绪: 13812345682');
        }
      });
      
      // 插入过期验证码测试用户
      this.db.run(`
        INSERT OR IGNORE INTO users (phone_number) VALUES ('13812345683')
      `, (err) => {
        if (err) {
          console.error('插入测试用户失败:', err);
        } else {
          console.log('测试用户已准备就绪: 13812345683');
        }
      });
    });
  }

  // 将回调函数转换为Promise
  runQuery(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  getQuery(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // DB-FindUserByPhone: 根据手机号查找用户记录
  async findUserByPhone(phoneNumber) {
    try {
      const user = await this.getQuery(
        'SELECT * FROM users WHERE phone_number = ?',
        [phoneNumber]
      );
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
      const recentCode = await this.getQuery(
        'SELECT * FROM verification_codes WHERE phone_number = ? AND created_at > datetime("now", "-60 seconds") ORDER BY created_at DESC LIMIT 1',
        [phoneNumber]
      );

      if (recentCode) {
        // 如果60秒内已发送过，返回特殊错误标识
        throw new Error('RATE_LIMIT_EXCEEDED');
      }

      // 先删除该手机号的旧验证码
      await this.runQuery(
        'DELETE FROM verification_codes WHERE phone_number = ?',
        [phoneNumber]
      );

      // 设置5分钟后过期
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      
      // 插入新验证码
      await this.runQuery(
        'INSERT INTO verification_codes (phone_number, code, expires_at) VALUES (?, ?, ?)',
        [phoneNumber, code, expiresAt]
      );

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
      const record = await this.getQuery(
        'SELECT * FROM verification_codes WHERE phone_number = ? AND code = ? AND expires_at > datetime("now")',
        [phoneNumber, code]
      );

      if (record) {
        // 验证成功后删除验证码
        await this.runQuery(
          'DELETE FROM verification_codes WHERE id = ?',
          [record.id]
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error('验证码验证失败:', error);
      return false;
    }
  }

  // DB-CreateLoginSession: 创建登录会话
  async createLoginSession(userId) {
    try {
      // 生成唯一的会话令牌
      const token = crypto.randomBytes(32).toString('hex');
      
      // 设置7天后过期
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      
      // 插入会话记录
      const result = await this.runQuery(
        'INSERT INTO login_sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt]
      );

      return {
        id: result.id,
        userId: userId,
        token: token,
        expiresAt: expiresAt
      };
    } catch (error) {
      console.error('创建登录会话失败:', error);
      throw error;
    }
  }

  close() {
    this.db.close();
  }

  // 测试辅助方法
  async clearTestData() {
    try {
      await this.runQuery('DELETE FROM verification_codes');
      await this.runQuery('DELETE FROM login_sessions');
      // 不删除用户表，因为有预设的测试用户
    } catch (error) {
      console.error('清理测试数据失败:', error);
      throw error;
    }
  }

  async createTestUser(phoneNumber) {
    try {
      const result = await this.runQuery(
        'INSERT OR IGNORE INTO users (phone_number) VALUES (?)',
        [phoneNumber]
      );
      return result;
    } catch (error) {
      console.error('创建测试用户失败:', error);
      throw error;
    }
  }

  // 模拟时间过期（测试辅助方法）
  async simulateTimeExpiry(phoneNumber, minutesAgo) {
    try {
      const expiredTime = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
      await this.runQuery(
        'UPDATE verification_codes SET expires_at = ? WHERE phone_number = ?',
        [expiredTime, phoneNumber]
      );
    } catch (error) {
      console.error('模拟时间过期失败:', error);
      throw error;
    }
  }
}

// 创建单例实例
const db = new Database();
module.exports = db;