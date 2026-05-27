import type { RecognitionTask } from '../model/types';

function id(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cleanLine(line: string) {
  return line
    .replace(/^[-*]\s+\[[ xX]\]\s*/, '')
    .replace(/^[-*]\s*/, '')
    .replace(/^#+\s*/, '')
    .trim();
}

function amountFrom(text: string) {
  const match = text.match(/(\d+(?:\.\d+)?)\s*元/);
  return match ? Number(match[1]) : undefined;
}

function dateFrom(text: string) {
  return text.match(/\d{4}-\d{1,2}-\d{1,2}/)?.[0];
}

function createTask(fileName: string, recognitionType: RecognitionTask['recognitionType'], suggestedTarget: RecognitionTask['suggestedTarget'], candidate: RecognitionTask['candidate']): RecognitionTask {
  return {
    id: id('recognition'),
    sourceName: fileName,
    sourceType: '文件识别',
    recognitionType,
    status: '待确认',
    suggestedTarget,
    candidate,
    createdAt: new Date().toISOString(),
  };
}

export function parseMarkdownToRecognitionTasks(markdown: string, fileName: string): RecognitionTask[] {
  const lines = markdown
    .split(/\r?\n/)
    .map(cleanLine)
    .filter(Boolean);

  const promiseLines = lines.filter((line) => /(太阳膜|积分|补贴|赠品|礼品|权益|减免|上牌|取送车|工时费)/.test(line));
  const quoteLine = lines.find((line) => /(报价|落地价|官方价|保险)/.test(line) && /\d/.test(line));
  const issueLine = lines.find((line) => /(问题|剐蹭|划痕|故障|异常|破损|裂纹|鼓包)/.test(line));
  const reminderLine = lines.find((line) => /(提醒|保养|保险|到期|首保|年检)/.test(line) && (/\d{4}-\d{1,2}-\d{1,2}/.test(line) || /提醒|首保/.test(line)));

  const tasks: RecognitionTask[] = [];

  if (promiseLines.length > 0) {
    tasks.push(createTask(fileName, '承诺', '承诺', {
      items: promiseLines.slice(0, 12).map((line) => ({
        name: line.replace(/[，,].*$/, ''),
        type: /(补贴)/.test(line) ? '补贴' : /(减免)/.test(line) ? '费用减免' : /(积分|权益|取送车|上牌|工时费)/.test(line) ? '权益' : '赠品',
        value: amountFrom(line),
        spec: line,
        status: '待落实',
      })),
    }));
  }

  if (quoteLine) {
    tasks.push(createTask(fileName, '报价', '报价', {
      title: `${fileName} 识别报价`,
      quoteDate: dateFrom(quoteLine),
      landingPrice: /落地价/.test(quoteLine) ? amountFrom(quoteLine) : undefined,
      insuranceFee: /保险/.test(quoteLine) ? amountFrom(quoteLine) : undefined,
      note: quoteLine,
    }));
  }

  if (issueLine) {
    tasks.push(createTask(fileName, '问题', '问题', {
      title: issueLine.replace(/[，,。].*$/, ''),
      description: issueLine,
      stage: '提车当天',
      owner: '待确认',
      resolution: '确认责任人、处理方式和完成时间',
      status: '待处理',
    }));
  }

  if (reminderLine) {
    tasks.push(createTask(fileName, '提醒', '提醒', {
      name: reminderLine.replace(/[：:].*$/, '') || '新提醒',
      type: /保险/.test(reminderLine) ? '保险到期' : /保养|首保/.test(reminderLine) ? '首保' : '其他',
      dueDate: dateFrom(reminderLine),
      status: '未开始',
      note: reminderLine,
    }));
  }

  if (tasks.length === 0) {
    tasks.push(createTask(fileName, '不确定', '档案', {
      note: lines.slice(0, 6).join(' / '),
    }));
  }

  return tasks;
}
