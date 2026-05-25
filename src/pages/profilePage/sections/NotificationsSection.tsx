import { useState } from "react";
import { Row } from "../components/Row";
import { SectionHeader } from "../components/SectionHeader";
import { Toggle } from "../components/Toggle";

export const NotificationsSection = () => {
  const [notifs, setNotifs] = useState({
    msg: true,
    file: true,
    prop: true,
    weekly: false,
  });

  return (
    <>
      <SectionHeader title="Notifications" desc="What lands in your inbox." />
      <div className="mt-6">
        <Row title="New messages" desc="Email when a client posts a message.">
          <Toggle
            on={notifs.msg}
            onChange={() => setNotifs({ ...notifs, msg: !notifs.msg })}
          />
        </Row>
        <Row title="File uploads & comments">
          <Toggle
            on={notifs.file}
            onChange={() => setNotifs({ ...notifs, file: !notifs.file })}
          />
        </Row>
        <Row title="Proposal activity" desc="Signed, viewed, or commented.">
          <Toggle
            on={notifs.prop}
            onChange={() => setNotifs({ ...notifs, prop: !notifs.prop })}
          />
        </Row>
        <Row title="Weekly digest" desc="A Friday summary of all workspaces.">
          <Toggle
            on={notifs.weekly}
            onChange={() => setNotifs({ ...notifs, weekly: !notifs.weekly })}
          />
        </Row>
      </div>
      <p className="mt-6 text-[12px] text-[#858c87] dark:text-[#6e7672]">
        Notification preferences aren't persisted yet — coming with the
        messaging module.
      </p>
    </>
  );
};
