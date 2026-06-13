import { useState } from "react";
import { browserSupportsWebAuthn } from "@simplewebauthn/browser";
import { Fingerprint, KeyRound, Plus, Trash2 } from "lucide-react";
import { SmallBtn } from "../../components/SmallBtn";
import { formatRelative } from "./sessionUtils";
import { usePasskeys, type Passkey } from "./usePasskeys";

interface PasskeysRowProps {
  onSuccess: (message: string) => void;
}

const extractApiMessage = (err: unknown): string | null =>
  (err as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? null;

const passkeyLabel = (pk: Passkey): string =>
  pk.name?.trim() || (pk.backedUp ? "Synced passkey" : "Device passkey");

// Lets the user enrol and manage WebAuthn passkeys. A passkey signs them in
// with their device biometric/PIN and skips the password + 2FA steps entirely.
export const PasskeysRow = ({ onSuccess }: PasskeysRowProps) => {
  const supported = browserSupportsWebAuthn();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { query, addPasskey, removePasskey } = usePasskeys(open);

  const passkeys = query.data ?? [];

  const handleAdd = async () => {
    setError(null);
    try {
      await addPasskey.mutateAsync(name);
      setName("");
      onSuccess("Passkey added.");
    } catch (err: unknown) {
      // The user dismissed the native prompt — not worth a loud error.
      const name = (err as { name?: string })?.name;
      if (name === "NotAllowedError" || name === "AbortError") return;
      if (name === "InvalidStateError") {
        setError("This device already has a passkey for your account.");
        return;
      }
      setError(
        extractApiMessage(err) ?? "Could not add passkey. Please try again.",
      );
    }
  };

  return (
    <div className="border-b border-black/[0.06] dark:border-white/[0.05]">
      <div className="flex items-start justify-between gap-6 py-5">
        <div className="flex-1">
          <div className="text-[14px] font-medium text-[#1a201c] dark:text-[#e8ece9] mb-1">
            Passkeys
          </div>
          <div className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3] leading-[1.5] max-w-[380px]">
            Sign in with your device fingerprint, face, or PIN — no password or
            2FA code needed.
          </div>
        </div>
        <SmallBtn onClick={() => setOpen((v) => !v)}>
          {open ? "Hide" : "Manage"}
        </SmallBtn>
      </div>

      {open && (
        <div className="pb-5 space-y-2 max-w-[520px]">
          {!supported && (
            <p className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
              This browser doesn't support passkeys.
            </p>
          )}

          {query.isLoading && (
            <p className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
              Loading passkeys…
            </p>
          )}
          {query.isError && (
            <p className="text-[13px] text-red-500">
              Could not load your passkeys.
            </p>
          )}
          {query.isSuccess && passkeys.length === 0 && (
            <p className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
              No passkeys yet. Add one to sign in faster.
            </p>
          )}

          {passkeys.map((pk) => {
            const removingThis =
              removePasskey.isPending && removePasskey.variables === pk.id;
            return (
              <div
                key={pk.id}
                className="flex items-center gap-3 px-3.5 py-3 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/[0.04] dark:bg-white/[0.06]">
                  <Fingerprint className="h-4 w-4 text-[#5a625e] dark:text-[#a0a8a3]" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[13px] font-medium text-[#1a201c] dark:text-[#e8ece9]">
                    {passkeyLabel(pk)}
                  </span>
                  <p className="mt-0.5 text-[12px] text-[#5a625e] dark:text-[#a0a8a3]">
                    Added {formatRelative(pk.createdAt)}
                    {pk.lastUsedAt
                      ? ` · last used ${formatRelative(pk.lastUsedAt)}`
                      : " · never used"}
                  </p>
                </div>
                <SmallBtn
                  variant="danger"
                  disabled={removingThis}
                  onClick={() =>
                    removePasskey.mutate(pk.id, {
                      onSuccess: () => onSuccess("Passkey removed."),
                    })
                  }
                >
                  <Trash2 size={13} />
                  {removingThis ? "…" : "Remove"}
                </SmallBtn>
              </div>
            );
          })}

          {(removePasskey.isError || error) && (
            <p className="text-[12px] text-red-500">
              {error ?? "Failed to remove passkey. Please try again."}
            </p>
          )}

          {supported && (
            <div className="flex gap-2 pt-1">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                placeholder="Name (optional, e.g. MacBook)"
                className="h-8 flex-1 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] px-3 text-[12px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#858c87] dark:placeholder-[#6e7672] outline-none focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20"
              />
              <SmallBtn
                variant="primary"
                disabled={addPasskey.isPending}
                onClick={() => void handleAdd()}
              >
                {addPasskey.isPending ? (
                  <>
                    <KeyRound size={13} />
                    Waiting…
                  </>
                ) : (
                  <>
                    <Plus size={13} />
                    Add passkey
                  </>
                )}
              </SmallBtn>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
