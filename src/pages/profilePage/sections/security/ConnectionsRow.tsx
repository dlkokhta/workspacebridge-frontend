import { useState } from "react";
import { Check, KeyRound, Link2Off } from "lucide-react";
import { SmallBtn } from "../../components/SmallBtn";
import { useSignInMethods } from "./useSignInMethods";

interface ConnectionsRowProps {
  onSuccess: (message: string) => void;
}

const extractApiMessage = (err: unknown): string | null =>
  (err as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? null;

const titleCase = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

// Lists how the account can sign in (password + linked OAuth providers) and
// lets the user add a password or disconnect a provider — never removing the
// last remaining method.
export const ConnectionsRow = ({ onSuccess }: ConnectionsRowProps) => {
  const [open, setOpen] = useState(false);
  const [showSetForm, setShowSetForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { query, setPassword, disconnectProvider } = useSignInMethods(open);

  const data = query.data;
  const methodCount = data
    ? (data.hasPassword ? 1 : 0) + data.providers.length
    : 0;

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await setPassword.mutateAsync(newPassword);
      setShowSetForm(false);
      setNewPassword("");
      onSuccess("Password set — you can now sign in with email and password.");
    } catch (err: unknown) {
      setError(extractApiMessage(err) ?? "Couldn't set a password.");
    }
  };

  return (
    <div className="border-b border-black/[0.06] dark:border-white/[0.05]">
      <div className="flex items-start justify-between gap-6 py-5">
        <div className="flex-1">
          <div className="text-[14px] font-medium text-[#1a201c] dark:text-[#e8ece9] mb-1">
            Sign-in methods
          </div>
          <div className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3] leading-[1.5] max-w-[380px]">
            The ways you can sign in. Keep at least one so you're never locked
            out.
          </div>
        </div>
        <SmallBtn onClick={() => setOpen((v) => !v)}>
          {open ? "Hide" : "Manage"}
        </SmallBtn>
      </div>

      {open && (
        <div className="pb-5 space-y-2 max-w-[520px]">
          {query.isLoading && (
            <p className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
              Loading…
            </p>
          )}
          {query.isError && (
            <p className="text-[13px] text-red-500">
              Couldn't load your sign-in methods.
            </p>
          )}

          {data && (
            <>
              {/* Password */}
              <div className="flex items-center gap-3 px-3.5 py-3 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/[0.04] dark:bg-white/[0.06]">
                  <KeyRound className="h-4 w-4 text-[#5a625e] dark:text-[#a0a8a3]" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[13px] font-medium text-[#1a201c] dark:text-[#e8ece9]">
                    Password
                  </span>
                  <p className="mt-0.5 text-[12px] text-[#5a625e] dark:text-[#a0a8a3]">
                    {data.hasPassword ? "Enabled" : "Not set"}
                  </p>
                </div>
                {data.hasPassword ? (
                  <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#3e6a4d] dark:text-[#6db383]">
                    <Check className="h-3.5 w-3.5" /> On
                  </span>
                ) : (
                  !showSetForm && (
                    <SmallBtn onClick={() => setShowSetForm(true)}>
                      Set a password
                    </SmallBtn>
                  )
                )}
              </div>

              {showSetForm && !data.hasPassword && (
                <form
                  onSubmit={handleSetPassword}
                  className="flex gap-2 pl-1 pt-1"
                >
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    autoComplete="new-password"
                    className="h-9 flex-1 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] px-3 text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#858c87] outline-none focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20"
                  />
                  <SmallBtn
                    variant="primary"
                    type="submit"
                    disabled={setPassword.isPending}
                  >
                    {setPassword.isPending ? "Saving…" : "Save"}
                  </SmallBtn>
                </form>
              )}

              {/* Providers */}
              {data.providers.map((provider) => {
                const canDisconnect = data.hasPassword || methodCount > 1;
                const busy =
                  disconnectProvider.isPending &&
                  disconnectProvider.variables === provider;
                return (
                  <div
                    key={provider}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17]"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[13px] font-semibold text-[#5a625e] dark:text-[#a0a8a3]">
                      {titleCase(provider).charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[13px] font-medium text-[#1a201c] dark:text-[#e8ece9]">
                        {titleCase(provider)}
                      </span>
                      <p className="mt-0.5 text-[12px] text-[#5a625e] dark:text-[#a0a8a3]">
                        Connected
                      </p>
                    </div>
                    <SmallBtn
                      variant="danger"
                      disabled={!canDisconnect || busy}
                      title={
                        canDisconnect
                          ? undefined
                          : "Set a password before disconnecting your only method"
                      }
                      onClick={() =>
                        disconnectProvider.mutate(provider, {
                          onSuccess: () =>
                            onSuccess(`${titleCase(provider)} disconnected.`),
                        })
                      }
                    >
                      <Link2Off size={13} />
                      {busy ? "…" : "Disconnect"}
                    </SmallBtn>
                  </div>
                );
              })}

              {(error || disconnectProvider.isError) && (
                <p className="text-[12px] text-red-500">
                  {error ?? "Couldn't disconnect. Please try again."}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
