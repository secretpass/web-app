import { Description, Label, Radio, RadioGroup } from "@heroui/react";
import { ENCRYPTION_ALGORITHMS } from "@/constants";
import type { CreateProjectForm } from "./CreateProjectForm";

export function NewProjectAlgorithm({ form }: { form: CreateProjectForm }) {
  return (
    <form.Field name="algorithm">
      {(field) => (
        <RadioGroup
          isRequired
          value={field.state.value}
          onChange={(value) => field.handleChange(value)}
          aria-label="Encryption Algorithm"
        >
          <Label>Encryption Algorithm</Label>
          <Description>The algorithm used to secure your secrets.</Description>

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
  );
}
