import { Button, Modal } from "@heroui/react";
import { IconFingerprint, IconTerminal2 } from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useDecryptionParams } from "@/auth/useAuthorization";
import { Alert, ErrorDisplay, Select, useError } from "@/components";
import { SimpleMono } from "@/components/command";
import { Shimmer } from "@/components/shimmer";
import {
  type ContributorPublicKey,
  type ContributorSecretValue,
  reencrypt_package,
  type SimpleMachinePublicKey,
} from "@/core";
import { useProjectsListQuery } from "@/projects";
import { useEnvironmentQuery } from "@/projects/environments/queries";
import { useProjectQuery } from "@/projects/queries";
import { isSafari } from "@/utils";

interface EncryptionDetails {
  public_key: SimpleMachinePublicKey;
  command: string | null;
}

export function RunnerDialog() {
  const error = useError();
  const queryClient = useQueryClient();
  const get_decrypt_params = useDecryptionParams(error);
  const [params, setSearchParams] = useSearchParams();
  const port = useMemo(
    () => parseInt(params.get("target") || "0", 10),
    [params],
  );

  const [injected, setInjected] = useState(false);

  const details_query = useQuery({
    queryKey: ["command-details"],
    queryFn: async (): Promise<EncryptionDetails> => {
      const response = await fetch(`https://localhost:${port}/details`, {
        mode: "cors",
      });
      if (!response.ok) {
        return Promise.reject(response.text);
      }
      const details: EncryptionDetails = await response.json();
      return details;
    },
    enabled: port > 0,
    retryDelay: 200,
  });

  const [project_id, setProjectId] = useState<string | undefined>(undefined);
  const [env_name, setEnvName] = useState<string | undefined>(undefined);

  const projects = useProjectsListQuery();
  const project = useProjectQuery(project_id);
  const environment = useEnvironmentQuery(project_id, env_name);

  const closeDialog = useCallback(async () => {
    setSearchParams({}, { replace: true });
    queryClient.resetQueries({ queryKey: ["command-details"] });
    error.reset();
  }, [setSearchParams, queryClient.resetQueries, error.reset]);

  const injectSecrets = useCallback(async () => {
    if (!environment.isSuccess || !details_query.isSuccess) {
      return;
    }

    const params_op = await get_decrypt_params("secret decryption", {
      capture: "inject_secrets_challenge",
    });
    if (!params_op.ok) {
      return;
    }

    const encrypted_secrets: [ContributorPublicKey, ContributorSecretValue][] =
      [];
    for (const secret of environment.data.secrets) {
      const secret_values = secret.contributor_values.filter(
        ([_, value]) => value.tag === "latest",
      );
      encrypted_secrets.push(
        ...(secret_values as [ContributorPublicKey, ContributorSecretValue][]),
      );
    }

    const reencrypt_op = await error.catch(
      "Error decrypting secrets for injection",
      () =>
        reencrypt_package({
          auth_request: params_op.result,
          contributor_keys: [],
          machine_keys: [details_query.data.public_key],
          encrypted_secrets,
        }),
    );

    if (!reencrypt_op.ok) {
      return;
    }

    const secrets_package: Record<string, string> = {};
    for (const value of reencrypt_op.result.machines_values) {
      secrets_package[value.name] = value.encrypted_value;
    }

    const inject_op = await error.catch(
      "Error transmitting secrets to spass cli",
      async () => {
        const response = await fetch(`https://localhost:${port}/commit`, {
          method: "POST",
          mode: "cors",
          body: JSON.stringify(secrets_package),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          return Promise.reject(response.text);
        }
      },
    );

    if (inject_op.ok) {
      setInjected(true);
    }
  }, [environment, get_decrypt_params, error.catch, details_query, port]);

  return (
    <Modal isOpen={port > 0}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="w-full max-w-2xl">
            <Modal.Header
              className={clsx(
                "flex-row mb-6",
                details_query.data?.command ? "items-start" : "items-center",
              )}
            >
              <Modal.Icon>
                <IconTerminal2 className="size-6" />
              </Modal.Icon>
              <Modal.Heading className="flex flex-col grow">
                <Shimmer
                  active={details_query.isPending}
                  hidden={details_query.isError}
                  className="h-8"
                >
                  {!!details_query.data?.command && "Run Command"}
                  {!details_query.data?.command && "Export Secrets"}
                </Shimmer>
                {details_query.isError && (
                  <span className="text-danger">
                    Error reading command details
                  </span>
                )}
                {!!details_query.data?.command && (
                  <div className="font-mono text-sm text-yellow-700">
                    {details_query.data.command}
                  </div>
                )}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-6">
              <Shimmer
                active={projects.isPending || details_query.isPending}
                hidden={!details_query.isEnabled || details_query.isError}
                className="h-12"
              >
                {projects.isSuccess && (
                  <>
                    <Select
                      required
                      disabled={injected}
                      variant="secondary"
                      value={project_id ?? ""}
                      label="Project"
                      description="Select the project to inject secrets from"
                      onChange={setProjectId}
                      placeholder="Select Project..."
                      items={projects.data.projects.map((project) => ({
                        label: project.project.name,
                        value: project.project.id,
                      }))}
                    />
                    {projects.data.projects.length === 0 && (
                      <Alert
                        className="bg-background shadow-none"
                        status="danger"
                        title={`No projects found`}
                      >
                        There're no projects associated with your profile,
                        cancel and create a project, then retry.
                      </Alert>
                    )}
                  </>
                )}
                {projects.error && (
                  <Alert
                    className="bg-background shadow-none"
                    status="danger"
                    title={`Error loading projects`}
                  >
                    {projects.error.message}
                  </Alert>
                )}
              </Shimmer>

              <Shimmer
                active={project.isEnabled && project.isPending}
                hidden={!project.isEnabled || !projects.isSuccess}
                className="h-6"
              >
                {project.isSuccess && (
                  <>
                    <Select
                      required
                      disabled={injected}
                      variant="secondary"
                      value={env_name ?? ""}
                      label="Environment"
                      description="Select the environment to inject secret from"
                      onChange={setEnvName}
                      placeholder="Select Environment..."
                      items={project.data.environments.map((env) => ({
                        label: env.name,
                        value: env.name,
                      }))}
                    />
                    {project.data.environments.length === 0 && (
                      <Alert
                        className="bg-background shadow-none"
                        status="danger"
                        title={`No environments found`}
                      >
                        There're no environments associated with your profile in
                        the selected project, cancel and create add
                        environments, then retry.
                      </Alert>
                    )}
                  </>
                )}
                {project.error && (
                  <Alert
                    className="bg-background shadow-none"
                    status="danger"
                    title={`Error loading project details`}
                  >
                    {project.error.message}
                  </Alert>
                )}
              </Shimmer>
              <Shimmer
                active={environment.isEnabled && environment.isPending}
                hidden={!environment.isEnabled || environment.isSuccess}
              >
                {environment.error && (
                  <Alert
                    className="bg-background shadow-none"
                    status="danger"
                    title={`Error loading ${env_name}`}
                  >
                    {environment.error.message}
                  </Alert>
                )}
              </Shimmer>

              {details_query.isSuccess && !injected && (
                <Alert
                  title="How it works!"
                  className="bg-background shadow-none"
                >
                  <ul className="list-disc pl-5">
                    <li>
                      You'll use your passkey to decrypt secrets then encrypt
                      them with a one time <SimpleMono value="spass cli" />{" "}
                      public key
                    </li>
                    <li>
                      Encrypted secrets will be passed to{" "}
                      <SimpleMono value="spass cli" /> and decrypted
                    </li>
                    <li>
                      {!details_query.data.command && (
                        <>
                          Secrets will be printed to{" "}
                          <SimpleMono value="stdout" /> and can be piped
                          directly to another command or file
                        </>
                      )}
                      {!!details_query.data.command && (
                        <>
                          Secrets will be passed to your command as{" "}
                          <SimpleMono value="environment variables" />
                        </>
                      )}
                    </li>
                  </ul>
                </Alert>
              )}

              {injected && (
                <Alert
                  status="success"
                  title={
                    <>
                      Secrets passed to <SimpleMono value="spass cli" />!
                    </>
                  }
                  className="bg-background shadow-none"
                >
                  You can now close this tab or proceed to perform other
                  operations by closing this dialog
                </Alert>
              )}

              {details_query.isError && (
                <Alert
                  title=""
                  status="danger"
                  className="bg-background shadow-none"
                >
                  We faced an issue attempting to communicate with spass client
                  over{" "}
                  <SimpleMono value={`https://localhost:${port}/details`} />,
                  this is a random endpoint for this command only please ensure
                  the browser has sufficient permissions to communicate with{" "}
                  <SimpleMono value="localhost" />.
                  {isSafari() && (
                    <>
                      <br />
                      <br />
                      For Safari user's, Safari may block local TLS certificates
                      used by secretpass cli. You can fix this by running{" "}
                      <SimpleMono value="spass install-certificates" />
                    </>
                  )}
                </Alert>
              )}
              <ErrorDisplay value={error.value} />
            </Modal.Body>

            <Modal.Footer className="flex justify-between mt-6">
              <Button
                variant={injected ? "primary" : "danger-soft"}
                onClick={closeDialog}
              >
                Close
              </Button>

              {details_query.isSuccess && !injected && (
                <Button
                  isDisabled={
                    project_id === undefined ||
                    env_name === undefined ||
                    error.is_pending
                  }
                  onClick={injectSecrets}
                >
                  <IconFingerprint className="size-5" />
                  Inject Secrets
                </Button>
              )}
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
