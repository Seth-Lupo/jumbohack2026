import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import {
  getWorkspaceRoot,
  getMirrorDir,
  writeConfig,
  isTrackedFile,
  getJumbudDir,
} from "./config";
import { computeDiff } from "./differ";
import { enqueueFlush, pushFlushes } from "./flusher";
import { httpGet } from "./http";
import { startTracking } from "./tracker";
import { Course, Assignment, FlushPayload, JumbudConfig } from "./types";

const DEFAULT_SERVER_URL = "http://0.0.0.0:10000";

export async function runInit(): Promise<boolean> {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    vscode.window.showErrorMessage("CodeActivity: No workspace folder open.");
    return false;
  }

  // Prompt for server URL
  const serverUrl =
    (await vscode.window.showInputBox({
      prompt: "CodeActivity server URL",
      value: DEFAULT_SERVER_URL,
      ignoreFocusOut: true,
    })) ?? DEFAULT_SERVER_URL;

  // Prompt for utln
  const utln = await vscode.window.showInputBox({
    prompt: "Enter your UTLN",
    ignoreFocusOut: true,
  });
  if (!utln) {
    vscode.window.showErrorMessage("CodeActivity: UTLN is required.");
    return false;
  }

  // Fetch courses
  let courses: Course[];
  try {
    const res = await httpGet(
      `${serverUrl}/api/extensions/courses?utln=${encodeURIComponent(utln)}`,
    );
    if (!res.ok) {
      vscode.window.showErrorMessage(
        `CodeActivity: Failed to fetch courses (${res.status}).`,
      );
      return false;
    }
    const json = res.json<{ data: Course[] }>();
    courses = json.data;
  } catch (err: any) {
    vscode.window.showErrorMessage(
      `CodeActivity: Cannot reach server at ${serverUrl}. Error: ${err?.message ?? err}`,
    );
    return false;
  }

  if (courses.length === 0) {
    vscode.window.showErrorMessage(
      "CodeActivity: No courses found for this UTLN.",
    );
    return false;
  }

  // Pick course
  const courseItems = courses.map((c) => ({
    label: `${c.code} — ${c.name}`,
    id: c.id,
  }));
  const coursePick = await vscode.window.showQuickPick(courseItems, {
    placeHolder: "Select a course",
    ignoreFocusOut: true,
  });
  if (!coursePick) return false;

  // Fetch assignments
  let assignments: Assignment[];
  try {
    const res = await httpGet(
      `${serverUrl}/api/extensions/assignments?course_id=${coursePick.id}`,
    );
    if (!res.ok) {
      vscode.window.showErrorMessage(
        `CodeActivity: Failed to fetch assignments (${res.status}).`,
      );
      return false;
    }
    const json = res.json<{ data: Assignment[] }>();
    assignments = json.data;
  } catch {
    vscode.window.showErrorMessage("CodeActivity: Cannot reach server.");
    return false;
  }

  if (assignments.length === 0) {
    vscode.window.showErrorMessage(
      "CodeActivity: No assignments found for this course.",
    );
    return false;
  }

  // Pick assignment
  const assignmentItems = assignments.map((a) => ({
    label: a.name,
    description: a.due_date
      ? `Due: ${new Date(a.due_date).toLocaleDateString()}`
      : undefined,
    id: a.id,
  }));
  const assignmentPick = await vscode.window.showQuickPick(assignmentItems, {
    placeHolder: "Select an assignment",
    ignoreFocusOut: true,
  });
  if (!assignmentPick) return false;

  // Write config
  const config: JumbudConfig = {
    utln,
    assignment_id: assignmentPick.id,
    course_id: coursePick.id,
    server_url: serverUrl,
  };
  writeConfig(config);

  // Scan workspace for tracked files and create initial flushes
  const mirrorDir = getMirrorDir()!;
  const trackedFiles = findTrackedFiles(workspaceRoot);
  const now = new Date().toISOString();

  for (const absPath of trackedFiles) {
    const relativePath = path.relative(workspaceRoot, absPath);
    const content = fs.readFileSync(absPath, "utf-8");

    // Copy to mirror
    const mirrorPath = path.join(mirrorDir, relativePath);
    fs.mkdirSync(path.dirname(mirrorPath), { recursive: true });
    fs.writeFileSync(mirrorPath, content);

    // Generate init flush (diff from empty)
    const diffs = computeDiff(relativePath, "", content);
    const flush: FlushPayload = {
      file_path: relativePath,
      trigger: "init",
      start_timestamp: now,
      end_timestamp: now,
      diffs,
      active_symbol: null,
    };
    await enqueueFlush(flush);
  }

  // Push initial flushes immediately
  await pushFlushes();

  // Start tracking
  startTracking();

  vscode.window.showInformationMessage(
    `CodeActivity: Tracking ${trackedFiles.length} files for ${coursePick.label}.`,
  );

  return true;
}

function findTrackedFiles(dir: string): string[] {
  const results: string[] = [];
  const jumbudDir = getJumbudDir();

  function walk(current: string): void {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        // Skip hidden dirs and node_modules
        if (
          entry.name.startsWith(".") ||
          entry.name === "node_modules" ||
          fullPath === jumbudDir
        ) {
          continue;
        }
        walk(fullPath);
      } else if (entry.isFile() && isTrackedFile(fullPath)) {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results;
}
