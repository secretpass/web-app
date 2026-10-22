import * as z from "zod";
import { SAFE_NAME_SCHEMA } from "@/constants";
import type { EncryptionAlgorithm } from "@/core";

export const NewEnvironmentItemSchema = z.object({
  name: SAFE_NAME_SCHEMA,
  description: z.string().optional(),
});

export const NewEnvironmentsSchema = z
  .array(NewEnvironmentItemSchema)
  .min(1)
  .refine(
    (items) =>
      new Set(items.map((item) => item.name.toLowerCase())).size ===
      items.length,
  );

export type NewEnvironment = z.infer<typeof NewEnvironmentItemSchema>;

export interface RegistrationState {
  id: string;
  project_name: string;
  description: string;
  algorithm: EncryptionAlgorithm;
  environments: z.infer<typeof NewEnvironmentsSchema>;
  created: string;

  user_id: string;
  user_display_name: string;
  user_email_address: string;

  key_name: string;
}
