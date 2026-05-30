# CarWise

新能源车主私人管家 - 一款面向新能源车主的轻量管理工具，帮助用户把购车、提车和早期用车过程中的关键信息记清楚、盯得住。

## 产品特点

- 🚗 **车辆状态管理**：跟踪车辆从下定到用车的完整生命周期
- 💰 **购车报价记录**：清晰记录官方价、优惠、保险、购置税和落地价
- 🎁 **权益管理**：记录赠品、补贴、服务承诺等，并跟踪落实状态
- ✅ **提车验车清单**：按步骤完成验车，不遗漏任何检查项
- 📝 **问题跟踪**：记录问题、拍照留证、跟踪处理进度
- 📊 **用车费用记录**：记录充电、保险、保养、维修等费用
- ⏰ **提醒管理**：设置保养、保险到期等提醒

## 技术栈

- **框架**: React 19
- **语言**: TypeScript
- **构建工具**: Vite
- **UI 图标**: Lucide React
- **测试**: Vitest

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://127.0.0.1:5173 查看应用。

### 构建生产版本

```bash
npm run build
```

### 运行测试

```bash
npm run test
```

### 代码检查

```bash
# 运行 ESLint 检查
npm run lint

# 自动修复 ESLint 问题
npm run lint:fix

# 格式化代码
npm run format

# 检查代码格式
npm run format:check
```

## 项目结构

```
CarWise/
├── src/
│   ├── components/       # 可复用组件
│   ├── data/            # 静态数据
│   ├── model/           # TypeScript 类型定义
│   ├── pages/           # 页面组件
│   ├── store/           # 状态管理
│   ├── utils/           # 工具函数
│   ├── App.tsx          # 应用入口组件
│   ├── main.tsx         # React 入口文件
│   └── styles.css       # 全局样式
├── docs/               # 文档
├── .eslintrc.cjs       # ESLint 配置
├── .prettierrc         # Prettier 配置
├── package.json        # 项目依赖
├── tsconfig.json       # TypeScript 配置
└── vite.config.ts      # Vite 配置
```

## 核心功能页面

1. **首页** - 车辆状态概览和当前最重要的事项
2. **购车** - 报价记录和销售承诺管理
3. **提车** - 验车清单和随车物品确认
4. **用车** - 费用记录和提醒管理
5. **档案** - 车辆信息和完整时间线
6. **权益** - 赠品、补贴等权益管理

## 设计规范

项目遵循详细的视觉设计规范，详见 [Visual-Style-Guide.md](./Visual-Style-Guide.md)。

设计原则：
- 可靠：重要状态明确，不制造紧张感
- 清楚：一屏能判断当前最该处理什么
- 有秩序：信息分类清晰展示
- 轻专业：像认真做事的工具，不像复杂后台
- 克制科技感：有新能源车气质，但不做发光、炫技效果

## 产品需求

详细的产品需求文档请查看 [PRD-CarWise-MVP.md](./PRD-CarWise-MVP.md)。

## 开发指南

### 代码风格

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 组件命名使用 PascalCase
- 文件命名使用 PascalCase（组件）或 camelCase（工具函数）

### 提交代码前

请确保运行以下命令：

```bash
npm run lint
npm run format
npm run test
```

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 许可证

本项目仅供学习和个人使用。

## 联系方式

如有问题或建议，欢迎反馈！
