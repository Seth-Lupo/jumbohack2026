import { useState, useEffect } from "react";
import { supabase } from "./api/supabase";
import type { Session } from "@supabase/supabase-js";

import averyStep1Diff from "./mock-diffs/avery-step1.diff?raw";
import averyStep2Diff from "./mock-diffs/avery-step2.diff?raw";
import noahStep1Diff from "./mock-diffs/noah-step1.diff?raw";
import noahStep2Diff from "./mock-diffs/noah-step2.diff?raw";
import miaStep1Diff from "./mock-diffs/mia-step1.diff?raw";
import miaStep2Diff from "./mock-diffs/mia-step2.diff?raw";

type DashboardTab = "student" | "overall" | "progress";

type StudentRecord = {
  id: string;
  name: string;
  stats: Array<{ label: string; value: string }>;
  aiOverview: string[];
};

type PieSlice = {
  label: string;
  value: number;
  color: string;
};

type TimeBar = {
  label: string;
  hours: number;
  color: string;
};

type ReplayStep = {
  id: string;
  title: string;
  diff: string;
  before: string;
  after: string;
  durationSeconds: number;
};

type ReplayFile = {
  filePath: string;
  baseInsight: string;
  steps: ReplayStep[];
};

const students: StudentRecord[] = [
  {
    id: "s-001",
    name: "Avery Johnson",
    stats: [
      { label: "Assignments Completed", value: "18/22" },
      { label: "Average Score", value: "81%" },
      { label: "Time on Task (weekly)", value: "4.2 hrs" },
      { label: "Late Submissions", value: "2" },
    ],
    aiOverview: [
      "Avery shows solid completion habits but struggles most with multi-step debugging tasks.",
      "Recent submissions suggest confusion around loop boundaries and translating rubric feedback into revised code.",
    ],
  },
  {
    id: "s-002",
    name: "Noah Patel",
    stats: [
      { label: "Assignments Completed", value: "20/22" },
      { label: "Average Score", value: "88%" },
      { label: "Time on Task (weekly)", value: "3.7 hrs" },
      { label: "Late Submissions", value: "0" },
    ],
    aiOverview: [
      "Noah performs consistently well but misses points on written reasoning for algorithm choices.",
      "Growth opportunity is documenting edge cases before implementation, especially in recursive problems.",
    ],
  },
  {
    id: "s-003",
    name: "Mia Chen",
    stats: [
      { label: "Assignments Completed", value: "16/22" },
      { label: "Average Score", value: "73%" },
      { label: "Time on Task (weekly)", value: "5.0 hrs" },
      { label: "Late Submissions", value: "3" },
    ],
    aiOverview: [
      "Mia demonstrates effort and time-on-task but struggles with function decomposition and test planning.",
      "Most frequent issues come from starting implementation before outlining data flow and helper functions.",
    ],
  },
];

const overallStats = [
  { label: "Class Average Score", value: "76%" },
  { label: "Average Completion Rate", value: "84%" },
  { label: "Average Weekly Time", value: "3.8 hrs" },
  { label: "Students Needing Support", value: "7/42" },
];

const studentFileTime: Record<string, PieSlice[]> = {
  "s-001": [
    { label: "main.tsx", value: 2.1, color: "#0ea5e9" },
    { label: "algorithms.ts", value: 1.7, color: "#14b8a6" },
    { label: "tests.spec.ts", value: 0.9, color: "#f59e0b" },
  ],
  "s-002": [
    { label: "main.tsx", value: 1.8, color: "#0ea5e9" },
    { label: "tree-utils.ts", value: 1.2, color: "#14b8a6" },
    { label: "reasoning.md", value: 0.7, color: "#f59e0b" },
  ],
  "s-003": [
    { label: "main.tsx", value: 2.4, color: "#0ea5e9" },
    { label: "helpers.ts", value: 1.1, color: "#14b8a6" },
    { label: "debug-notes.md", value: 1.5, color: "#f59e0b" },
  ],
};

