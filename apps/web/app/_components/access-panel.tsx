"use client";

import { useEffect, useState } from "react";

import type { AuthSessionContextResponse } from "@prepforge/types";

import { prepforgeApiClient } from "../../src/lib/api-client";
import { prepforgeAuthClient } from "../../src/lib/auth-client";
import { AuthForm } from "./auth-form";
import { SessionContextCard } from "./session-context-card";

type AuthMode = "sign-in" | "sign-up";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

export function AccessPanel() {
  const sessionState = prepforgeAuthClient.useSession();
  const [mode, setMode] = useState<AuthMode>("sign-up");
  const [name, setName] = useState("Asha Singh");
  const [email, setEmail] = useState("asha@example.com");
  const [password, setPassword] = useState("prepforge-demo");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [contextError, setContextError] = useState<string | null>(null);
  const [context, setContext] = useState<AuthSessionContextResponse | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  async function loadSessionContext() {
    try {
      const payload = await prepforgeApiClient.auth.getSessionContext();
      setContext(payload);
      setContextError(null);
    } catch (error) {
      setContext(null);
      setContextError(getErrorMessage(error));
    }
  }

  useEffect(() => {
    if (!sessionState.data?.user) {
      setContext(null);
      return;
    }

    void loadSessionContext();
  }, [sessionState.data?.user?.id]);

  async function handleSubmit() {
    setIsMutating(true);
    setStatusMessage(null);

    try {
      const result =
        mode === "sign-up"
          ? await prepforgeAuthClient.signUp.email({
              email,
              name,
              password,
            })
          : await prepforgeAuthClient.signIn.email({
              email,
              password,
            });

      if (result.error) {
        setStatusMessage(result.error.message ?? "Authentication failed.");
        return;
      }

      setPassword("");
      setStatusMessage(
        mode === "sign-up"
          ? "Account created. Workspace bootstrap is complete."
          : "Signed in successfully.",
      );

      await loadSessionContext();
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setIsMutating(false);
    }
  }

  async function handleSignOut() {
    setIsMutating(true);
    setStatusMessage(null);

    try {
      const result = await prepforgeAuthClient.signOut();

      if (result.error) {
        setStatusMessage(result.error.message ?? "Unable to sign out.");
        return;
      }

      setContext(null);
      setStatusMessage("Signed out.");
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setIsMutating(false);
    }
  }

  async function handleSwitchWorkspace(workspaceId: string) {
    setIsMutating(true);
    setStatusMessage(null);

    try {
      const payload = await prepforgeApiClient.workspaces.setActiveWorkspace({
        workspaceId,
      });

      setContext(payload);
      setContextError(null);
      setStatusMessage(`Active workspace set to ${payload.activeWorkspace?.name ?? "selected"}.`);
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setIsMutating(false);
    }
  }

  if (sessionState.data?.user) {
    return (
      <SessionContextCard
        context={context}
        contextError={contextError}
        onRefresh={loadSessionContext}
        onSignOut={handleSignOut}
        onSwitchWorkspace={handleSwitchWorkspace}
      />
    );
  }

  return (
    <AuthForm
      disabled={isMutating || sessionState.isPending}
      email={email}
      mode={mode}
      name={name}
      onEmailChange={setEmail}
      onModeChange={setMode}
      onNameChange={setName}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      password={password}
      statusMessage={statusMessage}
    />
  );
}

