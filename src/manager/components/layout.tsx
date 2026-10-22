import { Card, IconChevronDown, IconChevronUp } from "@heroui/react";
import { IconUser, IconUserShield, type TablerIcon } from "@tabler/icons-react";
import clsx from "clsx";
import { Activity, type ReactNode } from "react";

export interface DashboardLayoutProps {
  Icon: TablerIcon;
  title: string;
  chips: ReactNode;
  tabs?: ReactNode;
  children: ReactNode;
}

export function DashboardLayout({
  Icon,
  title,
  chips,
  children,
  tabs,
}: DashboardLayoutProps) {
  const is_active = true;
  return (
    <Card
      className={clsx(
        "container group mx-auto my-2 transition-all duration-700 ease-in-out relative",
        is_active && "dashboard-active",
        !is_active &&
          "dashboard-inactive hover:bg-background-secondary cursor-pointer group",
      )}
    >
      <Card.Header className="sticky top-0">
        <Card.Title
          className={clsx(
            "flex justify-between",
            is_active && "items-end",
            !is_active && "gap-4 items-center",
          )}
        >
          <div
            className={clsx(
              "grow flex gap-1 text-xl items-center select-none",
              is_active && "border-b py-1",
            )}
          >
            <Icon />
            {title}
            {is_active && (
              <>
                - <span className="text-muted">Project Name</span>
              </>
            )}
          </div>
          {!is_active && (
            <>
              {chips}
              <IconChevronUp className="group-first:hidden" />
              <IconChevronDown className="group-last:hidden" />
            </>
          )}

          <Activity mode={is_active ? "visible" : "hidden"}>
            {tabs}
            <div
              className={clsx(
                "flex px-4 gap-2 items-center py-1 border-b bg-background",
              )}
            >
              {/* {manager.user.level === "Standard" && <IconUser />} */}
              {/* {manager.user.level === "Admin" && <IconUserShield />} */}
              <div className="flex flex-col text-sm">
                {/* {manager.user.name} */}
                <span className="text-muted text-xs">
                  {/* {manager.user.username} */}
                </span>
              </div>
            </div>
          </Activity>
        </Card.Title>
      </Card.Header>
      <Activity mode={is_active ? "visible" : "hidden"}>
        <Card.Content className="dashboard-content-height">
          {children}
        </Card.Content>
      </Activity>
    </Card>
  );
}