const studentFunctionTime: Record<string, PieSlice[]> = {
  "s-001": [
    { label: "buildSchedule()", value: 1.4, color: "#8b5cf6" },
    { label: "scoreSubmission()", value: 1.1, color: "#ec4899" },
    { label: "parseEvents()", value: 0.8, color: "#22c55e" },
  ],
  "s-002": [
    { label: "dfsSearch()", value: 1.0, color: "#8b5cf6" },
    { label: "scoreSubmission()", value: 0.9, color: "#ec4899" },
    { label: "compareNodes()", value: 0.6, color: "#22c55e" },
  ],
  "s-003": [
    { label: "renderHints()", value: 1.2, color: "#8b5cf6" },
    { label: "validateInput()", value: 1.4, color: "#ec4899" },
    { label: "retryFailed()", value: 0.9, color: "#22c55e" },
  ],
};

const studentTimeBars: Record<string, TimeBar[]> = {
  "s-001": [
    { label: "Debugging", hours: 1.8, color: "#0ea5e9" },
    { label: "Implementation", hours: 1.5, color: "#14b8a6" },
    { label: "Reading Prompts", hours: 0.9, color: "#f59e0b" },
  ],
  "s-002": [
    { label: "Implementation", hours: 1.6, color: "#14b8a6" },
    { label: "Refactoring", hours: 1.1, color: "#0ea5e9" },
    { label: "Writing Explanations", hours: 0.7, color: "#f59e0b" },
  ],
  "s-003": [
    { label: "Debugging", hours: 2.1, color: "#0ea5e9" },
    { label: "Implementation", hours: 1.7, color: "#14b8a6" },
    { label: "Planning", hours: 1.0, color: "#f59e0b" },
  ],
};

const classFileTime: PieSlice[] = [
  { label: "main.tsx", value: 24, color: "#0ea5e9" },
  { label: "utils.ts", value: 18, color: "#14b8a6" },
  { label: "tests.spec.ts", value: 13, color: "#f59e0b" },
  { label: "notes.md", value: 8, color: "#6366f1" },
];

const classFunctionTime: PieSlice[] = [
  { label: "scoreSubmission()", value: 17, color: "#8b5cf6" },
  { label: "validateInput()", value: 15, color: "#ec4899" },
  { label: "buildSchedule()", value: 12, color: "#22c55e" },
  { label: "renderHints()", value: 9, color: "#06b6d4" },
];

const classTimeBars: TimeBar[] = [
  { label: "Debugging", hours: 19, color: "#0ea5e9" },
  { label: "Implementation", hours: 27, color: "#14b8a6" },
  { label: "Planning", hours: 12, color: "#f59e0b" },
  { label: "Writing Explanations", hours: 9, color: "#6366f1" },
];

