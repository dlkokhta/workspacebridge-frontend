export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "bg-[#5a8a6b]/10 text-[#3e6a4d] dark:text-[#6db383] border-[#5a8a6b]/30";
    case "COMPLETED":
      return "bg-[#7a9bbf]/10 text-[#4a6a8a] dark:text-[#7a9bbf] border-[#7a9bbf]/30";
    case "ARCHIVED":
      return "bg-black/[0.04] dark:bg-white/[0.04] text-[#858c87] dark:text-[#6e7672] border-black/[0.08] dark:border-white/[0.07]";
    default:
      return "bg-black/[0.04] dark:bg-white/[0.04] text-[#858c87] dark:text-[#6e7672] border-black/[0.08] dark:border-white/[0.07]";
  }
}

export function getRoleBadgeClass(role: string): string {
  switch (role) {
    case "ADMIN":
      return "bg-[#9b7abf]/10 text-[#7a5a9b] dark:text-[#b89adb] border-[#9b7abf]/30";
    case "FREELANCER":
      return "bg-[#5a8a6b]/10 text-[#3e6a4d] dark:text-[#6db383] border-[#5a8a6b]/30";
    case "CLIENT":
      return "bg-[#7a9bbf]/10 text-[#4a6a8a] dark:text-[#7a9bbf] border-[#7a9bbf]/30";
    default:
      return "bg-black/[0.04] dark:bg-white/[0.04] text-[#858c87] dark:text-[#6e7672] border-black/[0.08] dark:border-white/[0.07]";
  }
}
