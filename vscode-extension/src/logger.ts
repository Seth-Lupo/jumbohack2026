import * as vscode from "vscode";

const API_BASE = "http://localhost:10000/api/logger";
let disposables: vscode.Disposable[] = [];

export function startLogger(
  context: vscode.ExtensionContext,
  accessToken: string,
) {
  stopLogger();

  const onSave = vscode.workspace.onDidSaveTextDocument((doc) => {
    sendEvent(accessToken, {
      event_type: "file_save",
      payload: { fileName: doc.fileName, languageId: doc.languageId },
    });
  });

  const onOpen = vscode.workspace.onDidOpenTextDocument((doc) => {
    sendEvent(accessToken, {
      event_type: "file_open",
      payload: { fileName: doc.fileName, languageId: doc.languageId },
    });
  });

  disposables.push(onSave, onOpen);
  context.subscriptions.push(onSave, onOpen);
}

export function stopLogger() {
  disposables.forEach((d) => d.dispose());
  disposables = [];
}

async function sendEvent(
  token: string,
  body: { event_type: string; payload: Record<string, string> },
) {
  try {
    await fetch(`${API_BASE}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    // Silently fail — server may be unreachable
  }
}
