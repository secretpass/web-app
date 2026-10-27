import { Description, Radio, RadioGroup } from "@heroui/react";
import { SectionHeader } from "@/components/sections/header";
import { ENCRYPTION_ALGORITHMS } from "@/constants";
import type { CreateProjectForm } from "./CreateProjectForm";

export function NewProjectAlgorithm({ form }: { form: CreateProjectForm }) {
  return (
    <div>
      <SectionHeader
        title="Encryption Algorithm"
        description="The algorithm used to secure your secrets."
      />
      <form.Field name="algorithm">
        {(field) => (
          <RadioGroup
            isRequired
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-4"
            value={field.state.value}
            onChange={(value) => field.handleChange(value)}
            aria-label="Encryption Algorithm"
          >
            {ENCRYPTION_ALGORITHMS.map((def) => (
              <Radio
                className="p-2 rounded-lg flex flex-col gap-2 bg-gray-200 data-[selected=true]:bg-gray-300 dark:bg-gray-700 dark:data-[selected=true]:bg-gray-800"
                value={def.value}
                aria-label={def.label}
                key={def.value}
                id={def.value}
              >
                <Radio.Content aria-label={def.label}>
                  <Radio.Control className="mx-2" aria-label={def.label}>
                    <Radio.Indicator aria-label={def.label} />
                  </Radio.Control>
                  <div className="flex flex-col gap-0.5">
                    {def.label}
                    <Description>{def.description}</Description>
                  </div>
                </Radio.Content>
              </Radio>
            ))}
          </RadioGroup>
        )}
      </form.Field>
    </div>
  );
}
