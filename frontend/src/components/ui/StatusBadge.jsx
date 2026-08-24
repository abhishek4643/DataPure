import { CheckCircle2, XCircle, AlertTriangle, Clock, CheckCheck, Ban } from 'lucide-react';

const C = {
  unique:    { label: 'Unique',    cls: 'badge-unique',    Icon: CheckCircle2 },
  redundant: { label: 'Redundant', cls: 'badge-redundant', Icon: Ban          },
  flagged:   { label: 'Flagged',   cls: 'badge-flagged',   Icon: AlertTriangle },
  pending:   { label: 'Pending',   cls: 'badge-pending',   Icon: Clock        },
  approved:  { label: 'Approved',  cls: 'badge-approved',  Icon: CheckCheck   },
  rejected:  { label: 'Rejected',  cls: 'badge-rejected',  Icon: XCircle      },
};

export default function StatusBadge({ status }) {
  const k = (status || '').toLowerCase();
  const { label, cls, Icon } = C[k] || C.pending;
  return (
    <span className={`badge ${cls}`}>
      <Icon size={9} />
      {label}
    </span>
  );
}
