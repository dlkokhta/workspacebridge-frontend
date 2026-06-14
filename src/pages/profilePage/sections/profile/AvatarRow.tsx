import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../../../context/AuthContext";
import {
  currentUserKey,
  type UserProfile,
} from "../../../../hooks/useCurrentUser";
import { Row } from "../../components/Row";
import { SmallBtn } from "../../components/SmallBtn";
import { getInitials } from "../../../../utils/getInitials";

const MAX_BYTES = 5 * 1024 * 1024;

// Avatar upload/remove. The backend re-encodes to a square WebP and returns
// the new picture URL (content-hashed for cache-busting), which we write
// straight into the cached profile so the image refreshes immediately.
export const AvatarRow = ({ profile }: { profile: UserProfile }) => {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const setPicture = (picture: string | null) =>
    queryClient.setQueryData<UserProfile>(currentUserKey, (prev) =>
      prev ? { ...prev, picture } : prev,
    );

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const { data } = await axiosInstance.post<{ picture: string }>(
        "/user/me/avatar",
        form,
      );
      return data;
    },
    onSuccess: ({ picture }) => setPicture(picture),
    onError: () => setError("Failed to upload image. Please try again."),
  });

  const remove = useMutation({
    mutationFn: () => axiosInstance.delete("/user/me/avatar"),
    onSuccess: () => setPicture(null),
    onError: () => setError("Failed to remove avatar. Please try again."),
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the same file be re-selected later
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be under 5 MB.");
      return;
    }
    upload.mutate(file);
  };

  const busy = upload.isPending || remove.isPending;

  return (
    <div>
      <Row title="Avatar" desc="A square image, at least 200×200. Max 5 MB.">
        {profile.picture ? (
          <img
            src={profile.picture}
            alt="avatar"
            className="w-14 h-14 rounded-lg object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-[#5a8a6b] text-white flex items-center justify-center text-[18px] font-semibold">
            {getInitials(profile)}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
        <SmallBtn onClick={() => inputRef.current?.click()} disabled={busy}>
          {upload.isPending ? "Uploading…" : "Change"}
        </SmallBtn>
        {profile.picture && (
          <SmallBtn
            variant="danger"
            onClick={() => remove.mutate()}
            disabled={busy}
          >
            Remove
          </SmallBtn>
        )}
      </Row>
      {error && <p className="text-[12px] text-red-500 -mt-3 pb-4">{error}</p>}
    </div>
  );
};
