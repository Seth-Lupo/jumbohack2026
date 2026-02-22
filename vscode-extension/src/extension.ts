process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import * as vscode from "vscode";
import * as http from "http";
import fetch from "node-fetch";
import { jumbudExists, readConfig } from "./config";
import { runInit } from "./init";
import { startTracking, stopTracking } from "./tracker";
import { pushFlushes } from "./flusher";
import { httpGet } from "./http";

export async function activate(context: vscode.ExtensionContext) {
  console.log("CodeActivity Logger activating...");

  // Register test ping command
  const pingCmd = vscode.commands.registerCommand(
    "codeactivity.ping",
    async () => {
      // Diagnostic: show env vars and try both localhost and 0.0.0.0
      const proxy = process.env.HTTP_PROXY || process.env.http_proxy || "(none)";
      const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy || "(none)";
      vscode.window.showInformationMessage(
        `ENV: HTTP_PROXY=${proxy} | HTTPS_PROXY=${httpsProxy}`,
      );

      const url = "http://0.0.0.0:10000/api/profiles/me";

      // Method 1: our httpGet helper (agent: false)
      try {
        const res = await httpGet(url);
        vscode.window.showInformationMessage(
          `httpGet 0.0.0.0: status=${res.status} data=${res.data.substring(0, 100)}`,
        );
      } catch (err: any) {
        vscode.window.showErrorMessage(
          `httpGet 0.0.0.0 FAILED: ${err?.message ?? err}`,
        );
      }

      // Method 2: raw http.get with agent:false
      try {
        const data = await new Promise<string>((resolve, reject) => {
          http
            .get(url, { agent: false }, (res) => {
              let body = "";
              res.on("data", (chunk) => (body += chunk));
              res.on("end", () => resolve(`status=${res.statusCode} body=${body.substring(0, 100)}`));
            })
            .on("error", reject);
        });
        vscode.window.showInformationMessage(`raw http.get 0.0.0.0: ${data}`);
      } catch (err: any) {
        vscode.window.showErrorMessage(
          `raw http.get 0.0.0.0 FAILED: ${err?.message ?? err}`,
        );
      }

      // Method 3: node-fetch
      try {
        const res = await fetch(url);
        const text = await res.text();
        vscode.window.showInformationMessage(
          `node-fetch 0.0.0.0: status=${res.status} data=${text.substring(0, 100)}`,
        );
      } catch (err: any) {
        vscode.window.showErrorMessage(
          `node-fetch 0.0.0.0 FAILED: ${err?.message ?? err}`,
        );
      }
    },
  );
  context.subscriptions.push(pingCmd);

  // Register init command
  const initCmd = vscode.commands.registerCommand(
    "codeactivity.init",
    async () => {
      await runInit();
    },
  );
  context.subscriptions.push(initCmd);

  // If .jumbud/ already exists, resume tracking
  if (jumbudExists()) {
    const config = readConfig();
    if (config) {
      startTracking();
      vscode.window.showInformationMessage(
        "CodeActivity: Resumed tracking.",
      );
    }
  }
}

export async function deactivate() {
  await stopTracking();
  await pushFlushes();
}
