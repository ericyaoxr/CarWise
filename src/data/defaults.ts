import type { Reminder, SalesPromise, Vehicle } from '../model/types';

export const defaultVehicle: Vehicle = {
  id: 'vehicle-007gt',
  name: '我的 007GT',
  brand: '极氪',
  model: '007GT',
  exteriorColor: '紫外',
  interiorColor: '紫内',
  status: '待提车',
};

export const defaultPromises: SalesPromise[] = [
  { id: 'promise-insurance-subsidy', name: '5000 元保险补贴', type: '补贴', value: 5000, status: '待落实', sourceType: '手工填写', confirmed: true },
  { id: 'promise-trade-subsidy', name: '5000 元置换补贴', type: '补贴', value: 5000, status: '待落实', sourceType: '手工填写', confirmed: true },
  { id: 'promise-government-subsidy', name: '5000 元政府新购补贴', type: '补贴', value: 5000, status: '未确认', sourceType: '手工填写', confirmed: true },
  { id: 'promise-physical-gift', name: '1199 元实体礼品', type: '赠品', value: 1199, status: '待落实', sourceType: '手工填写', confirmed: true },
  { id: 'promise-solar-film', name: '官方原厂量子太阳膜', type: '赠品', value: 2999, spec: '4 门 + 后挡', status: '待落实', sourceType: '手工填写', confirmed: true },
  { id: 'promise-referral-points', name: '两次老带新共 8000 极氪积分', type: '权益', spec: '8000 积分', status: '待落实', sourceType: '手工填写', confirmed: true },
  { id: 'promise-sunshade', name: '遮阳帘', type: '赠品', status: '待落实', sourceType: '手工填写', confirmed: true },
  { id: 'promise-door-sill', name: '门槛保护套', type: '赠品', status: '待落实', sourceType: '手工填写', confirmed: true },
  { id: 'promise-door-silicone', name: '关门硅胶套', type: '赠品', status: '待落实', sourceType: '手工填写', confirmed: true },
  { id: 'promise-club-badge', name: '车友会车主标', type: '权益', status: '待落实', sourceType: '手工填写', confirmed: true },
  { id: 'promise-maintenance-labor', name: '保养工时费 8 折', type: '服务', spec: '工时费 8 折', status: '待落实', sourceType: '手工填写', confirmed: true },
  { id: 'promise-pickup-service', name: '质保期内免费上门取送车', type: '服务', status: '待落实', sourceType: '手工填写', confirmed: true },
  { id: 'promise-plate-help', name: '免费协助办理深圳上牌指标', type: '服务', status: '待落实', sourceType: '手工填写', confirmed: true },
  { id: 'promise-plate-fee-waive', name: '免 499 元指标申请费', type: '费用减免', value: 499, status: '待落实', sourceType: '手工填写', confirmed: true },
];

export const defaultReminders: Reminder[] = [
  {
    id: 'reminder-insurance-active',
    name: '保险生效确认',
    type: '保险到期',
    dueDate: '2026-05-28',
    status: '即将到期',
    note: '提车前确认交强险和商业险生效',
  },
  {
    id: 'reminder-first-service',
    name: '首保提醒',
    type: '首保',
    dueMileage: 5000,
    status: '未开始',
    note: '提车后按里程或时间补充',
  },
];
