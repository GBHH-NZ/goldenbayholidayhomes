import { Button } from 'react-bootstrap';
import type { ScheduledTask } from '@/types';
import { StatusBadge } from './StatusBadge';

interface TaskRowProps {
  task: ScheduledTask;
  propertyName: string;
  onComplete?: (task: ScheduledTask) => void;
  completing?: boolean;
  showAssignee?: boolean;
}

export function TaskRow({
  task,
  propertyName,
  onComplete,
  completing,
  showAssignee,
}: TaskRowProps) {
  const isDone = task.status === 'completed';
  const isOverdue = Boolean(task.overdue) || (!isDone && task.scheduledDate < new Date().toISOString().slice(0, 10));
  const status = isDone ? 'completed' : isOverdue ? 'overdue' : task.status || 'pending';

  return (
    <div className={`task-row ${isOverdue && !isDone ? 'is-overdue' : ''} ${isDone ? 'is-completed' : ''}`}>
      <div className="flex-grow-1 min-w-0">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
          <strong>{task.taskName}</strong>
          <StatusBadge status={status} />
          {task.priority === 'high' && <StatusBadge status="flagged" label="High priority" />}
        </div>
        <div className="small text-muted">
          <span className="property-chip me-2">{propertyName}</span>
          {task.scheduledDate}
          {task.estimatedMinutes != null && <> · ~{task.estimatedMinutes} min</>}
          {showAssignee && task.assignedTo && <> · {task.assignedTo}</>}
        </div>
        {task.notes && <div className="small mt-1 text-muted">{task.notes}</div>}
        {isDone && task.completedBy && (
          <div className="small mt-1 text-success">
            Completed by {task.completedBy}
            {task.completedAt ? ` · ${new Date(task.completedAt).toLocaleString()}` : ''}
          </div>
        )}
      </div>
      {!isDone && onComplete && (
        <Button
          size="sm"
          variant="success"
          disabled={completing}
          onClick={() => onComplete(task)}
          className="flex-shrink-0"
        >
          {completing ? 'Saving…' : 'Mark complete'}
        </Button>
      )}
    </div>
  );
}
