import { Users } from "lucide-react";
import { Row } from "../components/Row";
import { SectionHeader } from "../components/SectionHeader";
import { SmallBtn } from "../components/SmallBtn";

export const WorkspaceSection = () => (
  <>
    <SectionHeader title="Workspace" desc="Settings for your active workspace." />
    <div className="mt-6">
      <Row title="Workspace name">
        <input
          defaultValue="Northwind Studio"
          className="w-[240px] h-[42px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
        />
      </Row>
      <Row title="Description">
        <input
          defaultValue="Brand identity · Q3 2026"
          className="w-[240px] h-[42px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
        />
      </Row>
      <Row title="Members" desc="Invite collaborators or remove access.">
        <SmallBtn disabled title="Coming soon">
          <Users size={13} /> Manage (2)
        </SmallBtn>
      </Row>
      <Row title="Archive workspace" desc="Read-only mode. You can restore anytime.">
        <SmallBtn variant="outline" disabled title="Coming soon">
          Archive
        </SmallBtn>
      </Row>
      <Row title="Delete workspace" desc="Permanently removes all messages, files, and proposals.">
        <SmallBtn variant="danger" disabled title="Coming soon">
          Delete
        </SmallBtn>
      </Row>
    </div>
    <p className="mt-6 text-[12px] text-[#858c87] dark:text-[#6e7672]">
      Workspaces aren't built into the backend yet — these controls are placeholders.
    </p>
  </>
);
