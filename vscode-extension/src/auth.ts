import * as vscode from "vscode";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL_KEY = "codeactivity.supabaseUrl";
const SUPABASE_ANON_KEY_KEY = "codeactivity.supabaseAnonKey";

export async function authenticate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("codeactivity");
  const url = config.get<string>("supabaseUrl") || "";
  const anonKey = config.get<string>("supabaseAnonKey") || "";

  if (!url || !anonKey) {
    vscode.window.showErrorMessage(
      "CodeActivity: Set supabaseUrl and supabaseAnonKey in settings.",
    );
    return null;
  }

  const email = await vscode.window.showInputBox({ prompt: "Email" });
  const password = await vscode.window.showInputBox({
    prompt: "Password",
    password: true,
  });

  if (!email || !password) return null;

  const supabase = createClient(url, anonKey);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    vscode.window.showErrorMessage(`CodeActivity: ${error.message}`);
    return null;
  }

  return data.session;
}
