import type { AppState } from '../store/appStore';
import type { TimelineEvent } from '../model/types';

export function deriveTimeline(state: AppState): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      id: 'timeline-vehicle',
      title: `${state.vehicle.name}：${state.vehicle.status}`,
      type: '购车',
      date: state.vehicle.deliveryDate ?? '2026-05-25',
      description: `${state.vehicle.exteriorColor} / ${state.vehicle.interiorColor}`,
      refId: state.vehicle.id,
    },
  ];

  state.promises.forEach((item) => {
    events.push({
      id: `timeline-${item.id}`,
      title: item.name,
      type: '权益',
      date: item.actualDate ?? item.expectedDate ?? '2026-05-25',
      description: item.status,
      refId: item.id,
    });
  });

  state.issues.forEach((item) => {
    events.push({
      id: `timeline-${item.id}`,
      title: item.title,
      type: '问题',
      date: item.expectedDate ?? '2026-05-25',
      description: item.status,
      refId: item.id,
    });
  });

  state.expenses.forEach((item) => {
    events.push({
      id: `timeline-${item.id}`,
      title: item.description ?? `${item.type}费用`,
      type: '费用',
      date: item.date,
      description: item.amount ? `${item.amount} 元` : item.status,
      refId: item.id,
    });
  });

  state.reminders.forEach((item) => {
    events.push({
      id: `timeline-${item.id}`,
      title: item.name,
      type: '提醒',
      date: item.dueDate ?? '2026-05-25',
      description: item.note ?? item.status,
      refId: item.id,
    });
  });

  return events.sort((a, b) => b.date.localeCompare(a.date));
}
