import { describe, expect, it } from 'vitest';

import { recognizeImportedFile } from './recognitionPipeline';

describe('Recognition pipeline', () => {
  it('parses markdown imports into confirmation drafts through one entry point', async () => {
    const tasks = await recognizeImportedFile({
      fileName: '交付记录.md',
      requestedType: '不确定',
      textContent: '- 太阳膜，价值 2999 元\n- 落地价 201400 元\n- 保险到期提醒：2027-05-25',
    });

    expect(tasks.length).toBeGreaterThan(1);
    expect(tasks.every((task) => task.status === '待确认')).toBe(true);
    expect(tasks.every((task) => task.sourceName === '交付记录.md')).toBe(true);
    expect(tasks.some((task) => task.recognitionType === '承诺')).toBe(true);
    expect(tasks.some((task) => task.recognitionType === '报价')).toBe(true);
    expect(tasks.some((task) => task.recognitionType === '提醒')).toBe(true);
    expect(tasks.every((task) => task.sourceText?.includes('落地价 201400 元'))).toBe(true);
  });

  it('turns image uploads into replaceable local recognition drafts', async () => {
    const tasks = await recognizeImportedFile({
      fileName: '轮毂问题.jpg',
      requestedType: '问题',
      mimeType: 'image/jpeg',
    });

    expect(tasks).toHaveLength(1);
    expect(tasks[0].sourceName).toBe('轮毂问题.jpg');
    expect(tasks[0].sourceType).toBe('图片识别');
    expect(tasks[0].recognitionType).toBe('问题');
    expect(tasks[0].status).toBe('待确认');
    expect(tasks[0].candidate.aiSummary).toContain('AI识图');
    expect(tasks[0].sourceText).toContain('AI识图');
  });

  it('uses extracted image text before falling back to local drafts', async () => {
    const tasks = await recognizeImportedFile({
      fileName: '销售截图.png',
      requestedType: '承诺',
      mimeType: 'image/png',
      extractedText: '- 官方原厂量子太阳膜，价值 2999 元\n- 落地价 201400 元',
    });

    expect(tasks.length).toBeGreaterThan(1);
    expect(tasks.every((task) => task.sourceName === '销售截图.png')).toBe(true);
    expect(tasks.every((task) => task.sourceType === '截图识别')).toBe(true);
    expect(tasks.some((task) => task.recognitionType === '承诺')).toBe(true);
    expect(tasks.some((task) => task.recognitionType === '报价')).toBe(true);
    expect(JSON.stringify(tasks)).toContain('官方原厂量子太阳膜');
    expect(tasks.every((task) => task.sourceText?.includes('官方原厂量子太阳膜'))).toBe(true);
  });
});
