import type { Severity } from "@/features/scan";
import { SEVERITY_COLOR, SEVERITY_LABEL } from "@/lib/ui";

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className="inline-flex items-center justify-center"
      style={{
        minWidth: 66,
        height: 22,
        borderRadius: 6,
        background: SEVERITY_COLOR[severity],
        color: "#10141a",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {SEVERITY_LABEL[severity]}
    </span>
  );
}
