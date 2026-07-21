import { Badge } from "../common/Badge";
import type { FlagStatus } from "../../types/flag";

export function FlagStatusBadge({ status }: { status: FlagStatus }) {
  return <Badge status={status} pulse={status === "active"} />;
}
