interface Props {
  status: "PENDING" | "APPROVED" | "REJECTED"
}

const STATUS_STYLES: Record<Props["status"], string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
}

const STATUS_LABELS: Record<Props["status"], string> = {
  PENDING: "รอตรวจสอบ",
  APPROVED: "อนุมัติแล้ว",
  REJECTED: "ถูกปฏิเสธ",
}

export function OrderStatusBadge({ status }: Props) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.02em] ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
