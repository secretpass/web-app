import { useForm } from "@tanstack/react-form";
import * as uuid from "uuid";
import * as z from "zod";
import type { EncryptionAlgorithm } from "@/api-types/EncryptionAlgorithm";
import { SAFE_NAME_SCHEMA } from "@/constants";

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

export function useCreateProjectForm() {
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
    },
    onSubmitMeta: {} as { path: string | null },
    onSubmit: async (data) => {
      console.log(data);
    },
  });

  return form;
}

export type CreateProjectForm = ReturnType<typeof useCreateProjectForm>;
