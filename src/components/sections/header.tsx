import { Breadcrumbs, Description } from "@heroui/react";
import type { TablerIcon } from "@tabler/icons-react";
import clsx from "clsx";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";

export interface SectionHeaderProps {
  className?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  breadcrumbs?: ReactNode;
}

export function PageHeader({
  className,
  title,
  children,
  description,
}: SectionHeaderProps) {
  return (
    <div
      className={clsx(
        "flex items-end mt-8 mb-4 border-b gap-4 py-2",
        className,
      )}
    >
      <div className="flex flex-col">
        <h3 className="text-4xl pt-4">{title}</h3>
        {description && <Description>{description}</Description>}
      </div>
      <div className="grow" />
      {children}
    </div>
  );
}

export function SectionHeader({
  className,
  title,
  children,
  description,
}: SectionHeaderProps) {
  return (
    <div
      className={clsx(
        "flex items-end mt-6 mb-4 border-b gap-4 py-2",
        className,
      )}
    >
      <div className="flex flex-col">
        <h3 className="text-2xl font-light pt-4">{title}</h3>
        {description && <Description>{description}</Description>}
      </div>
      <div className="grow" />
      {children}
    </div>
  );
}

export interface BreadCrumbHeaderProps
  extends Omit<SectionHeaderProps, "title"> {
  items: HeaderItem[];
}

export interface HeaderItem {
  Icon: TablerIcon;
  to: string;
  label: ReactNode;
}

export function BreadCrumbPageHeader({
  className,
  items,
  description,
  children,
}: BreadCrumbHeaderProps) {
  return (
    <div
      className={clsx(
        "flex items-end mt-8 mb-4 border-b gap-4 py-2 ",
        className,
      )}
    >
      <div className="flex flex-col gap-4 flex-wrap">
        <Breadcrumbs>
          {items.map((item) => (
            <HeaderItemComponent key={item.to} {...item} />
          ))}
        </Breadcrumbs>
        {description && (
          <Description className="text-base">{description}</Description>
        )}
      </div>
      <div className="grow" />
      {children}
    </div>
  );
}

function HeaderItemComponent({ Icon, to, label }: HeaderItem) {
  return (
    <Breadcrumbs.Item>
      <Link to={to} className="flex items-center gap-2">
        <Icon className="size-4" />
        <span className="text-base">{label}</span>
      </Link>
    </Breadcrumbs.Item>
  );
}
