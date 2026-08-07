import { useState, type FormEvent } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import type { ScheduledTask } from '@/types';
import { COPY } from '@/data/copy';
import { formatDuration } from '@/data/taskRules';

export interface CompleteTaskResult {
  notes?: string;
  flag?: string;
  photoDataUrl?: string;
}

interface CompleteTaskModalProps {
  task: ScheduledTask | null;
  propertyName?: string;
  busy?: boolean;
  onHide: () => void;
  onConfirm: (result: CompleteTaskResult) => void;
}

export function CompleteTaskModal({
  task,
  propertyName,
  busy,
  onHide,
  onConfirm,
}: CompleteTaskModalProps) {
  const [notes, setNotes] = useState('');
  const [flag, setFlag] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>();

  function reset() {
    setNotes('');
    setFlag('');
    setPhotoDataUrl(undefined);
  }

  function handleHide() {
    reset();
    onHide();
  }

  function onFile(file: File | null) {
    if (!file) {
      setPhotoDataUrl(undefined);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(String(reader.result || ''));
    reader.readAsDataURL(file);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    onConfirm({
      notes: notes.trim() || undefined,
      flag: flag || undefined,
      photoDataUrl,
    });
  }

  return (
    <Modal
      show={!!task}
      onHide={handleHide}
      centered
      onExited={reset}
    >
      <Form onSubmit={submit}>
        <Modal.Header closeButton>
          <Modal.Title>{COPY.completeTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {task && (
            <>
              <p className="mb-1">
                <strong>{task.taskName}</strong>
              </p>
              <p className="small text-muted mb-3">
                {propertyName}
                {task.estimatedMinutes != null ? ` · ~${formatDuration(task.estimatedMinutes)}` : ''}
              </p>
              <p className="small text-muted">{COPY.completeHint}</p>
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. restocked soap, guest left early"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Flag</Form.Label>
                <Form.Select value={flag} onChange={(e) => setFlag(e.target.value)}>
                  <option value="">{COPY.flagNone}</option>
                  <option value="issue">{COPY.flagIssue}</option>
                  <option value="follow_up">{COPY.flagFollowUp}</option>
                  <option value="damage">{COPY.flagDamage}</option>
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label>{COPY.photoAdd}</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const input = e.target as HTMLInputElement;
                    onFile(input.files?.[0] ?? null);
                  }}
                />
                {photoDataUrl && (
                  <div className="mt-2 d-flex align-items-center gap-2">
                    <img src={photoDataUrl} alt="Evidence" className="completion-thumb" />
                    <Button type="button" size="sm" variant="outline-secondary" onClick={() => setPhotoDataUrl(undefined)}>
                      {COPY.photoClear}
                    </Button>
                  </div>
                )}
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleHide} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" variant="success" disabled={busy}>
            {busy ? COPY.markingDone : COPY.markDone}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
