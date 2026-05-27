# CarWise 网页 MVP 实现计划

> 面向后续执行者：本计划用于把 PRD、文字原型、数据模型和 Figma 低保真原型落地为第一版可运行网页应用。先做本地可用版本，重点验证流程，不做视觉精修和后续大功能。

**目标：** 做出一个可在浏览器中使用的 CarWise 第一版，用于管理 007GT 购车报价、销售承诺、提车验车、问题留证、用车费用和车辆档案。

**架构：** 第一版采用前端单页应用，本地保存数据。图片识别先做“模拟识别和待确认草稿”闭环，确保交互跑通；真实 OCR 或 AI 识别作为后续增强，不阻塞 MVP。

**技术栈：** 根据当前空仓库建议使用 Vite + React + TypeScript + 本地存储。样式先使用普通 CSS，避免过早引入复杂组件库。

---

## 1. 第一版范围

### 必须完成

- 首页：车辆状态、待确认识别结果、未落实承诺、提车进度、未解决问题、下一次提醒。
- 购车页：报价、补贴、销售承诺、销售确认文字。
- 销售承诺页：承诺状态修改和凭证查看。
- 提车验车页：按分组展示 Checklist，支持勾选和“有问题”入口。
- 问题留证页：问题照片占位、问题草稿、状态保存。
- 用车页：费用草稿、费用记录、保养和保险提醒。
- 档案页：车辆信息、文件资料、时间线。
- 识别确认流程：上传图片或截图后生成待确认草稿，确认后进入正式记录。
- 本地数据保存：刷新页面后数据不丢。

### 暂不完成

- 不做真实远程车控。
- 不做车友社区。
- 不做全车型库。
- 不做二手车交易。
- 不做云同步。
- 不做真实支付、真实上传云存储。
- 不做真实 OCR 或 AI 识别接入，只保留清晰的模拟识别入口和草稿确认流程。

---

## 2. 文件结构

建议创建以下文件：

```text
package.json
index.html
src/
  main.tsx
  App.tsx
  styles.css
  data/
    checklist.ts
    defaults.ts
  model/
    types.ts
  store/
    appStore.ts
  utils/
    recognition.ts
    timeline.ts
  components/
    BottomNav.tsx
    Card.tsx
    ActionButton.tsx
    StatusPill.tsx
    UploadDraftPanel.tsx
  pages/
    HomePage.tsx
    PurchasePage.tsx
    PromisePage.tsx
    DeliveryPage.tsx
    IssuePage.tsx
    UsagePage.tsx
    ArchivePage.tsx
    RecognitionReviewPage.tsx
```

### 文件职责

- `src/model/types.ts`：定义车辆、报价、承诺、识别任务、验车项、问题、费用、提醒、时间线类型。
- `src/data/checklist.ts`：从《极氪007GT提车验车Checklist.md》整理出的默认验车清单。
- `src/data/defaults.ts`：默认车辆、默认承诺、默认补贴、初始提醒。
- `src/store/appStore.ts`：集中管理本地数据读写。
- `src/utils/recognition.ts`：模拟图片识别，把上传动作转换为待确认草稿。
- `src/utils/timeline.ts`：从承诺、问题、费用、提醒生成时间线。
- `src/components/*`：只放通用小组件，不放业务逻辑。
- `src/pages/*`：每个页面负责展示和调用 store 操作。

---

## 3. 数据实现

### 任务 1：定义数据类型和默认数据

**文件：**

- 创建：`src/model/types.ts`
- 创建：`src/data/defaults.ts`
- 创建：`src/data/checklist.ts`

- [ ] **步骤 1：创建类型文件**

在 `src/model/types.ts` 中定义：

```ts
export type VehicleStatus = '已下定' | '待提车' | '已提车' | '用车中';
export type SourceType = '手工填写' | '图片识别' | '截图识别' | '文件识别';
export type RecognitionStatus = '待识别' | '待确认' | '已确认' | '已忽略' | '识别失败';
export type PromiseStatus = '未确认' | '已确认' | '待落实' | '已落实' | '有争议';
export type IssueStatus = '待确认' | '待处理' | '处理中' | '已解决' | '有争议';
export type ExpenseStatus = '草稿' | '已确认' | '已作废';
export type ReminderStatus = '未开始' | '即将到期' | '已完成' | '已忽略';

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  exteriorColor: string;
  interiorColor: string;
  vin?: string;
  productionDate?: string;
  deliveryDate?: string;
  status: VehicleStatus;
}

export interface SourceFile {
  id: string;
  name: string;
  type: '图片' | '截图' | 'PDF' | '文档' | '其他';
  purpose: '报价' | '承诺' | '问题' | '费用' | '车辆文件' | '其他';
  createdAt: string;
}

export interface RecognitionTask {
  id: string;
  sourceId?: string;
  sourceName: string;
  sourceType: SourceType;
  recognitionType: '报价' | '承诺' | '问题' | '费用' | '提醒' | '车辆信息' | '不确定';
  status: RecognitionStatus;
  suggestedTarget: '报价' | '承诺' | '问题' | '费用' | '提醒' | '档案';
  candidate: Record<string, string | number | boolean>;
  createdAt: string;
}
```

