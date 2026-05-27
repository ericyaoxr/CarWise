import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const pageDir = join(process.cwd(), 'src', 'pages');

const pages = [
  {
    file: 'PurchasePage.tsx',
    title: '购车',
    requiredCopy: ['报价管家', '当前要确认', '确认文字'],
  },
  {
    file: 'IssuePage.tsx',
    title: '问题留证',
    requiredCopy: ['问题管家', '当前要处理', '问题记录', '问题类型', '截止时间'],
  },
  {
    file: 'UsagePage.tsx',
    title: '用车',
    requiredCopy: ['用车管家', '下一次提醒', '费用记录'],
  },
  {
    file: 'ArchivePage.tsx',
    title: '车辆档案',
    requiredCopy: ['档案管家', '车辆信息', '完整时间线'],
  },
];

describe('secondary pages use the accepted owner-assistant visual system', () => {
  it.each(pages)('$file follows the advisor page structure', ({ file, title, requiredCopy }) => {
    const source = readFileSync(join(pageDir, file), 'utf8');

    expect(source).toContain('className="page advisor-page"');
    expect(source).toContain('className="advisor-title"');
    expect(source).toContain(`<h1>${title}</h1>`);
    for (const copy of requiredCopy) {
      expect(source).toContain(copy);
    }
  });
});
