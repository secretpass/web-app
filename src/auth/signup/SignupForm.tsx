import { Button, Description, Input, Label, TextField } from "@heroui/react";
import { IconFingerprint } from "@tabler/icons-react";
import { useSelector } from "@tanstack/react-form";
import { type SubmitEventHandler, useCallback } from "react";
import { ErrorDisplay, useError } from "@/components";
import { ConfirmationCodeInput } from "@/components/otp";
import { useSignupForm } from "./SignupFormControl";

export function SignupForm() {
  const error = useError();
  const { started, form } = useSignupForm(error);

  const onSubmit: SubmitEventHandler = useCallback(
    (event) => {
      event.preventDefault();

      form.handleSubmit();
    },
    [form.handleSubmit],
  );

  const email_is_valid = useSelector(
    form.store,
    (state) => state.fieldMeta["profile.email"]?.isValid,
  );

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <form.Field name="profile.name">
        {(field) => (
          <TextField
            isRequired
            variant="secondary"
            isReadOnly={started}
            isInvalid={!field.state.meta.isValid && field.state.meta.isTouched}
          >
            <Label htmlFor="id">Fullname</Label>
            <Input
              autoComplete="name"
              spellCheck={false}
              type="text"
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <Description>
              Your full name, or a screen name{" "}
              <i>(we don't mind, your boss might)</i>
            </Description>
          </TextField>
        )}
      </form.Field>
      <form.Field name="profile.email">
        {(field) => (
          <TextField
            isRequired
            variant="secondary"
            isReadOnly={started}
            isInvalid={!field.state.meta.isValid && field.state.meta.isTouched}
          >
            <Label htmlFor="id">Work email</Label>
            <Input
              autoComplete={"email"}
              spellCheck={false}
              type="email"
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <Description>
              This email will be associated as the username in projects. You can
              have multiple passkeys under the same email in different devices.
            </Description>
          </TextField>
        )}
      </form.Field>

      {started && (
        <form.Field name="confirmation.passkey_name">
          {(field) => (
            <TextField
              isInvalid={
                !field.state.meta.isValid && field.state.meta.isTouched
              }
              variant="secondary"
              isRequired
            >
              <Label>Passkey Name</Label>
              <Input
                type="text"
                name={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <Description>
                Since your account can have multiple passkeys, git this one a
                name to distinguish it
              </Description>
            </TextField>
          )}
        </form.Field>
      )}
      {started && (
        <form.Field name="confirmation.confirmation_code">
          {(field) => (
            <ConfirmationCodeInput
              kind="EmailSignup"
              owner={field.form.state.values.profile.email}
              onConfirmation={field.handleChange}
            />
          )}
        </form.Field>
      )}
      <ErrorDisplay value={error.value} />

      <div className="flex justify-end">
        {!started && (
          <Button
            aria-label="Create Passkey"
            isDisabled={error.is_pending || !email_is_valid}
            size="lg"
            type="submit"
          >
            <IconFingerprint />
            Create Passkey
          </Button>
        )}

        {started && (
          <Button
            aria-label="Complete Registration"
            isDisabled={error.is_pending}
            size="lg"
            type="submit"
          >
            <IconFingerprint />
            Create Account
          </Button>
        )}
      </div>
    </form>
  );
}
