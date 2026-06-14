import { activityMeta } from "./activityMeta";
import type { ActivityEvent } from "./useActivity";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

// One entry in the security activity timeline: icon + label + when/where.
export const ActivityRow = ({ event }: { event: ActivityEvent }) => {
  const { label, Icon, tone } = activityMeta(event.action);
  const { device, userAgent, ip } = event.context;
  const where = device ?? userAgent;

  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-black/[0.06] dark:border-white/[0.05]">
      <div className={`mt-0.5 shrink-0 ${tone}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-[#1a201c] dark:text-[#e8ece9]">
          {label}
        </div>
        <div className="text-[12px] text-[#5a625e] dark:text-[#a0a8a3] mt-0.5 truncate">
          {formatDate(event.createdAt)}
          {where && <> · {where}</>}
          {ip && <> · {ip}</>}
        </div>
      </div>
    </div>
  );
};
