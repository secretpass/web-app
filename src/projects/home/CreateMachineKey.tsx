import {
  Button,
  Description,
  IconPlus,
  Input,
  Label,
  Modal,
  TextArea,
  TextField,
} from "@heroui/react";
import { IconFingerprint } from "@tabler/icons-react";
import { useCallback, useState } from "react";
import type { CreateMachinePublicKeyRequest } from "@/api-types/CreateMachinePublicKeyRequest";
import type { GetEnvironmentResult } from "@/api-types/GetEnvironmentResult";
import type { PasskeyAuthorizationResult } from "@/api-types/PasskeyAuthorizationResult";
import { useDecryptionParams } from "@/auth/useAuthorization";
import {
  Alert,
  CommandDisplay,
  ErrorDisplay,
  Select,
  useError,
} from "@/components";
import { SimpleMono } from "@/components/command";
import { OPERATION_MODE } from "@/constants";
import {
  type ContributorPublicKey,
  type ContributorSecretValue,
  generate_machine_key,
} from "@/core";
import { resolveApiRequest } from "@/utils";
import { useProjectQuery } from "../queries";

export interface CreateMachineKeyProps {
  project_id: string;
}

export function CreateMachineKeyDialog({ project_id }: CreateMachineKeyProps) {
  const error = useError();
  const [open, setOpen] = useState(false);
  const [private_key, setPrivateKey] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [environments, setEnvironments] = useState<string[]>([]);
  const project_query = useProjectQuery(project_id);
  const get_params = useDecryptionParams(error);

  const generateKey = useCallback(async () => {
    if (!project_query.isSuccess) {
      return;
    }

    const params_op = await get_params("key generation");
    if (!params_op.ok) {
      return;
    }

    const env_ops = await error.catch(
      "Error fetching environment details",
      () =>
        Promise.all(
          environments.map((env_name) =>
            resolveApiRequest<GetEnvironmentResult>(
              `/api/projects/${project_id}/env/${env_name}`,
            ),
          ),
        ),
    );
    if (!env_ops.ok) {
      return;
    }

    const encrypted_secrets: [ContributorPublicKey, ContributorSecretValue][] =
      [];
    for (const env_result of env_ops.result) {
      for (const secret of env_result.secrets) {
        const secret_values = secret.contributor_values.filter(
          ([_, value]) => value.tag === "latest",
        );
        encrypted_secrets.push(
          ...(secret_values as [
            ContributorPublicKey,
            ContributorSecretValue,
          ][]),
        );
      }
    }

    const generate_op = await error.catch("Error generating private key", () =>
      generate_machine_key({
        encrypted_secrets,
        algorithm: project_query.data.project.algorithm,
        project_id: project_query.data.project.id,
        auth_request: params_op.result,
      }),
    );

    if (!generate_op.ok) {
      return;
    }

    const save_op = await error.catch("Error saving private key", () =>
      resolveApiRequest(`/api/projects/${project_id}/machines`, {
        method: "POST",
        body: JSON.stringify({
          auth_response: generate_op.result
            .auth_response as PasskeyAuthorizationResult,
          description,
          name,
          environments,
          machine_secrets: generate_op.result.machine_secrets,
          public_key: generate_op.result.public_key,
        } satisfies CreateMachinePublicKeyRequest),
      }),
    );

    if (!save_op.ok) {
      return;
    }

    setPrivateKey(generate_op.result.private_key);
  }, [
    get_params,
    project_query,
    environments,
    error.catch,
    project_id,
    description,
    name,
  ]);

  return (
    <Modal isOpen={open} onOpenChange={setOpen}>
      <Button variant="ghost">
        <IconPlus />
        Generate Key
      </Button>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="w-full max-w-xl">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Generate machine private key</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <form
                className="flex flex-col gap-6 my-6"
                onSubmit={(evt) => {
                  evt.preventDefault();
                  generateKey();
                }}
              >
                <TextField
                  isRequired
                  variant="secondary"
                  isDisabled={private_key !== null}
                >
                  <Label>Key Name</Label>
                  <Input
                    value={name}
                    onChange={(evt) => setName(evt.currentTarget.value)}
                    placeholder="Key name..."
                  />
                  <Description>
                    Provide a name that can help easily identify this key and
                    it's purpose
                  </Description>
                </TextField>

                <TextField
                  variant="secondary"
                  isDisabled={private_key !== null}
                >
                  <Label>Description</Label>
                  <TextArea
                    value={description}
                    onChange={(evt) => setDescription(evt.currentTarget.value)}
                    placeholder="Describe me..."
                    className="field-sizing-content max-h-16"
                  />
                  <Description>
                    (optional) - additional details about this key
                  </Description>
                </TextField>
                {project_query.isSuccess && (
                  <Select<string[]>
                    disabled={private_key !== null}
                    multiselect
                    label="Environments"
                    items={project_query.data.environments.map((env) => ({
                      label: env.name,
                      value: env.name,
                    }))}
                    value={environments}
                    onChange={setEnvironments}
                    description="Select at least one environment that this private key can access"
                    variant="secondary"
                    placeholder="Select environments..."
                  />
                )}
                <ErrorDisplay value={error.value} />

                {private_key !== null && (
                  <Alert
                    title="Congratulations!"
                    status="success"
                    className="shadow-none bg-background"
                  >
                    <div className="flex flex-col gap-4">
                      <p>
                        Copy the private key below, this key cannot be displayed
                        again once this dialog is closed.
                      </p>
                      <SimpleMono
                        className="wrap-break-word"
                        value={private_key}
                      />
                      <p>
                        You can now run commands or export secrets with this
                        key.
                      </p>
                      <SimpleMono
                        className="wrap-break-word"
                        value={`spass ${OPERATION_MODE.toLowerCase()} run --private-key=${private_key} --env=${environments[0]} -- your command here`}
                      />
                      <SimpleMono
                        className="wrap-break-word"
                        value={`spass ${OPERATION_MODE.toLowerCase()} export --private-key=${private_key} --env=${environments[0]}{" "} --format=[json/dot-env]`}
                      />
                    </div>
                  </Alert>
                )}
                {private_key === null && (
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      isDisabled={environments.length === 0 || !name}
                    >
                      <IconFingerprint className="size-5" /> Generate Key
                    </Button>
                  </div>
                )}
              </form>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
