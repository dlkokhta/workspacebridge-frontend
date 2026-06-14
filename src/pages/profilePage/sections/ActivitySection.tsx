import { SectionHeader } from "../components/SectionHeader";
import { SmallBtn } from "../components/SmallBtn";
import { ActivityRow } from "./activity/ActivityRow";
import { useActivity } from "./activity/useActivity";

export const ActivitySection = () => {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useActivity();

  const events = data?.pages.flatMap((page) => page.items) ?? [];
  const empty = !isLoading && !isError && events.length === 0;

  return (
    <>
      <SectionHeader
        title="Activity"
        desc="Recent security activity on your account — sign-ins, new devices and account changes."
      />

      <div className="mt-6">
        {isLoading && (
          <p className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
            Loading…
          </p>
        )}
        {isError && (
          <p className="text-[13px] text-red-500">
            Failed to load your activity. Please try again.
          </p>
        )}
        {empty && (
          <p className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
            No activity yet.
          </p>
        )}

        {events.map((event) => (
          <ActivityRow key={event.id} event={event} />
        ))}

        {hasNextPage && (
          <div className="pt-4">
            <SmallBtn
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "Loading…" : "Load more"}
            </SmallBtn>
          </div>
        )}
      </div>
    </>
  );
};
