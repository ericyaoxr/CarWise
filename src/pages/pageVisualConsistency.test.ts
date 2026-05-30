import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const pageDir = join(process.cwd(), 'src', 'pages');

const pages = [
  {
    file: 'HomePage.tsx',
    title: null,
    requiredCopy: ['当前最该处理', '最近时间线'],
    forbiddenCopy: ['UploadDraftPanel'],
  },
  {
    file: 'RecognitionReviewPage.tsx',
    title: null,
    requiredCopy: ['识别确认', '确认保存', '优先确认高风险字段'],
  },
  {
    file: 'PromisePage.tsx',
    title: '权益',
    requiredCopy: ['权益状态', '权益清单', '快速导入权益资料', '低调确认文字', '待处理', '已完成'],
  },
  {
    file: 'DeliveryPage.tsx',
    title: '提车验车',
    requiredCopy: ['交付现场', '网上经验重点', '车友经验专项检查', '签字前确认总表', '快速导入提车资料', '未完成', '有问题'],
  },
  {
    file: 'HandoverPage.tsx',
    title: '签字前确认',
    requiredCopy: ['未完成关键项', '未落实权益', '未解决问题'],
  },
  {
    file: 'PurchasePage.tsx',
    title: '购车',
    requiredCopy: ['报价管家', '当前要确认', '确认文字'],
  },
  {
    file: 'IssuePage.tsx',
    title: '问题留证',
    requiredCopy: ['问题管家', '当前要处理', '问题记录', '问题类型', '截止时间', '快到期'],
  },
  {
    file: 'UsagePage.tsx',
    title: '用车',
    requiredCopy: ['用车管家', '下一次提醒', '费用记录'],
  },
  {
    file: 'ArchivePage.tsx',
    title: '车辆档案',
    requiredCopy: ['档案管家', '车辆信息', '完整时间线', '搜索档案', '全部', '权益'],
  },
];

describe('secondary pages use the accepted owner-assistant visual system', () => {
  it.each(pages)('$file follows the advisor page structure', ({ file, title, requiredCopy, forbiddenCopy = [] }) => {
    const source = readFileSync(join(pageDir, file), 'utf8');

    expect(source).toContain('className="page advisor-page"');
    if (title) {
      expect(source).toContain('className="advisor-title"');
      expect(source).toContain(`<h1>${title}</h1>`);
    }
    for (const copy of requiredCopy) {
      expect(source).toContain(copy);
    }
    for (const copy of forbiddenCopy) {
      expect(source).not.toContain(copy);
    }
  });
});
