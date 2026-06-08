# Firebase 配置指南

## 快速开始

### 1. 创建 Firebase 项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击"添加项目"
3. 输入项目名称，点击继续
4. 关闭 Google Analytics（可选），点击创建项目
5. 项目创建完成后，点击"继续"进入项目

### 2. 获取配置信息

1. 在项目概览页面，点击 Web 图标 (`</>`) 添加应用
2. 输入应用昵称，勾选"同时为此项目设置 Firebase Hosting"，点击注册应用
3. 复制显示的配置信息：
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

### 3. 配置环境变量

1. 复制 `.env.example` 为 `.env`
2. 填入你的 Firebase 配置信息：

```bash
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. 启用认证服务

1. 在左侧菜单中，点击"构建" > "Authentication"
2. 点击"开始使用"
3. 在"Sign-in method"标签页，启用：
   - **电子邮件/密码** - 用于邮箱注册登录
   - **Google** - 用于 Google 账号登录
   - **GitHub** - 用于 GitHub 账号登录（可选）

### 5. 启用 Firestore 数据库

1. 在左侧菜单中，点击"构建" > "Firestore Database"
2. 点击"创建数据库"
3. 选择"测试模式"开始（稍后可配置安全规则）
4. 选择一个靠近你的数据中心位置
5. 点击"启用"

### 6. 配置 Firestore 安全规则（生产环境）

在 Firestore 的"规则"标签页，配置以下规则：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 只允许已登录用户访问自己的数据
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 7. 安装依赖

```bash
npm install firebase
```

### 8. 运行应用

```bash
npm run dev
```

## 登录选项

用户可以使用以下方式登录：

1. **邮箱注册/登录** - 输入邮箱和密码
2. **Google 登录** - 使用 Google 账号
3. **GitHub 登录** - 使用 GitHub 账号（可选）

## 数据存储

所有用户数据都会存储在 Firestore 数据库中：
- 集合：`users`
- 文档：`{userId}`
- 数据：`appState` 包含所有应用状态数据

## 故障排除

### 认证失败

- 检查是否已启用对应的登录方式（Authentication > Sign-in method）
- 检查 Firebase 配置是否正确
- 查看浏览器控制台的具体错误信息

### 数据未保存

- 检查 Firestore 数据库是否已启用
- 检查安全规则是否阻止了写入
- 查看浏览器控制台的网络请求

### CORS 错误

如果遇到 CORS 错误，检查：
- Firebase 项目配置是否正确
- Firestore 数据库是否在正确的区域