const replayByStudent: Record<string, ReplayFile[]> = {
  "s-001": [
    {
      filePath: "src/loops.ts",
      baseInsight:
        "Avery spent most time fixing loop control mistakes, especially around array bounds and readability.",
      steps: [
        {
          id: "avery-1",
          title: "Fix off-by-one in loop bounds",
          diff: averyStep1Diff,
          before:
            "export function countPassed(scores: number[]) {\n  let passed = 0;\n  for (let i = 0; i <= scores.length; i++) {\n    if (scores[i] >= 70) passed += 1;\n  }\n  return passed;\n}\n",
          after:
            "export function countPassed(scores: number[]) {\n  let passed = 0;\n  for (let i = 0; i < scores.length; i++) {\n    if (scores[i] >= 70) passed += 1;\n  }\n\n  return passed;\n}\n",
          durationSeconds: 6,
        },
        {
          id: "avery-2",
          title: "Introduce local score variable",
          diff: averyStep2Diff,
          before:
            "export function countPassed(scores: number[]) {\n  let passed = 0;\n  for (let i = 0; i < scores.length; i++) {\n    if (scores[i] >= 70) passed += 1;\n  }\n\n  return passed;\n}\n",
          after:
            "export function countPassed(scores: number[]) {\n  let passed = 0;\n  for (let i = 0; i < scores.length; i++) {\n    const score = scores[i];\n    if (score >= 70) passed += 1;\n  }\n\n  return passed;\n}\n",
          durationSeconds: 4,
        },
      ],
    },
    {
      filePath: "notes/reflection.md",
      baseInsight:
        "Avery's reflection notes show stronger self-correction after seeing failing tests.",
      steps: [
        {
          id: "avery-notes-1",
          title: "Document loop bug takeaway",
          diff: "diff --git a/notes/reflection.md b/notes/reflection.md\n@@ -1,2 +1,3 @@\n-I need to recheck loops.\n+I need to recheck loops for < vs <= and test edge cases first.\n+I will write one tiny test before editing next time.\n",
          before: "# Reflection\nI need to recheck loops.\n",
          after:
            "# Reflection\nI need to recheck loops for < vs <= and test edge cases first.\nI will write one tiny test before editing next time.\n",
          durationSeconds: 3,
        },
      ],
    },
  ],
  "s-002": [
    {
      filePath: "src/tree.ts",
      baseInsight:
        "Noah's code is structurally correct; most edits are about clarifying algorithm intent and communication.",
      steps: [
        {
          id: "noah-1",
          title: "Add traversal intent comment",
          diff: noahStep1Diff,
          before:
            "export function dfs(node: Node | null) {\n  if (!node) return [];\n  const left = dfs(node.left);\n  const right = dfs(node.right);\n  return [...left, node.value, ...right];\n}\n",
          after:
            "export function dfs(node: Node | null) {\n  if (!node) return [];\n  const left = dfs(node.left);\n  const right = dfs(node.right);\n\n  // keep root in between left and right traversal\n  return [...left, node.value, ...right];\n}\n",
          durationSeconds: 4,
        },
        {
          id: "noah-2",
          title: "Refine comment terminology",
          diff: noahStep2Diff,
          before:
            "export function dfs(node: Node | null) {\n  if (!node) return [];\n  const left = dfs(node.left);\n  const right = dfs(node.right);\n\n  // keep root in between left and right traversal\n  return [...left, node.value, ...right];\n}\n",
          after:
            "export function dfs(node: Node | null) {\n  if (!node) return [];\n  const left = dfs(node.left);\n  const right = dfs(node.right);\n\n  // in-order traversal: left, root, right\n  return [...left, node.value, ...right];\n}\n",
          durationSeconds: 2,
        },
      ],
    },
    {
      filePath: "notes/explanation.md",
      baseInsight:
        "Noah often backfills explanations after coding, which is good but can happen earlier.",
      steps: [
        {
          id: "noah-notes-1",
          title: "Clarify traversal ordering",
          diff: "diff --git a/notes/explanation.md b/notes/explanation.md\n@@ -1,2 +1,3 @@\n-In-order means left and right around root.\n+In-order means left subtree, then root, then right subtree.\n+This matches the array spread order in my return statement.\n",
          before: "# Traversal Notes\nIn-order means left and right around root.\n",
          after:
            "# Traversal Notes\nIn-order means left subtree, then root, then right subtree.\nThis matches the array spread order in my return statement.\n",
          durationSeconds: 3,
        },
      ],
    },
  ],
  "s-003": [
    {
      filePath: "src/input.ts",
      baseInsight:
        "Mia improved input handling steadily; most time was spent tightening validation edge cases.",
      steps: [
        {
          id: "mia-1",
          title: "Trim input before validation",
          diff: miaStep1Diff,
          before:
            "export function isValidName(name: string) {\n  return name.length > 0;\n}\n\nexport function formatName(name: string) {\n  return name.trim();\n}\n",
          after:
            "export function isValidName(name: string) {\n  const trimmed = name.trim();\n  return trimmed.length > 0;\n}\n\nexport function formatName(name: string) {\n  return name.trim();\n}\n",
          durationSeconds: 5,
        },
        {
          id: "mia-2",
          title: "Strengthen validation and normalize spaces",
          diff: miaStep2Diff,
          before:
            "export function isValidName(name: string) {\n  const trimmed = name.trim();\n  return trimmed.length > 0;\n}\n\nexport function formatName(name: string) {\n  return name.trim();\n}\n",
          after:
            "export function isValidName(name: string) {\n  const trimmed = name.trim();\n  return trimmed.length >= 2;\n}\n\nexport function formatName(name: string) {\n  return name.trim().replace(/\\s+/g, \" \");\n}\n",
          durationSeconds: 5,
        },
      ],
    },
    {
      filePath: "notes/validation-plan.md",
      baseInsight:
        "Mia's written plan became more concrete once she listed specific invalid-name examples.",
      steps: [
        {
          id: "mia-notes-1",
          title: "Add concrete invalid cases",
          diff: "diff --git a/notes/validation-plan.md b/notes/validation-plan.md\n@@ -1,2 +1,3 @@\n-Need to test names.\n+Need to test names: empty, single-char, and extra spaces.\n+Also ensure output collapses repeated spaces.\n",
          before: "# Validation Plan\nNeed to test names.\n",
          after:
            "# Validation Plan\nNeed to test names: empty, single-char, and extra spaces.\nAlso ensure output collapses repeated spaces.\n",
          durationSeconds: 3,
        },
      ],
    },
  ],
};

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(radians),
    y: cy + r * Math.sin(radians),
  };
}

function describeSectorPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
}

function sharedPrefixLength(a: string, b: string) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i += 1;
  return i;
}

function AnimatedPieChart({
  title,
  slices,
}: {
  title: string;
  slices: PieSlice[];
}) {
  const [progress, setProgress] = useState(0);
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  useEffect(() => {
    let frame = 0;
    const durationMs = 850;
    const start = performance.now();
    const tick = (timestamp: number) => {
      const elapsed = timestamp - start;
      const next = Math.min(1, elapsed / durationMs);
      setProgress(next);
      if (next < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [slices]);

  let runningAngle = -90;

  return (
    <section style={{ border: "1px solid #ddd", borderRadius: 10, padding: "1rem", background: "#fff" }}>
      <h3 style={{ marginTop: 0, marginBottom: "0.75rem" }}>{title}</h3>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        <svg width={180} height={180} viewBox="0 0 180 180" role="img" aria-label={title}>
          <circle cx={90} cy={90} r={72} fill="#f3f4f6" />
          {slices.map((slice) => {
            const finalSweep = (slice.value / total) * 360;
            const sweep = finalSweep * progress;
            const startAngle = runningAngle;
            const endAngle = startAngle + sweep;
            runningAngle += finalSweep;
            if (sweep <= 0) return null;
            return <path key={slice.label} d={describeSectorPath(90, 90, 72, startAngle, endAngle)} fill={slice.color} />;
          })}
          <circle cx={90} cy={90} r={34} fill="#fff" />
          <text x={90} y={88} textAnchor="middle" fontSize="10" fill="#6b7280">
            Total
          </text>
          <text x={90} y={104} textAnchor="middle" fontSize="14" fontWeight={700} fill="#111827">
            {total.toFixed(1)}h
          </text>
        </svg>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, minWidth: 170, flex: 1 }}>
          {slices.map((slice) => (
            <li key={slice.label} style={{ display: "flex", alignItems: "center", marginBottom: "0.4rem", gap: "0.45rem" }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  background: slice.color,
                  borderRadius: 99,
                  display: "inline-block",
                }}
              />
              <span style={{ flex: 1 }}>{slice.label}</span>
              <strong>{((slice.value / total) * 100).toFixed(0)}%</strong>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function AnimatedBars({ title, bars }: { title: string; bars: TimeBar[] }) {
  const [progress, setProgress] = useState(0);
  const max = Math.max(...bars.map((bar) => bar.hours));

  useEffect(() => {
    let frame = 0;
    const durationMs = 900;
    const start = performance.now();
    const tick = (timestamp: number) => {
      const elapsed = timestamp - start;
      const next = Math.min(1, elapsed / durationMs);
      setProgress(next);
      if (next < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [bars]);

  return (
    <section style={{ border: "1px solid #ddd", borderRadius: 10, padding: "1rem", background: "#fff" }}>
      <h3 style={{ marginTop: 0, marginBottom: "0.75rem" }}>{title}</h3>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {bars.map((bar) => (
          <li key={bar.label} style={{ marginBottom: "0.7rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
              <span>{bar.label}</span>
              <strong>{bar.hours.toFixed(1)}h</strong>
            </div>
            <div style={{ height: 10, background: "#f1f5f9", borderRadius: 999 }}>
              <div
                style={{
                  height: "100%",
                  background: bar.color,
                  borderRadius: 999,
                  width: `${((bar.hours / max) * progress * 100).toFixed(1)}%`,
                  transition: "width 100ms linear",
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("professor@codeactivity.test");
  const [password, setPassword] = useState("testpass123");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<DashboardTab>("student");
  const [selectedStudentId, setSelectedStudentId] = useState(students[0].id);

  const [replayStudentId, setReplayStudentId] = useState(students[0].id);
  const [selectedReplayFilePath, setSelectedReplayFilePath] = useState(
    replayByStudent[students[0].id]?.[0]?.filePath ?? "",
  );
  const [replayStepIndex, setReplayStepIndex] = useState(0);
  const [isReplayPlaying, setIsReplayPlaying] = useState(false);
  const [insightMessages, setInsightMessages] = useState<string[]>([]);
  const [insightInput, setInsightInput] = useState("");
  const [replayDisplayContent, setReplayDisplayContent] = useState("");

  const selectedStudent = students.find((student) => student.id === selectedStudentId) ?? students[0];
  const replayStudent = students.find((student) => student.id === replayStudentId) ?? students[0];
  const replayFiles = replayByStudent[replayStudentId] ?? [];
  const selectedReplayFile =
    replayFiles.find((file) => file.filePath === selectedReplayFilePath) ?? replayFiles[0];
  const replaySteps = selectedReplayFile?.steps ?? [];
  const replayStep = replaySteps[replayStepIndex];
  const replayTotalDuration = replaySteps.reduce((total, step) => total + step.durationSeconds, 0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) =>
      setSession(s),
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const files = replayByStudent[replayStudentId] ?? [];
    setSelectedReplayFilePath(files[0]?.filePath ?? "");
    setIsReplayPlaying(false);
  }, [replayStudentId]);

  useEffect(() => {
    const file = (replayByStudent[replayStudentId] ?? []).find(
      (item) => item.filePath === selectedReplayFilePath,
    );
    if (!file) {
      setReplayStepIndex(0);
      setInsightMessages([]);
      setReplayDisplayContent("");
      return;
    }
    setReplayStepIndex(0);
    setInsightMessages([file.baseInsight]);
    setIsReplayPlaying(false);
  }, [replayStudentId, selectedReplayFilePath]);

  useEffect(() => {
    if (!isReplayPlaying || replaySteps.length === 0 || !replayStep) return;
    if (replayStepIndex >= replaySteps.length - 1) {
      setIsReplayPlaying(false);
      return;
    }

    const stepDurationMs = Math.max(700, replayStep.durationSeconds * 900);
    const timerId = window.setTimeout(() => {
      setReplayStepIndex((prev) => Math.min(prev + 1, replaySteps.length - 1));
    }, stepDurationMs);
    return () => {
      window.clearTimeout(timerId);
    };
  }, [isReplayPlaying, replayStep, replayStepIndex, replaySteps]);

  useEffect(() => {
    if (!replayStep) {
      setReplayDisplayContent("");
      return;
    }
    const prefix = sharedPrefixLength(replayStep.before, replayStep.after);
    let currentText = replayStep.before;
    let timeoutId = 0;
    let cancelled = false;

    setReplayDisplayContent(currentText);

    const deletePhase = () => {
      if (cancelled) return;
      if (currentText.length > prefix) {
        currentText = currentText.slice(0, -1);
        setReplayDisplayContent(currentText);
        timeoutId = window.setTimeout(deletePhase, 6);
        return;
      }
      timeoutId = window.setTimeout(typePhase, 50);
    };

    const typePhase = () => {
      if (cancelled) return;
      if (currentText.length < replayStep.after.length) {
        currentText = replayStep.after.slice(0, currentText.length + 1);
        setReplayDisplayContent(currentText);
        timeoutId = window.setTimeout(typePhase, 6);
        return;
      }
    };

    timeoutId = window.setTimeout(deletePhase, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [replayStudentId, selectedReplayFilePath, replayStepIndex, replayStep]);

  function handleReplayStepSelect(index: number) {
    setIsReplayPlaying(false);
    setReplayStepIndex(index);
  }

  function handleReplayStepBackward() {
    if (replayStepIndex === 0) return;
    setIsReplayPlaying(false);
    setReplayStepIndex((prev) => Math.max(prev - 1, 0));
  }

  function handleReplayStepForward() {
    if (replayStepIndex >= replaySteps.length - 1) return;
    setIsReplayPlaying(false);
    setReplayStepIndex((prev) => Math.min(prev + 1, replaySteps.length - 1));
  }

  function handleReplayPlayPause() {
    if (replaySteps.length === 0) return;
    if (replayStepIndex >= replaySteps.length - 1) {
      setReplayStepIndex(0);
      setIsReplayPlaying(true);
      return;
    }
    setIsReplayPlaying((prev) => !prev);
  }

  function handleInsightSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = insightInput.trim();
    if (!query) return;
    setInsightMessages((prev) => [
      ...prev,
      `Teacher: ${query}`,
      "AI: Placeholder response. Connect this to your model to answer teacher follow-up questions and extend the insight history.",
    ]);
    setInsightInput("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setActiveTab("student");
    setSelectedStudentId(students[0].id);
    setReplayStudentId(students[0].id);
    setSelectedReplayFilePath(replayByStudent[students[0].id]?.[0]?.filePath ?? "");
    setReplayStepIndex(0);
    setIsReplayPlaying(false);
  }

  if (!session) {
    return (
      <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: 400 }}>
        <h1>CodeActivity</h1>
        <p>Sign in to continue</p>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "0.5rem" }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button type="submit" style={{ padding: "0.5rem 1rem" }}>
            Sign In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: 1100 }}>
      <h1>CodeActivity</h1>
      <p>
        Signed in as: <strong>{session.user.email}</strong>{" "}
        <button onClick={handleLogout} style={{ marginLeft: "0.5rem" }}>
          Sign Out
        </button>
      </p>

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          margin: "1.5rem 0 1rem",
          borderBottom: "1px solid #ddd",
          paddingBottom: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setActiveTab("student")}
          style={{
            padding: "0.6rem 1rem",
            border: "1px solid #bbb",
            background: activeTab === "student" ? "#111" : "#fff",
            color: activeTab === "student" ? "#fff" : "#111",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Students
        </button>
        <button
          onClick={() => setActiveTab("overall")}
          style={{
            padding: "0.6rem 1rem",
            border: "1px solid #bbb",
            background: activeTab === "overall" ? "#111" : "#fff",
            color: activeTab === "overall" ? "#fff" : "#111",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Class
        </button>
        <button
          onClick={() => setActiveTab("progress")}
          style={{
            padding: "0.6rem 1rem",
            border: "1px solid #bbb",
            background: activeTab === "progress" ? "#111" : "#fff",
            color: activeTab === "progress" ? "#fff" : "#111",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Progress Replay
        </button>
      </div>

      {activeTab === "student" ? (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(280px, 1fr) minmax(320px, 1.2fr)",
              gap: "1rem",
            }}
          >
            <section style={{ border: "1px solid #ddd", borderRadius: 10, padding: "1rem" }}>
              <h2 style={{ marginTop: 0 }}>Student Statistics</h2>
              <div style={{ marginBottom: "0.9rem" }}>
                <label htmlFor="student-select" style={{ display: "block", marginBottom: "0.4rem" }}>
                  Select Student
                </label>
                <select
                  id="student-select"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem" }}
                >
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {selectedStudent.stats.map((item) => (
                  <li
                    key={item.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0.6rem 0",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </li>
                ))}
              </ul>
            </section>
            <section style={{ border: "1px solid #ddd", borderRadius: 10, padding: "1rem" }}>
              <h2 style={{ marginTop: 0 }}>AI Student Overview: {selectedStudent.name}</h2>
              {selectedStudent.aiOverview.map((paragraph) => (
                <p key={paragraph} style={{ marginBottom: "0.5rem" }}>
                  {paragraph}
                </p>
              ))}
              <p style={{ color: "#666", marginBottom: 0 }}>
                Placeholder for model output. Wire this panel to your AI service once available.
              </p>
            </section>
          </div>
          <section style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ddd", borderRadius: 10 }}>
            <h2 style={{ margin: 0 }}>Time Analytics</h2>
            <p style={{ marginTop: "0.4rem", color: "#4b5563" }}>
              Example chart space for file, function, and workflow time metrics.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
                gap: "0.8rem",
              }}
            >
              <AnimatedPieChart
                key={`student-files-${selectedStudentId}`}
                title={`Time by File (${selectedStudent.name})`}
                slices={studentFileTime[selectedStudentId]}
              />
              <AnimatedPieChart
                key={`student-functions-${selectedStudentId}`}
                title={`Time by Function (${selectedStudent.name})`}
                slices={studentFunctionTime[selectedStudentId]}
              />
              <AnimatedBars
                key={`student-workflow-${selectedStudentId}`}
                title="Workflow Time Split"
                bars={studentTimeBars[selectedStudentId]}
              />
            </div>
          </section>
        </>
      ) : activeTab === "overall" ? (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(340px, 1.5fr) minmax(260px, 1fr)",
              gap: "1rem",
            }}
          >
            <section style={{ border: "1px solid #ddd", borderRadius: 10, padding: "1rem" }}>
              <h2 style={{ marginTop: 0 }}>AI Cohort Overview</h2>
              <p style={{ marginBottom: "0.5rem" }}>
                Across the class, the most common struggles are algorithm planning before coding,
                debugging runtime errors, and writing clear function interfaces.
              </p>
              <p style={{ marginBottom: "0.5rem" }}>
                Students perform better when problems are broken into checkpoints and when examples
                include explicit reasoning steps.
              </p>
              <p style={{ color: "#666", marginBottom: 0 }}>
                Placeholder for expanded cohort analysis from your AI model.
              </p>
            </section>
            <section style={{ border: "1px solid #ddd", borderRadius: 10, padding: "1rem" }}>
              <h2 style={{ marginTop: 0 }}>Overall Average Statistics</h2>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {overallStats.map((item) => (
                  <li
                    key={item.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0.6rem 0",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </li>
                ))}
              </ul>
            </section>
          </div>
          <section style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ddd", borderRadius: 10 }}>
            <h2 style={{ margin: 0 }}>Class Time Analytics</h2>
            <p style={{ marginTop: "0.4rem", color: "#4b5563" }}>
              Example chart space for class-level time spent by files and functions.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
                gap: "0.8rem",
              }}
            >
              <AnimatedPieChart title="Average Time by File (Class)" slices={classFileTime} />
              <AnimatedPieChart title="Average Time by Function (Class)" slices={classFunctionTime} />
              <AnimatedBars title="Class Workflow Time Split" bars={classTimeBars} />
            </div>
          </section>
        </>
      ) : (
        <section style={{ border: "1px solid #ddd", borderRadius: 10, padding: "1rem" }}>
          <h2 style={{ marginTop: 0 }}>Student Progress Replay</h2>
          <p style={{ marginTop: "0.4rem", color: "#4b5563" }}>
            Switch students and review their edits in a player-style timeline with file-level AI insights.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "0.8rem",
              marginBottom: "1rem",
            }}
          >
            <div>
              <label htmlFor="replay-student" style={{ display: "block", marginBottom: "0.35rem" }}>
                Student
              </label>
              <select
                id="replay-student"
                value={replayStudentId}
                onChange={(e) => setReplayStudentId(e.target.value)}
                style={{ width: "100%", padding: "0.5rem" }}
              >
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
            <section style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.75rem", background: "#f8fafc" }}>
              <p style={{ marginTop: 0, marginBottom: "0.6rem", fontWeight: 700 }}>File Tree</p>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {replayFiles.map((file) => (
                  <li key={file.filePath} style={{ marginBottom: "0.35rem" }}>
                    <button
                      onClick={() => setSelectedReplayFilePath(file.filePath)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "0.4rem 0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: 6,
                        background: selectedReplayFile?.filePath === file.filePath ? "#dbeafe" : "#fff",
                        cursor: "pointer",
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                        fontSize: 12,
                      }}
                    >
                      {file.filePath}
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.75rem", background: "#f8fafc" }}>
              <div style={{ border: "1px solid #1f2937", borderRadius: 8, background: "#0f172a", padding: "0.75rem", marginBottom: "0.8rem" }}>
                <p style={{ color: "#cbd5e1", marginTop: 0, marginBottom: "0.5rem" }}>
                  {replayStudent.name} editing <code>{selectedReplayFile?.filePath ?? "-"}</code>
                </p>
                <pre
                  style={{
                    margin: 0,
                    color: "#e2e8f0",
                    minHeight: 260,
                    whiteSpace: "pre-wrap",
                    fontSize: 13,
                    lineHeight: 1.45,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  }}
                >
                  {replayDisplayContent || "// No replay data for this file yet."}
                </pre>
              </div>

              <div style={{ marginBottom: "0.7rem" }}>
                <p style={{ marginTop: 0, marginBottom: "0.35rem", color: "#4b5563", fontSize: 12 }}>
                  Timeline ({replayStepIndex + 1}/{Math.max(replaySteps.length, 1)})
                </p>
                <div style={{ display: "flex", height: 18, borderRadius: 999, overflow: "hidden", border: "1px solid #d1d5db" }}>
                  {replaySteps.map((step, idx) => {
                    const width = replayTotalDuration > 0 ? (step.durationSeconds / replayTotalDuration) * 100 : 0;
                    const isActive = idx === replayStepIndex;
                    return (
                      <button
                        key={step.id}
                        onClick={() => handleReplayStepSelect(idx)}
                        title={`${step.title} (${step.durationSeconds}s)`}
                        style={{
                          width: `${width}%`,
                          border: "none",
                          borderRight: "1px solid #d1d5db",
                          background: isActive ? "#2563eb" : "#93c5fd",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button
                  onClick={handleReplayStepBackward}
                  disabled={replayStepIndex === 0}
                  aria-label="Previous step"
                  title="Previous step"
                  style={{ width: 36, height: 36, display: "grid", placeItems: "center" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <rect x="2" y="3" width="2" height="10" fill="currentColor" />
                    <path d="M12 3L5 8L12 13V3Z" fill="currentColor" />
                  </svg>
                </button>
                <button
                  onClick={handleReplayPlayPause}
                  disabled={replaySteps.length === 0}
                  aria-label={isReplayPlaying ? "Pause" : "Play"}
                  title={isReplayPlaying ? "Pause" : "Play"}
                  style={{ width: 44, height: 44, borderRadius: 999, display: "grid", placeItems: "center" }}
                >
                  {isReplayPlaying ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <rect x="3" y="2" width="3" height="12" fill="currentColor" />
                      <rect x="10" y="2" width="3" height="12" fill="currentColor" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M4 2L13 8L4 14V2Z" fill="currentColor" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={handleReplayStepForward}
                  disabled={replayStepIndex >= replaySteps.length - 1}
                  aria-label="Next step"
                  title="Next step"
                  style={{ width: 36, height: 36, display: "grid", placeItems: "center" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <rect x="12" y="3" width="2" height="10" fill="currentColor" />
                    <path d="M4 3L11 8L4 13V3Z" fill="currentColor" />
                  </svg>
                </button>
                <span style={{ fontSize: 12, color: "#4b5563" }}>
                  {replayStep?.title ?? "No step selected"}
                </span>
              </div>
            </section>

            <section
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "0.75rem",
                background: "#ffffff",
                display: "flex",
                flexDirection: "column",
                minHeight: 430,
              }}
            >
              <p style={{ marginTop: 0, marginBottom: "0.6rem", fontWeight: 700 }}>AI Insights</p>
              <div
                style={{
                  flex: 1,
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  padding: "0.5rem",
                  overflowY: "auto",
                  background: "#f9fafb",
                  marginBottom: "0.6rem",
                }}
              >
                {insightMessages.map((message, index) => (
                  <p key={`${message}-${index}`} style={{ margin: "0 0 0.5rem", fontSize: 13, lineHeight: 1.35 }}>
                    {message}
                  </p>
                ))}
              </div>
              <form onSubmit={handleInsightSubmit} style={{ display: "flex", gap: "0.4rem" }}>
                <input
                  value={insightInput}
                  onChange={(e) => setInsightInput(e.target.value)}
                  placeholder="Ask AI about this student's progress..."
                  style={{ flex: 1, padding: "0.5rem" }}
                />
                <button type="submit" style={{ padding: "0.5rem 0.7rem" }}>
                  Send
                </button>
              </form>
            </section>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
