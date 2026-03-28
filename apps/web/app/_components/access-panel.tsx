"use client";

import { useEffect, useState } from "react";

import type {
  AuthSessionContextResponse,
  CandidateProfile,
  IngestResumeInput,
  InterviewDashboardResponse,
  InterviewHistoryItem,
  InterviewSessionDetail,
} from "@prepforge/types";

import { prepforgeApiClient } from "../../src/lib/api-client";
import { prepforgeAuthClient } from "../../src/lib/auth-client";
import { AuthForm } from "./auth-form";
import { CandidateProfilePanel } from "./candidate-profile-panel";
import { InterviewDashboardPanel } from "./interview-dashboard-panel";
import { InterviewHistoryPanel } from "./interview-history-panel";
import { InterviewWorkspacePanel } from "./interview-workspace-panel";
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
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<InterviewDashboardResponse | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [history, setHistory] = useState<InterviewHistoryItem[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<InterviewSessionDetail | null>(null);
  const [activeSessionError, setActiveSessionError] = useState<string | null>(null);
  const [answerDraft, setAnswerDraft] = useState("");
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

  async function loadInterviewHistory() {
    try {
      const payload = await prepforgeApiClient.interviews.getHistory();
      setHistory(payload.items);
      setHistoryError(null);
    } catch (error) {
      setHistory([]);
      setHistoryError(getErrorMessage(error));
    }
  }

  async function loadProfile() {
    try {
      const payload = await prepforgeApiClient.profiles.getProfile();
      setProfile(payload.item);
      setProfileError(null);
    } catch (error) {
      setProfile(null);
      setProfileError(getErrorMessage(error));
    }
  }

  async function loadDashboard() {
    try {
      const payload = await prepforgeApiClient.interviews.getDashboard();
      setDashboard(payload);
      setDashboardError(null);
    } catch (error) {
      setDashboard(null);
      setDashboardError(getErrorMessage(error));
    }
  }

  async function loadSessionDetail(interviewId: string) {
    try {
      const payload = await prepforgeApiClient.interviews.getSessionDetail(interviewId);
      setActiveSession(payload.item);
      setActiveSessionError(null);
      setActiveSessionId(payload.item.id);
    } catch (error) {
      const message = getErrorMessage(error);
      setActiveSession(null);
      setActiveSessionId(null);
      setActiveSessionError(message);
      throw new Error(message);
    }
  }

  async function loadSignedInState() {
    await Promise.all([
      loadSessionContext(),
      loadProfile(),
      loadInterviewHistory(),
      loadDashboard(),
    ]);
  }

  useEffect(() => {
    if (!sessionState.data?.user) {
      setContext(null);
      setDashboard(null);
      setDashboardError(null);
      setProfile(null);
      setProfileError(null);
      setHistory([]);
      setActiveSessionId(null);
      setActiveSession(null);
      setActiveSessionError(null);
      setAnswerDraft("");
      return;
    }

    void loadSignedInState();
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

      await loadSignedInState();
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
      setDashboard(null);
      setDashboardError(null);
      setProfile(null);
      setProfileError(null);
      setHistory([]);
      setActiveSessionId(null);
      setActiveSession(null);
      setActiveSessionError(null);
      setAnswerDraft("");
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
      setDashboard(null);
      setDashboardError(null);
      setProfile(null);
      setProfileError(null);
      setActiveSessionId(null);
      setActiveSession(null);
      setActiveSessionError(null);
      setAnswerDraft("");
      await Promise.all([loadProfile(), loadInterviewHistory(), loadDashboard()]);
      setStatusMessage(`Active workspace set to ${payload.activeWorkspace?.name ?? "selected"}.`);
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setIsMutating(false);
    }
  }

  async function handleCreateDemoSession() {
    setIsMutating(true);
    setStatusMessage(null);

    try {
      const focusAreas =
        profile && profile.focusAreas.length > 0
          ? profile.focusAreas.slice(0, 2)
          : ["system design", "behavioral storytelling"];

      const payload = await prepforgeApiClient.interviews.startSession({
        company: context?.activeWorkspace?.name,
        difficulty: "intermediate",
        focusAreas,
        mode: "text",
        role: profile?.targetRole ?? "Frontend Engineer",
      });

      await Promise.all([loadInterviewHistory(), loadDashboard()]);
      await loadSessionDetail(payload.sessionId);
      setAnswerDraft("");
      setStatusMessage(`Demo session created: ${payload.sessionId}`);
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setIsMutating(false);
    }
  }

  async function handleSelectSession(interviewId: string) {
    setIsMutating(true);
    setStatusMessage(null);

    try {
      await loadSessionDetail(interviewId);
      setAnswerDraft("");
      setStatusMessage(`Opened session ${interviewId}.`);
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setIsMutating(false);
    }
  }

  async function handleSubmitAnswer() {
    if (!activeSession?.currentQuestion) {
      return;
    }

    setIsMutating(true);
    setStatusMessage(null);

    try {
      const payload = await prepforgeApiClient.interviews.submitAnswer(activeSession.id, {
        prompt: activeSession.currentQuestion,
        response: answerDraft.trim(),
      });

      setActiveSession(payload.item);
      setAnswerDraft("");
      await Promise.all([loadInterviewHistory(), loadDashboard()]);
      setStatusMessage(`Answer ${payload.item.answers.length} saved.`);
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setIsMutating(false);
    }
  }

  async function handleCompleteSession() {
    if (!activeSession) {
      return;
    }

    setIsMutating(true);
    setStatusMessage(null);

    try {
      const payload = await prepforgeApiClient.interviews.completeSession(activeSession.id);
      setActiveSession(payload.item);
      await Promise.all([loadInterviewHistory(), loadDashboard()]);
      setStatusMessage(`Session ${payload.item.id} marked completed.`);
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setIsMutating(false);
    }
  }

  async function handleIngestResume(input: IngestResumeInput) {
    setIsMutating(true);
    setStatusMessage(null);

    try {
      const payload = await prepforgeApiClient.profiles.ingestResume(input);
      setProfile(payload.item);
      setProfileError(null);
      setStatusMessage(`Candidate profile updated from ${payload.item.latestResume?.fileName ?? input.fileName}.`);
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setIsMutating(false);
    }
  }

  if (sessionState.data?.user) {
    return (
      <div className="grid gap-6">
        <SessionContextCard
          context={context}
          contextError={contextError}
          disabled={isMutating}
          onRefresh={loadSessionContext}
          onSignOut={handleSignOut}
          onSwitchWorkspace={handleSwitchWorkspace}
          statusMessage={statusMessage}
        />
        <CandidateProfilePanel
          disabled={isMutating}
          error={profileError}
          onIngestResume={handleIngestResume}
          onRefresh={loadProfile}
          profile={profile}
        />
        <InterviewDashboardPanel data={dashboard} error={dashboardError} />
        <InterviewHistoryPanel
          activeSessionId={activeSessionId}
          disabled={isMutating}
          error={historyError}
          items={history}
          onCreateDemoSession={handleCreateDemoSession}
          onRefresh={loadInterviewHistory}
          onSelectSession={handleSelectSession}
        />
        <InterviewWorkspacePanel
          answerDraft={answerDraft}
          detail={activeSession}
          detailError={activeSessionError}
          disabled={isMutating}
          onAnswerDraftChange={setAnswerDraft}
          onCompleteSession={handleCompleteSession}
          onRefresh={
            activeSessionId ? () => loadSessionDetail(activeSessionId) : async () => {}
          }
          onSubmitAnswer={handleSubmitAnswer}
        />
      </div>
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
