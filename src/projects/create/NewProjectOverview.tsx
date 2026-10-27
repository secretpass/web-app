import { Description, Input, Label, TextArea, TextField } from "@heroui/react";
import type { CreateProjectForm } from "./CreateProjectForm";

export function ProjectOverview({ form }: { form: CreateProjectForm }) {
  return (
    <div className="flex flex-col gap-6 grow">
      <form.Field name="name">
        {(field) => (
          <TextField isRequired>
            <Label htmlFor="name">Project Name</Label>
            <Description>
              If changed later, previous passkeys will still show the previous
              name
            </Description>
            <Input
              name="name"
              placeholder="My Top Secret Project"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </TextField>
        )}
      </form.Field>

      <form.Field name="description">
        {(field) => (
          <TextField>
            <Label htmlFor="description">Description</Label>
            <TextArea
              name="description"
              placeholder="A brief description of the project"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </TextField>
        )}
      </form.Field>
    </div>
  );
}