- [ ] **步骤 2：补充业务类型**

继续在 `src/model/types.ts` 中定义：

```ts
export interface Quote {
  id: string;
  title: string;
  store?: string;
  salesName?: string;
  quoteDate?: string;
  officialPrice?: number;
  discountAmount?: number;
  insuranceFee?: number;
  purchaseTax?: number;
  plateFee?: number;
  subsidyTotal?: number;
  landingPrice?: number;
  status: '草稿' | '已确认' | '已作废';
  sourceType: SourceType;
  confirmed: boolean;
}

export interface SalesPromise {
  id: string;
  name: string;
  type: '赠品' | '补贴' | '权益' | '服务' | '费用减免' | '其他';
  value?: number;
  spec?: string;
  owner?: string;
  expectedDate?: string;
  actualDate?: string;
  status: PromiseStatus;
  evidence?: string;
  sourceType: SourceType;
  confirmed: boolean;
}

export interface ChecklistGroup {
  id: string;
  name: string;
  order: number;
  critical: boolean;
}

export interface ChecklistItem {
  id: string;
  groupId: string;
  text: string;
  order: number;
  critical: boolean;
  done: boolean;
  hasIssue: boolean;
  note?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  stage: '提车前' | '提车当天' | '用车中';
  checklistItemId?: string;
  owner?: string;
  resolution?: string;
  expectedDate?: string;
  resolvedDate?: string;
  status: IssueStatus;
  sourceType: SourceType;
  confirmed: boolean;
}

export interface Expense {
  id: string;
  type: '充电' | '保险' | '保养' | '维修' | '贴膜' | '洗车美容' | '轮胎' | '上牌' | '其他';
  date: string;
  amount?: number;
  mileage?: number;
  vendor?: string;
  description?: string;
  status: ExpenseStatus;
  sourceType: SourceType;
  confirmed: boolean;
}

export interface Reminder {
  id: string;
  name: string;
  type: '首保' | '常规保养' | '保险到期' | '年检' | '轮胎' | '其他';
  dueDate?: string;
  dueMileage?: number;
  status: ReminderStatus;
  note?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  type: '购车' | '承诺' | '验车' | '问题' | '费用' | '提醒' | '文件' | '其他';
  date: string;
  description?: string;
  refId?: string;
}
```

- [ ] **步骤 3：创建默认数据**

在 `src/data/defaults.ts` 中导出默认车辆、默认承诺、默认补贴和初始提醒。

- [ ] **步骤 4：创建 Checklist 数据**

在 `src/data/checklist.ts` 中按 10 个分组导出 `ChecklistGroup[]` 和 `ChecklistItem[]`。

---

## 4. 本地存储

### 任务 2：实现应用状态和本地保存

**文件：**

- 创建：`src/store/appStore.ts`

- [ ] **步骤 1：创建状态结构**

`appStore.ts` 需要保存：

```ts
export interface AppState {
  vehicle: Vehicle;
  quotes: Quote[];
  promises: SalesPromise[];
  checklistGroups: ChecklistGroup[];
  checklistItems: ChecklistItem[];
  issues: Issue[];
  expenses: Expense[];
  reminders: Reminder[];
  recognitionTasks: RecognitionTask[];
  sourceFiles: SourceFile[];
}
```

- [ ] **步骤 2：实现读取和保存**

使用 `localStorage` 保存全部状态，键名为 `carwise:mvp:v1`。

- [ ] **步骤 3：实现核心操作**

至少提供以下操作：

- `loadState()`
- `saveState(state)`
- `updateVehicleStatus(status)`
- `confirmRecognitionTask(taskId)`
- `ignoreRecognitionTask(taskId)`
- `updatePromiseStatus(id, status)`
- `toggleChecklistItem(id)`
- `createIssueFromChecklist(itemId)`
- `updateIssueStatus(id, status)`
- `addExpense(expense)`
- `addReminder(reminder)`

---

## 5. 模拟识别流程

### 任务 3：实现上传后生成待确认草稿

**文件：**

- 创建：`src/utils/recognition.ts`
- 创建：`src/pages/RecognitionReviewPage.tsx`
- 创建：`src/components/UploadDraftPanel.tsx`

- [ ] **步骤 1：创建模拟识别函数**

在 `recognition.ts` 中实现：

```ts
export function createMockRecognitionTask(type: RecognitionTask['recognitionType']): RecognitionTask {
  const now = new Date().toISOString();

  if (type === '承诺') {
    return {
      id: crypto.randomUUID(),
      sourceName: '销售聊天截图',
      sourceType: '截图识别',
      recognitionType: '承诺',
      status: '待确认',
      suggestedTarget: '承诺',
      createdAt: now,
      candidate: {
        name: '原厂量子太阳膜',
        type: '赠品',
        value: 2999,
        spec: '4 门 + 后挡',
        status: '待落实'
      }
    };
  }

  return {
    id: crypto.randomUUID(),
    sourceName: `${type}截图`,
    sourceType: '截图识别',
    recognitionType: type,
    status: '待确认',
    suggestedTarget: type === '车辆信息' ? '档案' : type,
    createdAt: now,
    candidate: {}
  };
}
```

