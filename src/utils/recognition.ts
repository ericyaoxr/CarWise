import type { RecognitionTask, RecognitionType, SourceType } from '../model/types';

function id(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createMockRecognitionTask(type: RecognitionType, sourceName?: string): RecognitionTask {
  const createdAt = new Date().toISOString();
  const sourceType: SourceType = type === '车辆信息' ? '文件识别' : '截图识别';
  const base = {
    id: id('recognition'),
    sourceName: sourceName ?? `${type}截图`,
    sourceType,
    recognitionType: type,
    status: '待确认' as const,
    createdAt,
  };

  if (type === '承诺') {
    return {
      ...base,
      sourceName: sourceName ?? '沟通截图',
      suggestedTarget: '承诺',
      candidate: {
        items: [
          { name: '官方原厂量子太阳膜', type: '赠品', value: 2999, spec: '4 门 + 后挡', status: '待落实' },
          { name: '两次老带新共 8000 极氪积分', type: '权益', spec: '8000 积分', status: '待落实' },
          { name: '免 499 元指标申请费', type: '费用减免', value: 499, status: '待落实' },
        ],
      },
    };
  }

  if (type === '报价') {
    return {
      ...base,
      sourceName: sourceName ?? '报价单截图',
      suggestedTarget: '报价',
      candidate: {
        title: '深圳门店报价',
        store: '深圳门店',
        salesName: '待确认对接人',
        quoteDate: '2026-05-25',
        officialPrice: 209900,
        insuranceFee: 6500,
        subsidyTotal: 15000,
        landingPrice: 201400,
      },
    };
  }

  if (type === '费用') {
    return {
      ...base,
      sourceName: sourceName ?? '票据截图',
      suggestedTarget: '费用',
      candidate: {
        type: '贴膜',
        date: '2026-05-25',
        amount: 2999,
        vendor: '极氪官方服务中心',
        description: '贴膜：官方原厂量子太阳膜安装费用，等待核对是否由权益记录覆盖',
      },
    };
  }

  if (type === '问题') {
    return {
      ...base,
      sourceName: sourceName ?? '问题照片',
      suggestedTarget: '问题',
      candidate: {
        title: '右后轮毂疑似剐蹭',
        description: '照片显示右后轮毂边缘有痕迹，提车前需要交付员确认。',
        stage: '提车当天',
        owner: '交付员',
        resolution: '现场确认，必要时补充书面处理时间',
        status: '待处理',
      },
    };
  }

  if (type === '提醒') {
    return {
      ...base,
      suggestedTarget: '提醒',
      candidate: {
        name: '保险到期提醒',
        type: '保险到期',
        dueDate: '2027-05-25',
        status: '未开始',
        note: '由保单截图生成，日期待确认',
      },
    };
  }

  return {
    ...base,
    suggestedTarget: '档案',
    candidate: {
      note: '已保存为凭证，等待后续识别。',
    },
  };
}
