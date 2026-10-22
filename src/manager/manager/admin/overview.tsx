import { Description, Input, Label, TextArea, TextField } from "@heroui/react";

export function ProjectOverview() {
  return (
    <div className="px-4 h-full w-2/3 relative overflow-y-auto">
      <div className="flex justify-between items-start mt-6">
        <div className="text-2xl font-bold">Project Overview</div>
      </div>
      <Description className="mt-1">Basic project details</Description>
      <hr className="my-4" />

      <TextField className={"mt-6"}>
        <Label htmlFor="id">Project Id</Label>
        <Input name="id" variant="secondary" disabled spellCheck={false} />
      </TextField>

      <TextField className={"mt-6"}>
        <Label htmlFor="name">Project Name</Label>
        <Input
          disabled
          name="name"
          variant="secondary"
          placeholder="My Top Secret Project"
        />
      </TextField>

      <TextField className={"mt-6"}>
        <Label htmlFor="description">Description</Label>
        <TextArea
          disabled
          name="description"
          variant="secondary"
          placeholder="A brief description of the project"
        />
      </TextField>
      <TextField className="mt-6" aria-label="Encryption Algorithm">
        <Label>Encryption Algorithm</Label>
        <Input
          disabled
          name="name"
          variant="secondary"
          placeholder="My Top Secret Project"
        />
        <Description className="font-semibold mb-1">
          The description goes here
        </Description>
      </TextField>
    </div>
  );
}
