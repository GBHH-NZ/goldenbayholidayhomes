interface EmptyStateProps {
  icon?: string;
  title: string;
  detail?: string;
}

export function EmptyState({ icon = 'bi-inbox', title, detail }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <i className={`bi ${icon} d-block mb-2`} />
      <div className="fw-semibold text-dark">{title}</div>
      {detail && <p className="small mb-0 mt-1">{detail}</p>}
    </div>
  );
}
