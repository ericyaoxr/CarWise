import { describe, expect, it } from 'vitest';

import { parseMarkdownToRecognitionTasks } from './markdownImport';

describe('Markdown import recognition', () => {
  it('turns a car-buying markdown document into confirmation drafts', () => {
    const tasks = parseMarkdownToRecognitionTasks(
      `
# 007GT 交付记录

- 官方原厂量子太阳膜，价值 2999 元，含 4 门 + 后挡
- 两次老带新共 8000 极氪积分
- 落地价 201400 元，保险 6500 元
- 右后轮毂疑似剐蹭，需要交付员确认
- 保险到期提醒：2027-05-25
      `,
      '交付记录.md',
    );

    expect(tasks.every((task) => task.status === '待确认')).toBe(true);
    expect(tasks.every((task) => task.sourceType === '文件识别')).toBe(true);
    expect(tasks.some((task) => task.recognitionType === '承诺' && JSON.stringify(task.candidate).includes('8000 极氪积分'))).toBe(true);
    expect(tasks.some((task) => task.recognitionType === '报价' && JSON.stringify(task.candidate).includes('201400'))).toBe(true);
    expect(tasks.some((task) => task.recognitionType === '问题' && JSON.stringify(task.candidate).includes('右后轮毂'))).toBe(true);
    expect(tasks.some((task) => task.recognitionType === '提醒' && JSON.stringify(task.candidate).includes('2027-05-25'))).toBe(true);
  });

  it('keeps unclassified markdown as an archive draft instead of dropping it', () => {
    const tasks = parseMarkdownToRecognitionTasks('# 随手记录\n今天看车体验不错。', '随手记录.md');

    expect(tasks).toHaveLength(1);
    expect(tasks[0].recognitionType).toBe('不确定');
    expect(tasks[0].suggestedTarget).toBe('档案');
  });
});