- [ ] **步骤 2：识别确认页展示草稿**

`RecognitionReviewPage.tsx` 显示：

- 原始来源名称
- 识别类型
- 候选内容
- `确认保存`
- `修改后保存`
- `忽略`
- `先保存为凭证`

- [ ] **步骤 3：确认后进入正式记录**

确认“承诺”草稿后，要生成一条 `SalesPromise`。确认“报价”草稿后，要生成一条 `Quote`。确认“费用”草稿后，要生成一条 `Expense`。

---

## 6. 页面实现

### 任务 4：首页

**文件：**

- 创建：`src/pages/HomePage.tsx`

- [ ] 展示车辆名称和当前状态。
- [ ] 展示下一件要办。
- [ ] 展示待确认识别结果数量。
- [ ] 展示未落实承诺数量。
- [ ] 展示提车 Checklist 完成进度。
- [ ] 展示未解决问题数量。
- [ ] 展示下一次提醒。
- [ ] 按钮跳转到购车、提车、用车、档案和识别确认页。

### 任务 5：购车和销售承诺

**文件：**

- 创建：`src/pages/PurchasePage.tsx`
- 创建：`src/pages/PromisePage.tsx`

- [ ] 购车页展示报价明细、补贴明细、待确认草稿。
- [ ] 购车页提供“上传报价截图”和“上传销售聊天截图”入口。
- [ ] 销售承诺页展示默认承诺列表。
- [ ] 销售承诺页支持修改状态：未确认、已确认、待落实、已落实、有争议。
- [ ] 生成销售确认文字并支持复制。

### 任务 6：提车验车和问题留证

**文件：**

- 创建：`src/pages/DeliveryPage.tsx`
- 创建：`src/pages/IssuePage.tsx`

- [ ] 提车页展示当前分组和检查项。
- [ ] 支持勾选检查项。
- [ ] 支持点击“有问题”进入问题留证。
- [ ] 问题留证页展示问题草稿。
- [ ] 保存问题后，问题出现在首页未解决问题中。
- [ ] 签字前总检查展示未完成项和未解决问题。

### 任务 7：用车和档案

**文件：**

- 创建：`src/pages/UsagePage.tsx`
- 创建：`src/pages/ArchivePage.tsx`

- [ ] 用车页展示费用草稿、费用记录、保养提醒、保险提醒。
- [ ] 支持上传票据或付款截图生成费用草稿。
- [ ] 支持新增保养或保险提醒。
- [ ] 档案页展示车辆信息、文件资料和时间线。
- [ ] 时间线展示承诺、问题、费用、提醒。

---

## 7. 导航和基础组件

### 任务 8：搭建应用壳和通用组件

**文件：**

- 创建：`src/App.tsx`
- 创建：`src/main.tsx`
- 创建：`src/components/BottomNav.tsx`
- 创建：`src/components/Card.tsx`
- 创建：`src/components/ActionButton.tsx`
- 创建：`src/components/StatusPill.tsx`
- 创建：`src/styles.css`

- [ ] `App.tsx` 使用内部状态控制当前页面，不必先引入路由库。
- [ ] `BottomNav.tsx` 提供首页、购车、提车、用车、档案入口。
- [ ] `Card.tsx` 提供统一信息卡片。
- [ ] `ActionButton.tsx` 提供主要按钮和次要按钮。
- [ ] `StatusPill.tsx` 展示承诺、问题、费用、提醒状态。
- [ ] `styles.css` 做手机端优先布局，宽度适配 390 px 原型。

---

## 8. 验收测试

### 任务 9：运行和手工验收

**文件：**

- 修改：`package.json`

- [ ] 安装依赖后运行 `npm run dev`。
- [ ] 打开本地页面，确认首页正常显示。
- [ ] 点击底部导航，确认 5 个主页面都能切换。
- [ ] 在购车页上传销售聊天截图，确认生成待确认承诺草稿。
- [ ] 确认承诺草稿，确认承诺进入销售承诺页。
- [ ] 在提车页勾选检查项，确认进度变化。
- [ ] 点击“有问题”，保存问题，确认首页未解决问题数量增加。
- [ ] 在用车页上传票据，确认生成费用草稿。
- [ ] 确认费用草稿，确认费用进入用车页和档案时间线。
- [ ] 刷新浏览器，确认数据仍然存在。
- [ ] 用手机宽度检查页面不横向溢出。

---

## 9. 完成标准

第一版开发完成必须满足：

- 首页能显示真实汇总数据。
- 购车、销售承诺、提车、问题留证、用车、档案 7 个页面能访问。
- 识别草稿流程能跑通。
- 所有识别结果都需要确认后才进入正式记录。
- 提车 Checklist 可勾选。
- 问题可保存并回到首页。
- 费用可保存并进入时间线。
- 数据刷新后不丢失。
- 页面在手机宽度下可正常使用。

