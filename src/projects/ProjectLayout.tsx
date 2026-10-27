import {
  IconHome,
  IconShieldHalfFilled,
  type ReactNode,
} from "@tabler/icons-react";
import { useParams } from "react-router";
import { ErrorDisplay } from "@/components";
import {
  BreadCrumbPageHeader,
  type HeaderItem,
} from "@/components/sections/header";
import { Shimmer } from "@/components/shimmer";
import { useProjectQuery } from "./queries";

interface ProjectLayoutProps {
  children: ReactNode;
  links: HeaderItem[];
  actions?: ReactNode;
  description?: ReactNode;
}

export function ProjectLayout({
  children,
  links,
  actions,
  description,
}: ProjectLayoutProps) {
  const { project_id } = useParams<{ project_id: string }>();
  const result = useProjectQuery(project_id || "");

  return (
    <main className="content container mx-auto">
      <Shimmer
        className="h-12 w-full"
        active={result.isPending}
        hidden={result.isError}
      >
        <BreadCrumbPageHeader
          items={[
            { Icon: IconHome, to: "/", label: "Home" },
            {
              Icon: IconShieldHalfFilled,
              to: `/p/${project_id}`,
              label: result.data?.project.name ?? "Project not found",
            },
            ...links,
          ]}
          description={description}
        >
          {!!result.data && actions}
        </BreadCrumbPageHeader>
      </Shimmer>

      {result.isError && (
        <ErrorDisplay
          value={{
            title: "Error loading project",
            content: result.error.message,
          }}
        />
      )}

      <Shimmer
        className="h-32"
        active={result.isPending}
        hidden={result.isError}
      >
        {children}
      </Shimmer>
    </main>
  );
}
