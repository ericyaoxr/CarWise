export type VehicleStatus = '已下定' | '待提车' | '已提车' | '用车中';
export type SourceType = '手工填写' | '图片识别' | '截图识别' | '文件识别';
export type RecognitionStatus = '待识别' | '待确认' | '已确认' | '已忽略' | '识别失败';
export type RecognitionType = '报价' | '承诺' | '问题' | '费用' | '提醒' | '车辆信息' | '不确定';
export type PromiseStatus = '未确认' | '已确认' | '待落实' | '已落实' | '有争议';
export type IssueType = '外观' | '内饰' | '屏幕' | '权益' | '交付材料' | '其他';
export type IssueStatus = '待确认' | '待处理' | '处理中' | '已解决' | '有争议';
export type ExpenseStatus = '草稿' | '已确认' | '已作废';
export type ReminderStatus = '未开始' | '即将到期' | '已完成' | '已忽略';

export interface IssuePhoto {
  id: string;
  name: string;
  dataUrl: string;
  createdAt: string;
}

export interface IssueFollowUp {
  id: string;
  content: string;
  createdAt: string;
}

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
  tireDotCodes?: string[];
  tireProductionDates?: string[];
  tireReplacementDate?: string;
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
  recognitionType: RecognitionType;
  status: RecognitionStatus;
  suggestedTarget: '报价' | '承诺' | '问题' | '费用' | '提醒' | '档案';
  candidate: Record<string, unknown>;
  sourceText?: string;
  createdAt: string;
}

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
  sourceTaskId?: string;
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
  sourceTaskId?: string;
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
  issueType: IssueType;
  description: string;
  stage: '提车前' | '提车当天' | '用车中';
  checklistItemId?: string;
  owner?: string;
  resolution?: string;
  expectedDate?: string;
  nextReminderDate?: string;
  resolvedDate?: string;
  photos?: IssuePhoto[];
  followUps?: IssueFollowUp[];
  status: IssueStatus;
  sourceType: SourceType;
  sourceTaskId?: string;
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
  sourceTaskId?: string;
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

export interface LandingCostItem {
  id: string;
  category: '裸车价' | '购置税' | '保险费' | '上牌费' | '服务费' | '装潢费' | '其他费用';
  name: string;
  amount: number;
  date?: string;
  vendor?: string;
  description?: string;
  photoDataUrl?: string;
  sourceType: SourceType;
  sourceTaskId?: string;
  confirmed: boolean;
  createdAt: string;
}

export interface LandingCostSummary {
  totalAmount: number;
  officialPrice?: number;
  actualLandingPrice: number;
  discountAmount: number;
  itemCount: number;
  lastUpdatedAt: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  type: '购车' | '权益' | '验车' | '问题' | '费用' | '提醒' | '文件' | '其他';
  date: string;
  description?: string;
  refId?: string;
}
