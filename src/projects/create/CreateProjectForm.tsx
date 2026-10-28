import { toast } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import * as uuid from "uuid";
import * as z from "zod";
import type { CreateProjectRequest } from "@/api-types/CreateProjectRequest";
import type { EncryptionAlgorithm } from "@/api-types/EncryptionAlgorithm";
import type { PasskeyAuthorizationResult } from "@/api-types/PasskeyAuthorizationResult";
import type { Project } from "@/api-types/Project";
import { useAuthorization } from "@/auth/useAuthorization";
import type { ErrorHook } from "@/components/error";
import { SAFE_NAME_SCHEMA } from "@/constants";
import { resolveApiRequest } from "@/utils";
import { PROJECT_LIST_QUERY_KEY } from "../queries";

const createEnvironmentSchema = z.object({
  id: z.string(),
  name: SAFE_NAME_SCHEMA,
  description: z.string(),
});

const ALGORITHMS: EncryptionAlgorithm[] = ["ECC", "KEM", "Hybrid"] as const;

const create_project_schema = z.object({
  name: z.string().min(2),
  description: z.string(),
  algorithm: z
    .string()
    .refine((value) => ALGORITHMS.includes(value as EncryptionAlgorithm)),
  environments: z.array(createEnvironmentSchema).refine((values) => {
    const names = values.map((env) => env.name);

    if (names.length !== new Set(names).size) {
      return false;
    }

    for (const env of values) {
      if (!createEnvironmentSchema.validate(env)) {
        return false;
      }
    }

    return true;
  }),
});

export type CreateProjectFormData = z.infer<typeof create_project_schema>;

export function useCreateProjectForm(path: string | null, error: ErrorHook) {
  const authorize = useAuthorization(error);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      algorithm: "ECC",
      environments: [
        {
          id: uuid.v7(),
          name: "development",
          description: "For testing by developers before moving to QC",
        },
        {
          id: uuid.v7(),
          name: "staging",
          description: "For testing by QAs before promoting to production",
        },
        {
          id: uuid.v7(),
          name: "production",
          description: "Prod secrets, heavily restricted",
        },
      ],
    } satisfies CreateProjectFormData,
    validators: {
      onChange: create_project_schema,
      onMount: create_project_schema,
    },
    onSubmitMeta: {} as { path: string | null },
    onSubmit: async ({
      value: { algorithm, description, environments, name },
    }) => {
      const auth_op = await authorize("project creation");
      if (!auth_op.ok) {
        return;
      }

      const create_op = await error.catch("Error creating project", () =>
        resolveApiRequest<Project>("/api/projects", {
          method: "POST",
          body: JSON.stringify({
            path,
            name,
            algorithm: algorithm as EncryptionAlgorithm,
            description,
            environments,
            auth_response: auth_op.result as PasskeyAuthorizationResult,
          } satisfies CreateProjectRequest),
        }),
      );

      if (!create_op.ok) {
        return;
      }

      toast(`Project '${name}' created successfully!`, { variant: "success" });
      queryClient
        .invalidateQueries({ queryKey: PROJECT_LIST_QUERY_KEY })
        .then(() => navigate(`/p/${create_op.result.id}`));
    },
  });

  return form;
}

export type CreateProjectForm = ReturnType<typeof useCreateProjectForm>;
