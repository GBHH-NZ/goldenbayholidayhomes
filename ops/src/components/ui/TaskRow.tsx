import { Button } from 'react-bootstrap';
import type { ScheduledTask } from '@/types';
import { StatusBadge } from './StatusBadge';
import { formatDuration } from '@/data/taskRules';
import { COPY } from '@/data/copy';

interface TaskRowProps {
  task: ScheduledTask;
  propertyName: string;
  town?: string;
  onComplete?: (task: ScheduledTask) => void;
  completing?: boolean;
  showAssignee?: boolean;
  staffMode?: boolean;
}

export function TaskRow({
  task,
  propertyName,
  town,
  onComplete,
  completing,
  showAssignee,
  staffMode,
}: TaskRowProps) {
  const isDone = task.status === 'completed';
  const isOverdue =
    Boolean(task.overdue) || (!isDone && task.scheduledDate < new Date().toISOString().slice(0, 10));
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
          {town && <span className="property-chip me-2">{town}</span>}
          {task.scheduledDate}
          {task.estimatedMinutes != null && <> · ~{formatDuration(task.estimatedMinutes)}</>}
          {showAssignee && task.assignedTo && <> · {task.assignedTo}</>}
        </div>
        {task.notes && <div className="small mt-1 text-muted">{task.notes}</div>}
        {isDone && task.completedBy && (
          <div className="small mt-1 text-success">
            Done by {task.completedBy}
            {task.completedAt ? ` · ${new Date(task.completedAt).toLocaleString()}` : ''}
          </div>
        )}
        {isDone && task.completionPhotoUrl && (
          <img src={task.completionPhotoUrl} alt="" className="completion-thumb mt-2" />
        )}
      </div>
      {!isDone && onComplete && (
        <Button
          size={staffMode ? undefined : 'sm'}
          variant="success"
          className={staffMode ? 'btn-mark-done' : undefined}
          disabled={completing}
          onClick={() => onComplete(task)}
        >
          {completing ? COPY.markingDone : COPY.markDone}
        </Button>
      )}
    </div>
  );
}
