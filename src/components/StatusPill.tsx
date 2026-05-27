interface StatusPillProps {
  label: string;
}

export function StatusPill({ label }: StatusPillProps) {
  const tone = label.includes('已落实') || label.includes('已解决') || label.includes('已确认')
    ? 'good'
    : label.includes('争议') || label.includes('待处理')
      ? 'danger'
      : 'warn';

  return <span className={`status-pill ${tone}`}>{label}</span>;
}
