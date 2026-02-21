import * as vscode from "vscode";
import { authenticate } from "./auth";
import { startLogger, stopLogger } from "./logger";

export async function activate(context: vscode.ExtensionContext) {
  console.log("CodeActivity Logger activating...");

  const session = await authenticate(context);
  if (!session) {
    vscode.window.showWarningMessage(
      "CodeActivity: Not signed in. Use the command palette to sign in.",
    );
    return;
  }

  startLogger(context, session.access_token);

  const signIn = vscode.commands.registerCommand(
    "codeactivity.signIn",
    async () => {
      const newSession = await authenticate(context);
      if (newSession) {
        startLogger(context, newSession.access_token);
        vscode.window.showInformationMessage("CodeActivity: Signed in!");
      }
    },
  );

  context.subscriptions.push(signIn);
}

export function deactivate() {
  stopLogger();
}
