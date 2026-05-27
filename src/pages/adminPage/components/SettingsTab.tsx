import { useState } from "react";
import { Settings, Shield, HardDrive } from "lucide-react";
import { useAdminSettings } from "../../../hooks/useAdminSettings";

interface SettingDef {
  key: string;
  label: string;
  description: string;
  type: "number" | "boolean";
}

const GROUPS: { title: string; icon: React.ReactNode; settings: SettingDef[] }[] = [
  {
    title: "General",
    icon: <Settings size={14} />,
    settings: [
      { key: "registration_enabled", label: "Registration enabled", description: "Allow new users to register on the platform", type: "boolean" },
      { key: "maintenance_mode", label: "Maintenance mode", description: "Show a maintenance page to non-admin users", type: "boolean" },
    ],
  },
  {
    title: "Limits",
    icon: <HardDrive size={14} />,
    settings: [
      { key: "invite_expiry_days", label: "Invite expiry (days)", description: "How many days before an invite link expires", type: "number" },
      { key: "max_file_size_mb", label: "Max file size (MB)", description: "Maximum upload size per file in megabytes", type: "number" },
    ],
  },
];

export const SettingsTab = () => {
  const { settingsMap, loading, updateSetting, updatingKey } = useAdminSettings();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[13px] text-[#858c87] dark:text-[#6e7672]">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {GROUPS.map((group) => (
        <div
          key={group.title}
          className="rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] overflow-hidden"
        >
          <div className="flex items-center gap-2 px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.05]">
            <span className="text-[#5a8a6b]">{group.icon}</span>
            <h3 className="text-[14px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">
              {group.title}
            </h3>
          </div>
          <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
            {group.settings.map((def) => {
              const setting = settingsMap.get(def.key);
              const value = setting?.value;
              return (
                <div key={def.key} className="flex items-center justify-between px-5 py-4 gap-4">
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-[#1a201c] dark:text-[#e8ece9]">
                      {def.label}
                    </div>
                    <div className="text-[12px] text-[#858c87] dark:text-[#6e7672] mt-0.5">
                      {def.description}
                    </div>
                  </div>
                  {def.type === "boolean" ? (
                    <ToggleSwitch
                      checked={value === true}
                      disabled={updatingKey === def.key}
                      onChange={(v) => updateSetting(def.key, v)}
                    />
                  ) : (
                    <NumberInput
                      value={typeof value === "number" ? value : 0}
                      disabled={updatingKey === def.key}
                      onCommit={(v) => updateSetting(def.key, v)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.05]">
          <span className="text-[#5a8a6b]"><Shield size={14} /></span>
          <h3 className="text-[14px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">Info</h3>
        </div>
        <div className="px-5 py-4">
          <p className="text-[12px] text-[#858c87] dark:text-[#6e7672]">
            Settings are stored in the database and take effect immediately. Changes are recorded in the audit log.
          </p>
        </div>
      </div>
    </div>
  );
};

function ToggleSwitch({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`relative w-10 h-[22px] rounded-full transition-colors cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? "bg-[#5a8a6b]" : "bg-black/[0.12] dark:bg-white/[0.12]"
      }`}
    >
      <span
        className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "left-[22px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}

function NumberInput({
  value,
  disabled,
  onCommit,
}: {
  value: number;
  disabled: boolean;
  onCommit: (value: number) => void;
}) {
  const [local, setLocal] = useState(String(value));
  const [dirty, setDirty] = useState(false);

  const handleChange = (v: string) => {
    setLocal(v);
    setDirty(v !== String(value));
  };

  const handleSave = () => {
    const num = parseInt(local, 10);
    if (!isNaN(num) && num > 0 && num !== value) {
      onCommit(num);
      setDirty(false);
    }
  };

  return (
    <div className="flex items-center gap-2 shrink-0">
      <input
        type="number"
        min={1}
        value={local}
        disabled={disabled}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
        className="w-20 h-8 px-2.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-[#fafaf7] dark:bg-[#0e1310] text-[13px] text-[#1a201c] dark:text-[#e8ece9] text-right focus:outline-none focus:border-[#5a8a6b] disabled:opacity-50"
      />
      {dirty && (
        <button
          onClick={handleSave}
          disabled={disabled}
          className="h-8 px-2.5 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
        >
          Save
        </button>
      )}
    </div>
  );
}
