import { useEffect, useState } from "react";
import { supabase } from "./api/supabase";
import type { Session } from "@supabase/supabase-js";
import "./app.css";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";

import averyStep1Diff from "./mock-diffs/avery-step1.diff?raw";
import averyStep2Diff from "./mock-diffs/avery-step2.diff?raw";
import averyStep3Diff from "./mock-diffs/avery-step3.diff?raw";
import averyStep4Diff from "./mock-diffs/avery-step4.diff?raw";
import noahStep1Diff from "./mock-diffs/noah-step1.diff?raw";
import noahStep2Diff from "./mock-diffs/noah-step2.diff?raw";
import noahStep3Diff from "./mock-diffs/noah-step3.diff?raw";
import noahStep4Diff from "./mock-diffs/noah-step4.diff?raw";
import miaStep1Diff from "./mock-diffs/mia-step1.diff?raw";
import miaStep2Diff from "./mock-diffs/mia-step2.diff?raw";
import miaStep3Diff from "./mock-diffs/mia-step3.diff?raw";
import miaStep4Diff from "./mock-diffs/mia-step4.diff?raw";
import liamStep1Diff from "./mock-diffs/liam-step1.diff?raw";
import liamStep2Diff from "./mock-diffs/liam-step2.diff?raw";
import liamStep3Diff from "./mock-diffs/liam-step3.diff?raw";
import liamStep4Diff from "./mock-diffs/liam-step4.diff?raw";
import zoeStep1Diff from "./mock-diffs/zoe-step1.diff?raw";
import zoeStep2Diff from "./mock-diffs/zoe-step2.diff?raw";
import zoeStep3Diff from "./mock-diffs/zoe-step3.diff?raw";
import zoeStep4Diff from "./mock-diffs/zoe-step4.diff?raw";
import owenStep1Diff from "./mock-diffs/owen-step1.diff?raw";
import owenStep2Diff from "./mock-diffs/owen-step2.diff?raw";
import owenStep3Diff from "./mock-diffs/owen-step3.diff?raw";
import owenStep4Diff from "./mock-diffs/owen-step4.diff?raw";

type Student = {
  id: string;
  name: string;
  email: string;
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

type AssignmentStudentData = {
  stats: Array<{ label: string; value: string }>;
  aiOverview: string[];
};

type Assignment = {
  id: string;
  title: string;
  due: string;
  symbols: string[];
  classStats: Array<{ label: string; value: string }>;
  students: Record<string, AssignmentStudentData>;
  heatmap: Record<string, Record<string, number>>;
  narratives: Record<string, Record<string, string>>;
  replay: Record<string, ReplayFile[]>;
};

type Course = {
  id: string;
  title: string;
  role: string;
  term: string;
  assignments: Assignment[];
};

const students: Student[] = [
  { id: "s-001", name: "Avery Johnson", email: "avery.johnson@school.edu" },
  { id: "s-002", name: "Noah Patel", email: "noah.patel@school.edu" },
  { id: "s-003", name: "Mia Chen", email: "mia.chen@school.edu" },
  { id: "s-004", name: "Liam Garcia", email: "liam.garcia@school.edu" },
  { id: "s-005", name: "Zoe Kim", email: "zoe.kim@school.edu" },
  { id: "s-006", name: "Owen Brooks", email: "owen.brooks@school.edu" },
];

const replayTemplates: Record<string, ReplayFile[]> = {
  "s-001": [
    {
      filePath: "src/loops.ts",
      baseInsight:
        "Avery improved loop correctness quickly after identifying an off-by-one boundary issue.",
      steps: [
        {
          id: "avery-1",
          title: "Fix loop boundary",
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
        {
          id: "avery-3",
          title: "Extract passing score constant",
          diff: averyStep3Diff,
          before:
            "export function countPassed(scores: number[]) {\n  let passed = 0;\n  for (let i = 0; i < scores.length; i++) {\n    const score = scores[i];\n    if (score >= 70) passed += 1;\n  }\n\n  return passed;\n}\n",
          after:
            "export function countPassed(scores: number[]) {\n  let passed = 0;\n  const PASSING_SCORE = 70;\n\n  for (let i = 0; i < scores.length; i++) {\n    const score = scores[i];\n    if (score >= PASSING_SCORE) passed += 1;\n  }\n\n  return passed;\n}\n",
          durationSeconds: 5,
        },
        {
          id: "avery-4",
          title: "Use for-of and add empty guard",
          diff: averyStep4Diff,
          before:
            "export function countPassed(scores: number[]) {\n  let passed = 0;\n  const PASSING_SCORE = 70;\n\n  for (let i = 0; i < scores.length; i++) {\n    const score = scores[i];\n    if (score >= PASSING_SCORE) passed += 1;\n  }\n\n  return passed;\n}\n",
          after:
            "export function countPassed(scores: number[]) {\n  let passed = 0;\n  const PASSING_SCORE = 70;\n\n  for (const score of scores) {\n    if (score >= PASSING_SCORE) passed += 1;\n  }\n\n  return scores.length === 0 ? 0 : passed;\n}\n",
          durationSeconds: 4,
        },
      ],
    },
  ],
  "s-002": [
    {
      filePath: "src/tree.ts",
      baseInsight:
        "Noah spent less time fixing logic and more time clarifying algorithm communication.",
      steps: [
        {
          id: "noah-1",
          title: "Add traversal explanation",
          diff: noahStep1Diff,
          before:
            "export function dfs(node: Node | null) {\n  if (!node) return [];\n  const left = dfs(node.left);\n  const right = dfs(node.right);\n  return [...left, node.value, ...right];\n}\n",
          after:
            "export function dfs(node: Node | null) {\n  if (!node) return [];\n  const left = dfs(node.left);\n  const right = dfs(node.right);\n\n  // keep root in between left and right traversal\n  return [...left, node.value, ...right];\n}\n",
          durationSeconds: 4,
        },
        {
          id: "noah-2",
          title: "Refine terminology",
          diff: noahStep2Diff,
          before:
            "export function dfs(node: Node | null) {\n  if (!node) return [];\n  const left = dfs(node.left);\n  const right = dfs(node.right);\n\n  // keep root in between left and right traversal\n  return [...left, node.value, ...right];\n}\n",
          after:
            "export function dfs(node: Node | null) {\n  if (!node) return [];\n  const left = dfs(node.left);\n  const right = dfs(node.right);\n\n  // in-order traversal: left, root, right\n  return [...left, node.value, ...right];\n}\n",
          durationSeconds: 3,
        },
        {
          id: "noah-3",
          title: "Clarify traversal wording",
          diff: noahStep3Diff,
          before:
            "export function dfs(node: Node | null) {\n  if (!node) return [];\n  const left = dfs(node.left);\n  const right = dfs(node.right);\n\n  // in-order traversal: left, root, right\n  return [...left, node.value, ...right];\n}\n",
          after:
            "export function dfs(node: Node | null) {\n  if (!node) return [];\n  const left = dfs(node.left);\n  const right = dfs(node.right);\n\n  // in-order traversal: left subtree, root, right subtree\n  return [...left, node.value, ...right];\n}\n",
          durationSeconds: 2,
        },
        {
          id: "noah-4",
          title: "Add spacing for readability",
          diff: noahStep4Diff,
          before:
            "export function dfs(node: Node | null) {\n  if (!node) return [];\n  const left = dfs(node.left);\n  const right = dfs(node.right);\n\n  // in-order traversal: left subtree, root, right subtree\n  return [...left, node.value, ...right];\n}\n",
          after:
            "export function dfs(node: Node | null) {\n  if (!node) return [];\n\n  const left = dfs(node.left);\n  const right = dfs(node.right);\n\n  // in-order traversal: left subtree, root, right subtree\n  return [...left, node.value, ...right];\n}\n",
          durationSeconds: 2,
        },
      ],
    },
  ],
  "s-003": [
    {
      filePath: "src/input.ts",
      baseInsight:
        "Mia improved robustness by tightening validation and normalizing edge-case whitespace.",
      steps: [
        {
          id: "mia-1",
          title: "Trim input first",
          diff: miaStep1Diff,
          before:
            "export function isValidName(name: string) {\n  return name.length > 0;\n}\n\nexport function formatName(name: string) {\n  return name.trim();\n}\n",
          after:
            "export function isValidName(name: string) {\n  const trimmed = name.trim();\n  return trimmed.length > 0;\n}\n\nexport function formatName(name: string) {\n  return name.trim();\n}\n",
          durationSeconds: 5,
        },
        {
          id: "mia-2",
          title: "Strengthen validation",
          diff: miaStep2Diff,
          before:
            "export function isValidName(name: string) {\n  const trimmed = name.trim();\n  return trimmed.length > 0;\n}\n\nexport function formatName(name: string) {\n  return name.trim();\n}\n",
          after:
            "export function isValidName(name: string) {\n  const trimmed = name.trim();\n  return trimmed.length >= 2;\n}\n\nexport function formatName(name: string) {\n  return name.trim().replace(/\\s+/g, \" \");\n}\n",
          durationSeconds: 5,
        },
        {
          id: "mia-3",
          title: "Add upper bound to validation",
          diff: miaStep3Diff,
          before:
            "export function isValidName(name: string) {\n  const trimmed = name.trim();\n  return trimmed.length >= 2;\n}\n\nexport function formatName(name: string) {\n  return name.trim().replace(/\\s+/g, \" \");\n}\n",
          after:
            "export function isValidName(name: string) {\n  const trimmed = name.trim();\n  return trimmed.length >= 2 && trimmed.length <= 40;\n}\n\nexport function formatName(name: string) {\n  return name.trim().replace(/\\s+/g, \" \");\n}\n",
          durationSeconds: 4,
        },
        {
          id: "mia-4",
          title: "Extract trimmed variable in formatter",
          diff: miaStep4Diff,
          before:
            "export function isValidName(name: string) {\n  const trimmed = name.trim();\n  return trimmed.length >= 2 && trimmed.length <= 40;\n}\n\nexport function formatName(name: string) {\n  return name.trim().replace(/\\s+/g, \" \");\n}\n",
          after:
            "export function isValidName(name: string) {\n  const trimmed = name.trim();\n  return trimmed.length >= 2 && trimmed.length <= 40;\n}\n\nexport function formatName(name: string) {\n  const trimmed = name.trim().replace(/\\s+/g, \" \");\n  return trimmed;\n}\n",
          durationSeconds: 4,
        },
      ],
    },
  ],
  "s-004": [
    {
      filePath: "src/copy_constructor.cpp",
      baseInsight:
        "Liam struggled most with copy-constructor semantics and ownership safety.",
      steps: [
        {
          id: "liam-1",
          title: "Replace default copy constructor",
          diff: liamStep1Diff,
          before: "Widget::Widget(const Widget& other) = default;\n",
          after:
            "Widget::Widget(const Widget& other) {\n  size = other.size;\n  data = nullptr;\n}\n",
          durationSeconds: 4,
        },
        {
          id: "liam-2",
          title: "Allocate and copy elements",
          diff: liamStep2Diff,
          before:
            "Widget::Widget(const Widget& other) {\n  size = other.size;\n  data = nullptr;\n}\n",
          after:
            "Widget::Widget(const Widget& other) {\n  size = other.size;\n  data = new int[size];\n  for (int i = 0; i < size; i++) {\n    data[i] = other.data[i];\n  }\n}\n",
          durationSeconds: 6,
        },
        {
          id: "liam-3",
          title: "Handle zero-size safely",
          diff: liamStep3Diff,
          before:
            "Widget::Widget(const Widget& other) {\n  size = other.size;\n  data = new int[size];\n  for (int i = 0; i < size; i++) {\n    data[i] = other.data[i];\n  }\n}\n",
          after:
            "Widget::Widget(const Widget& other) {\n  size = other.size;\n  if (size == 0) {\n    data = nullptr;\n  } else {\n    data = new int[size];\n    for (int i = 0; i < size; i++) data[i] = other.data[i];\n  }\n}\n",
          durationSeconds: 6,
        },
        {
          id: "liam-4",
          title: "Improve constructor readability",
          diff: liamStep4Diff,
          before:
            "Widget::Widget(const Widget& other) {\n  size = other.size;\n  if (size == 0) {\n    data = nullptr;\n  } else {\n    data = new int[size];\n    for (int i = 0; i < size; i++) data[i] = other.data[i];\n  }\n}\n",
          after:
            "Widget::Widget(const Widget& other) {\n  size = other.size;\n\n  if (size == 0) {\n    data = nullptr;\n  } else {\n    data = new int[size];\n    for (int i = 0; i < size; i++) data[i] = other.data[i];\n  }\n}\n",
          durationSeconds: 3,
        },
      ],
    },
  ],
  "s-005": [
    {
      filePath: "src/schedule.ts",
      baseInsight:
        "Zoe iterated quickly on schedule filtering and ordering, with most effort spent on sorting behavior.",
      steps: [
        {
          id: "zoe-1",
          title: "Add spacing and setup",
          diff: zoeStep1Diff,
          before:
            "export function buildSchedule(events: Event[]) {\n  const out: Event[] = [];\n  for (const e of events) {\n    out.push(e);\n  }\n  return out;\n}\n",
          after:
            "export function buildSchedule(events: Event[]) {\n  const out: Event[] = [];\n\n  for (const e of events) {\n    out.push(e);\n  }\n  return out;\n}\n",
          durationSeconds: 2,
        },
        {
          id: "zoe-2",
          title: "Filter disabled events",
          diff: zoeStep2Diff,
          before:
            "export function buildSchedule(events: Event[]) {\n  const out: Event[] = [];\n\n  for (const e of events) {\n    out.push(e);\n  }\n  return out;\n}\n",
          after:
            "export function buildSchedule(events: Event[]) {\n  const out: Event[] = [];\n\n  for (const e of events) {\n    if (e.enabled) out.push(e);\n  }\n\n  return out;\n}\n",
          durationSeconds: 5,
        },
        {
          id: "zoe-3",
          title: "Sort by start time",
          diff: zoeStep3Diff,
          before:
            "export function buildSchedule(events: Event[]) {\n  const out: Event[] = [];\n\n  for (const e of events) {\n    if (e.enabled) out.push(e);\n  }\n\n  return out;\n}\n",
          after:
            "export function buildSchedule(events: Event[]) {\n  const out: Event[] = [];\n\n  for (const e of events) {\n    if (e.enabled) out.push(e);\n  }\n  out.sort((a, b) => a.start - b.start);\n  return out;\n}\n",
          durationSeconds: 6,
        },
        {
          id: "zoe-4",
          title: "Polish formatting",
          diff: zoeStep4Diff,
          before:
            "export function buildSchedule(events: Event[]) {\n  const out: Event[] = [];\n\n  for (const e of events) {\n    if (e.enabled) out.push(e);\n  }\n  out.sort((a, b) => a.start - b.start);\n  return out;\n}\n",
          after:
            "export function buildSchedule(events: Event[]) {\n  const out: Event[] = [];\n\n  for (const e of events) {\n    if (e.enabled) out.push(e);\n  }\n\n  out.sort((a, b) => a.start - b.start);\n  return out;\n}\n",
          durationSeconds: 2,
        },
      ],
    },
  ],
  "s-006": [
    {
      filePath: "src/hints.ts",
      baseInsight:
        "Owen showed steady progress in output formatting, especially around list rendering and clipping.",
      steps: [
        {
          id: "owen-1",
          title: "Handle empty hints",
          diff: owenStep1Diff,
          before:
            "export function renderHints(hints: string[]) {\n  return hints.join(\"\\n\");\n}\n",
          after:
            "export function renderHints(hints: string[]) {\n  if (hints.length === 0) return \"\";\n  return hints.join(\"\\n\");\n}\n",
          durationSeconds: 3,
        },
        {
          id: "owen-2",
          title: "Filter blank hints",
          diff: owenStep2Diff,
          before:
            "export function renderHints(hints: string[]) {\n  if (hints.length === 0) return \"\";\n  return hints.join(\"\\n\");\n}\n",
          after:
            "export function renderHints(hints: string[]) {\n  if (hints.length === 0) return \"\";\n  const cleaned = hints.filter(Boolean);\n  return cleaned.join(\"\\n\");\n}\n",
          durationSeconds: 4,
        },
        {
          id: "owen-3",
          title: "Add numbering",
          diff: owenStep3Diff,
          before:
            "export function renderHints(hints: string[]) {\n  if (hints.length === 0) return \"\";\n  const cleaned = hints.filter(Boolean);\n  return cleaned.join(\"\\n\");\n}\n",
          after:
            "export function renderHints(hints: string[]) {\n  if (hints.length === 0) return \"\";\n  const cleaned = hints.filter(Boolean);\n  const numbered = cleaned.map((hint, idx) => `${idx + 1}. ${hint}`);\n  return numbered.join(\"\\n\");\n}\n",
          durationSeconds: 5,
        },
        {
          id: "owen-4",
          title: "Limit preview length",
          diff: owenStep4Diff,
          before:
            "export function renderHints(hints: string[]) {\n  if (hints.length === 0) return \"\";\n  const cleaned = hints.filter(Boolean);\n  const numbered = cleaned.map((hint, idx) => `${idx + 1}. ${hint}`);\n  return numbered.join(\"\\n\");\n}\n",
          after:
            "export function renderHints(hints: string[]) {\n  if (hints.length === 0) return \"\";\n  const cleaned = hints.filter(Boolean);\n  const numbered = cleaned.map((hint, idx) => `${idx + 1}. ${hint}`);\n  const preview = numbered.slice(0, 20);\n  return preview.join(\"\\n\");\n}\n",
          durationSeconds: 5,
        },
      ],
    },
  ],
};

const assignments: Assignment[] = [
  {
    id: "a1-debugging-foundations",
    title: "Debugging Foundations",
    due: "Feb 28, 2026",
    symbols: ["countPassed", "parseEvents", "scoreSubmission", "copy constructor"],
    classStats: [
      { label: "Class Average Score", value: "76%" },
      { label: "Average Completion Rate", value: "84%" },
      { label: "Avg Time on Assignment", value: "3.8 hrs" },
      { label: "Students Needing Support", value: "7/42" },
    ],
    students: {
      "s-001": {
        stats: [
          { label: "Assignment Score", value: "81%" },
          { label: "Time on Assignment", value: "4.2 hrs" },
          { label: "Compile Errors Resolved", value: "9" },
          { label: "Late Submissions", value: "0" },
        ],
        aiOverview: [
          "Avery improved quickly after identifying loop boundary issues.",
          "Main struggle area was maintaining confidence when first fix did not pass all tests.",
        ],
      },
      "s-002": {
        stats: [
          { label: "Assignment Score", value: "88%" },
          { label: "Time on Assignment", value: "3.6 hrs" },
          { label: "Compile Errors Resolved", value: "4" },
          { label: "Late Submissions", value: "0" },
        ],
        aiOverview: [
          "Noah was consistent and mostly focused on explanatory clarity.",
          "Could improve by planning rationale comments before implementation.",
        ],
      },
      "s-003": {
        stats: [
          { label: "Assignment Score", value: "73%" },
          { label: "Time on Assignment", value: "5.0 hrs" },
          { label: "Compile Errors Resolved", value: "11" },
          { label: "Late Submissions", value: "1" },
        ],
        aiOverview: [
          "Mia's strongest gains were around input-validation edge cases.",
          "Still needs support in decomposing tasks before coding.",
        ],
      },
      "s-004": {
        stats: [
          { label: "Assignment Score", value: "67%" },
          { label: "Time on Assignment", value: "5.4 hrs" },
          { label: "Compile Errors Resolved", value: "15" },
          { label: "Late Submissions", value: "1" },
        ],
        aiOverview: [
          "Liam's major blocker was copy semantics and memory ownership.",
          "Needs targeted review on constructor/operator rules and object lifecycle.",
        ],
      },
      "s-005": {
        stats: [
          { label: "Assignment Score", value: "86%" },
          { label: "Time on Assignment", value: "3.9 hrs" },
          { label: "Compile Errors Resolved", value: "5" },
          { label: "Late Submissions", value: "0" },
        ],
        aiOverview: [
          "Zoe moved quickly from basic filtering to sorted output behavior.",
          "Main challenge was preserving stable ordering while adding constraints.",
        ],
      },
      "s-006": {
        stats: [
          { label: "Assignment Score", value: "78%" },
          { label: "Time on Assignment", value: "4.1 hrs" },
          { label: "Compile Errors Resolved", value: "8" },
          { label: "Late Submissions", value: "0" },
        ],
        aiOverview: [
          "Owen improved output formatting incrementally with smaller safe edits.",
          "Still spends extra time on deciding when and where to clip output.",
        ],
      },
    },
    heatmap: {
      "s-001": { countPassed: 48, parseEvents: 30, scoreSubmission: 35, "copy constructor": 65 },
      "s-002": { countPassed: 25, parseEvents: 20, scoreSubmission: 31, "copy constructor": 58 },
      "s-003": { countPassed: 57, parseEvents: 61, scoreSubmission: 55, "copy constructor": 72 },
      "s-004": { countPassed: 69, parseEvents: 67, scoreSubmission: 63, "copy constructor": 91 },
      "s-005": { countPassed: 29, parseEvents: 33, scoreSubmission: 37, "copy constructor": 52 },
      "s-006": { countPassed: 54, parseEvents: 47, scoreSubmission: 44, "copy constructor": 69 },
    },
    narratives: {
      "s-001": {
        countPassed: "Avery initially used <= in loop termination and fixed it after failing edge tests.",
        parseEvents: "Minimal struggle; resolved quickly after adding a null guard.",
        scoreSubmission: "Needed one retry to align rubric scoring branch conditions.",
        "copy constructor": "Some confusion around why shallow copy breaks mutable arrays.",
      },
      "s-002": {
        countPassed: "Noah implemented correctly with minor naming cleanup.",
        parseEvents: "Smooth completion with no major issue patterns.",
        scoreSubmission: "Small adjustment to match expected boundary scoring.",
        "copy constructor": "Understood conceptually but lacked confidence in ownership explanation.",
      },
      "s-003": {
        countPassed: "Repeated boundary errors before stabilizing with focused tests.",
        parseEvents: "Needed support translating prompt language into control flow.",
        scoreSubmission: "Several branch condition reversals before final correction.",
        "copy constructor": "Struggled with deep copy mechanics and pointer lifecycle assumptions.",
      },
      "s-004": {
        countPassed: "Slow progress due to uncertainty in for-loop bounds.",
        parseEvents: "Multiple retries around symbol parsing and default cases.",
        scoreSubmission: "Difficulty mapping rubric states to branches.",
        "copy constructor": "Primary blocker: attempted default copy and caused aliasing bugs.",
      },
      "s-005": {
        countPassed: "Low struggle after quickly validating boundary tests.",
        parseEvents: "Minor friction around preserving input order while filtering.",
        scoreSubmission: "Needed one pass to align edge threshold handling.",
        "copy constructor": "Understood deep copy concept but needed syntax reminders.",
      },
      "s-006": {
        countPassed: "Moderate struggle with early-return placement.",
        parseEvents: "Stabilized after adding small checkpoint logs.",
        scoreSubmission: "Occasional branch order confusion resolved with test cases.",
        "copy constructor": "Improved after mapping object ownership explicitly.",
      },
    },
    replay: replayTemplates,
  },
  {
    id: "a2-function-design",
    title: "Function Design and Testing",
    due: "Mar 10, 2026",
    symbols: ["validateInput", "buildSchedule", "renderHints"],
    classStats: [
      { label: "Class Average Score", value: "79%" },
      { label: "Average Completion Rate", value: "87%" },
      { label: "Avg Time on Assignment", value: "3.2 hrs" },
      { label: "Students Needing Support", value: "5/42" },
    ],
    students: {
      "s-001": {
        stats: [
          { label: "Assignment Score", value: "84%" },
          { label: "Time on Assignment", value: "3.4 hrs" },
          { label: "Compile Errors Resolved", value: "6" },
          { label: "Late Submissions", value: "0" },
        ],
        aiOverview: [
          "Strong on structure; should include more boundary test notes.",
          "Had mild difficulty with validating nested optional fields.",
        ],
      },
      "s-002": {
        stats: [
          { label: "Assignment Score", value: "90%" },
          { label: "Time on Assignment", value: "2.8 hrs" },
          { label: "Compile Errors Resolved", value: "2" },
          { label: "Late Submissions", value: "0" },
        ],
        aiOverview: [
          "Very efficient progression and clear decomposition.",
          "Opportunity: communicate tradeoffs in helper-function naming.",
        ],
      },
      "s-003": {
        stats: [
          { label: "Assignment Score", value: "74%" },
          { label: "Time on Assignment", value: "4.6 hrs" },
          { label: "Compile Errors Resolved", value: "10" },
          { label: "Late Submissions", value: "0" },
        ],
        aiOverview: [
          "Needed significant retries for validation flow.",
          "Improved after writing smaller helper functions.",
        ],
      },
      "s-004": {
        stats: [
          { label: "Assignment Score", value: "70%" },
          { label: "Time on Assignment", value: "4.9 hrs" },
          { label: "Compile Errors Resolved", value: "12" },
          { label: "Late Submissions", value: "1" },
        ],
        aiOverview: [
          "Most time spent debugging composed function interfaces.",
          "Needs reinforcement on incremental test-first strategy.",
        ],
      },
      "s-005": {
        stats: [
          { label: "Assignment Score", value: "89%" },
          { label: "Time on Assignment", value: "3.1 hrs" },
          { label: "Compile Errors Resolved", value: "3" },
          { label: "Late Submissions", value: "0" },
        ],
        aiOverview: [
          "Zoe handled function composition well and iterated mostly on polish.",
          "Could improve by documenting edge behavior before implementation.",
        ],
      },
      "s-006": {
        stats: [
          { label: "Assignment Score", value: "76%" },
          { label: "Time on Assignment", value: "4.2 hrs" },
          { label: "Compile Errors Resolved", value: "9" },
          { label: "Late Submissions", value: "0" },
        ],
        aiOverview: [
          "Owen improved significantly in render function structure over time.",
          "Needs additional practice with validation guard ordering.",
        ],
      },
    },
    heatmap: {
      "s-001": { validateInput: 45, buildSchedule: 38, renderHints: 30 },
      "s-002": { validateInput: 22, buildSchedule: 26, renderHints: 24 },
      "s-003": { validateInput: 71, buildSchedule: 62, renderHints: 58 },
      "s-004": { validateInput: 77, buildSchedule: 74, renderHints: 66 },
      "s-005": { validateInput: 31, buildSchedule: 36, renderHints: 33 },
      "s-006": { validateInput: 59, buildSchedule: 52, renderHints: 63 },
    },
    narratives: {
      "s-001": {
        validateInput: "Avery fixed nested empty-input paths after adding targeted tests.",
        buildSchedule: "Moderate effort balancing readability and special-case branching.",
        renderHints: "Low struggle; polished output quickly.",
      },
      "s-002": {
        validateInput: "Minimal friction and clean decomposition.",
        buildSchedule: "One short revision to handle day rollover edge case.",
        renderHints: "Completed quickly with precise formatting.",
      },
      "s-003": {
        validateInput: "Frequent retries due to missed null/undefined combinations.",
        buildSchedule: "Struggled with helper boundaries and duplicate logic.",
        renderHints: "Needed support on deterministic ordering in output.",
      },
      "s-004": {
        validateInput: "Primary blocker with guard ordering and early returns.",
        buildSchedule: "Difficulties with state mutation across helper calls.",
        renderHints: "Several formatting regressions before final cleanup.",
      },
      "s-005": {
        validateInput: "Low struggle once optional-field checks were ordered correctly.",
        buildSchedule: "Moderate effort around sorting and preserving enabled events.",
        renderHints: "Mostly polish passes for consistent output style.",
      },
      "s-006": {
        validateInput: "Needed multiple attempts to settle on stable guard sequence.",
        buildSchedule: "Steady improvement after decomposing into helper sections.",
        renderHints: "Main issue was output clipping and numbering consistency.",
      },
    },
    replay: replayTemplates,
  },
];

const courses: Course[] = [
  {
    id: "cs50-spring26",
    title: "CS50: Intro to Computer Science",
    role: "Instructor",
    term: "Spring 2026",
    assignments,
  },
  {
    id: "cs210-spring26",
    title: "CS210: Data Structures",
    role: "TA",
    term: "Spring 2026",
    assignments,
  },
  {
    id: "engr101-spring26",
    title: "ENGR101: Computing for Engineers",
    role: "Instructor",
    term: "Spring 2026",
    assignments,
  },
];

const appShellStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f4f8ff",
  color: "#0f172a",
};

function scoreColor(score: number) {
  if (score >= 80) return "#991b1b";
  if (score >= 65) return "#dc2626";
  if (score >= 50) return "#f97316";
  if (score >= 35) return "#facc15";
  return "#22c55e";
}

function sharedPrefixLength(a: string, b: string) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i += 1;
  return i;
}

function findCourse(courseId?: string) {
  return courses.find((course) => course.id === courseId);
}

function findAssignment(course: Course | undefined, assignmentId?: string) {
  return course?.assignments.find((assignment) => assignment.id === assignmentId);
}

function topStruggleSummary(assignment: Assignment) {
  let bestSymbol = assignment.symbols[0] ?? "";
  let bestPercent = -1;

  for (const symbol of assignment.symbols) {
    const percent =
      (students.filter((student) => (assignment.heatmap[student.id]?.[symbol] ?? 0) >= 60).length /
        students.length) *
      100;
    if (percent > bestPercent) {
      bestPercent = percent;
      bestSymbol = symbol;
    }
  }

  return `${bestSymbol} was a problem for ${Math.round(bestPercent)}% of the class.`;
}

function Navbar({ onSignOut }: { onSignOut: () => Promise<void> }) {
  const location = useLocation();
  const items = [
    { label: "Dashboard", to: "/" },
    { label: "FAQ / How To Use", to: "/faq" },
    { label: "About Our Product", to: "/about" },
    { label: "Account", to: "/account" },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 5,
        backdropFilter: "blur(10px)",
        background: "rgba(248, 250, 252, 0.88)",
        borderBottom: "1px solid #cbd5e1",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0.9rem 1.1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ fontWeight: 800, letterSpacing: 0.5 }}>JumBud</div>
        <nav style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", flex: 1 }}>
          {items.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link ${active ? "nav-link--active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button className="btn btn-secondary" onClick={() => void onSignOut()} style={{ padding: "0.45rem 0.75rem" }}>
          Sign Out
        </button>
      </div>
    </header>
  );
}

function LoginPage({ onLogin }: { onLogin: (email: string, password: string) => Promise<string | null> }) {
  const [email, setEmail] = useState("professor@codeactivity.test");
  const [password, setPassword] = useState("testpass123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const nextError = await onLogin(email, password);
    if (nextError) setError(nextError);
    setLoading(false);
  }

  return (
    <div
      className="login-root"
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#eaf1ff",
        padding: "1rem",
      }}
    >
      <div
        className="surface-card"
        style={{
          width: "min(940px, 100%)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          background: "rgba(255,255,255,0.96)",
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 14px 32px rgba(30, 64, 175, 0.16)",
        }}
      >
        <section style={{ padding: "2rem", background: "#1e40af", color: "white" }}>
          <h1 style={{ marginTop: 0, fontSize: 34, lineHeight: 1.1 }}>JumBud Instructor Portal</h1>
          <p style={{ opacity: 0.92, fontSize: 15 }}>
            Track student learning progress, analyze assignment bottlenecks, and replay coding evolution from one dashboard.
          </p>
          <ul style={{ paddingLeft: 18, fontSize: 14, lineHeight: 1.5 }}>
            <li>Course-level visibility similar to Gradescope workflows</li>
            <li>Assignment-level struggles with symbol/function heatmaps</li>
            <li>Student replay timeline with AI insight context</li>
          </ul>
        </section>

        <section style={{ padding: "2rem" }}>
          <h2 style={{ marginTop: 0 }}>Sign In</h2>
          <p style={{ color: "#475569", marginTop: 0 }}>Use your instructor account to continue.</p>
          <form onSubmit={submit}>
            <label style={{ display: "block", marginBottom: "0.35rem", fontWeight: 600 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "0.7rem", borderRadius: 8, border: "1px solid #cbd5e1", marginBottom: "0.8rem" }}
            />
            <label style={{ display: "block", marginBottom: "0.35rem", fontWeight: 600 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "0.7rem", borderRadius: 8, border: "1px solid #cbd5e1", marginBottom: "0.8rem" }}
            />
            {error && <p style={{ color: "#dc2626", marginTop: 0 }}>{error}</p>}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%", padding: "0.75rem", background: "#1d4ed8", color: "white", border: "none", borderRadius: 8, fontWeight: 700 }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

function DashboardPage() {
  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "1rem 1.1rem 2rem" }}>
      <h1 style={{ marginBottom: "0.3rem" }}>Dashboard</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>Select a course to inspect assignments and student performance.</p>

      <section className="surface-card" style={{ border: "1px solid #cbd5e1", borderRadius: 12, overflow: "hidden", background: "white" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8fafc", textAlign: "left" }}>
            <tr>
              <th style={{ padding: "0.75rem", borderBottom: "1px solid #cbd5e1" }}>Course</th>
              <th style={{ padding: "0.75rem", borderBottom: "1px solid #cbd5e1" }}>Role</th>
              <th style={{ padding: "0.75rem", borderBottom: "1px solid #cbd5e1" }}>Term</th>
              <th style={{ padding: "0.75rem", borderBottom: "1px solid #cbd5e1" }}>Open</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td style={{ padding: "0.75rem", borderBottom: "1px solid #e2e8f0", fontWeight: 600 }}>{course.title}</td>
                <td style={{ padding: "0.75rem", borderBottom: "1px solid #e2e8f0" }}>{course.role}</td>
                <td style={{ padding: "0.75rem", borderBottom: "1px solid #e2e8f0" }}>{course.term}</td>
                <td style={{ padding: "0.75rem", borderBottom: "1px solid #e2e8f0" }}>
                  <Link to={`/${course.id}`} className="text-link" style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>
                    View Course
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

function CoursePage() {
  const { courseId } = useParams();
  const course = findCourse(courseId);
  if (!course) return <NotFoundPage />;

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "1rem 1.1rem 2rem" }}>
      <h1 style={{ marginBottom: "0.3rem" }}>{course.title}</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>
        {course.role} • {course.term}
      </p>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.9rem" }}>
        {course.assignments.map((assignment) => (
          <article className="surface-card" key={assignment.id} style={{ border: "1px solid #cbd5e1", borderRadius: 12, padding: "1rem", background: "white" }}>
            <h2 style={{ marginTop: 0, marginBottom: "0.35rem", fontSize: 19 }}>{assignment.title}</h2>
            <p style={{ margin: "0 0 0.8rem", color: "#475569" }}>Due: {assignment.due}</p>
            <Link to={`/${course.id}/${assignment.id}`} className="text-link" style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>
              Open Assignment
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}

function AssignmentPage() {
  const { courseId, assignment: assignmentId } = useParams();
  const course = findCourse(courseId);
  const assignment = findAssignment(course, assignmentId);

  const [selectedStudentId, setSelectedStudentId] = useState(students[0].id);
  const [selectedCell, setSelectedCell] = useState<{ studentId: string; symbol: string } | null>(null);

  useEffect(() => {
    setSelectedStudentId(students[0].id);
    setSelectedCell(null);
  }, [courseId, assignmentId]);

  if (!course || !assignment) return <NotFoundPage />;

  const selectedStudent = students.find((student) => student.id === selectedStudentId) ?? students[0];
  const selectedStudentAssignmentData = assignment.students[selectedStudentId];

  const narrative =
    selectedCell && assignment.narratives[selectedCell.studentId]
      ? assignment.narratives[selectedCell.studentId][selectedCell.symbol]
      : "Click any heatmap cell to drill into that student's narrative for a specific function or symbol.";

  const summary = topStruggleSummary(assignment);

  return (
    <main style={{ maxWidth: 1240, margin: "0 auto", padding: "1rem 1.1rem 2rem" }}>
      <h1 style={{ marginBottom: "0.3rem" }}>{assignment.title}</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>
        {course.title} • Due {assignment.due}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "260px minmax(380px, 1fr)", gap: "1rem" }}>
        <aside style={{ border: "1px solid #cbd5e1", borderRadius: 12, background: "white", padding: "0.8rem" }}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>Students</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {students.map((student) => (
              <li key={student.id} style={{ marginBottom: "0.55rem" }}>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "0.45rem" }}>
                  <button
                    onClick={() => setSelectedStudentId(student.id)}
                    className="student-button"
                    style={{
                      width: "100%",
                      textAlign: "left",
                      border: "none",
                      background: selectedStudentId === student.id ? "#dbeafe" : "transparent",
                      padding: "0.35rem",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{student.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{student.email}</div>
                  </button>
                  <Link
                    to={`/${course.id}/${assignment.id}/${student.id}`}
                    className="text-link"
                    style={{ display: "inline-block", marginTop: "0.35rem", fontSize: 13, color: "#1d4ed8", textDecoration: "none", fontWeight: 700 }}
                  >
                    Details
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        <section style={{ display: "grid", gap: "1rem" }}>
          <section style={{ border: "1px solid #cbd5e1", borderRadius: 12, background: "white", padding: "1rem" }}>
            <h2 style={{ marginTop: 0, marginBottom: "0.3rem" }}>Student Assignment Stats: {selectedStudent.name}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 1fr) minmax(260px, 1.1fr)", gap: "1rem" }}>
              <div>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {selectedStudentAssignmentData.stats.map((item) => (
                    <li key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #e2e8f0" }}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "0.75rem", background: "#f8fafc" }}>
                <h3 style={{ marginTop: 0, marginBottom: "0.5rem", fontSize: 16 }}>AI Student Overview</h3>
                {selectedStudentAssignmentData.aiOverview.map((line) => (
                  <p key={line} style={{ margin: "0 0 0.45rem", lineHeight: 1.35 }}>
                    {line}
                  </p>
                ))}
                <p style={{ marginBottom: 0, color: "#64748b", fontSize: 13 }}>Placeholder for model output integration.</p>
              </div>
            </div>
          </section>

          <section style={{ border: "1px solid #cbd5e1", borderRadius: 12, background: "white", padding: "1rem" }}>
            <h2 style={{ marginTop: 0, marginBottom: "0.35rem" }}>Overall Class Statistics</h2>
            <ul style={{ listStyle: "none", margin: "0 0 0.8rem", padding: 0 }}>
              {assignment.classStats.map((item) => (
                <li key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.45rem 0", borderBottom: "1px solid #e2e8f0" }}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </li>
              ))}
            </ul>

            <h3 style={{ marginTop: "0.8rem", marginBottom: "0.4rem" }}>Function/Symbol Struggle Heatmap</h3>
            <p style={{ marginTop: 0, color: "#475569" }}>{summary}</p>

            <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: 8 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
                <thead style={{ background: "#f8fafc" }}>
                  <tr>
                    <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid #e2e8f0" }}>Student</th>
                    {assignment.symbols.map((symbol) => (
                      <th key={symbol} style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid #e2e8f0", fontWeight: 600 }}>
                        {symbol}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td style={{ padding: "0.45rem 0.5rem", borderBottom: "1px solid #f1f5f9", fontWeight: 600 }}>{student.name}</td>
                      {assignment.symbols.map((symbol) => {
                        const score = assignment.heatmap[student.id]?.[symbol] ?? 0;
                        const active = selectedCell?.studentId === student.id && selectedCell.symbol === symbol;
                        return (
                          <td key={`${student.id}-${symbol}`} style={{ padding: "0.3rem 0.45rem", borderBottom: "1px solid #f1f5f9" }}>
                            <button
                              onClick={() => setSelectedCell({ studentId: student.id, symbol })}
                              style={{
                                width: "100%",
                                border: active ? "2px solid #1d4ed8" : "1px solid #cbd5e1",
                                borderRadius: 6,
                                background: scoreColor(score),
                                color: score >= 65 ? "#fff" : "#0f172a",
                                padding: "0.35rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                transition: "filter 140ms ease",
                              }}
                            >
                              {score}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: "0.8rem", border: "1px solid #e2e8f0", borderRadius: 8, background: "#f8fafc", padding: "0.75rem" }}>
              <h4 style={{ marginTop: 0, marginBottom: "0.35rem" }}>Narrative Drilldown</h4>
              <p style={{ margin: 0, lineHeight: 1.4 }}>{narrative}</p>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function ReplayPage() {
  const { courseId, assignment: assignmentId, student: studentId } = useParams();
  const course = findCourse(courseId);
  const assignment = findAssignment(course, assignmentId);
  const student = students.find((item) => item.id === studentId);

  const replayFiles = assignment?.replay[studentId ?? ""] ?? [];
  const [selectedFilePath, setSelectedFilePath] = useState(replayFiles[0]?.filePath ?? "");
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [displayCode, setDisplayCode] = useState("");
  const [insights, setInsights] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setSelectedFilePath(replayFiles[0]?.filePath ?? "");
    setStepIndex(0);
    setIsPlaying(false);
  }, [courseId, assignmentId, studentId]);

  const selectedFile = replayFiles.find((file) => file.filePath === selectedFilePath) ?? replayFiles[0];
  const steps = selectedFile?.steps ?? [];
  const step = steps[stepIndex];
  const totalDuration = steps.reduce((sum, item) => sum + item.durationSeconds, 0);

  useEffect(() => {
    setStepIndex(0);
    setIsPlaying(false);
    setInsights(selectedFile ? [selectedFile.baseInsight] : []);
  }, [selectedFilePath]);

  useEffect(() => {
    if (!step) {
      setDisplayCode("");
      return;
    }
    const prefix = sharedPrefixLength(step.before, step.after);
    let currentText = step.before;
    let timeoutId = 0;
    let canceled = false;

    setDisplayCode(currentText);

    const deletePhase = () => {
      if (canceled) return;
      if (currentText.length > prefix) {
        currentText = currentText.slice(0, -1);
        setDisplayCode(currentText);
        timeoutId = window.setTimeout(deletePhase, 7);
        return;
      }
      timeoutId = window.setTimeout(typePhase, 55);
    };

    const typePhase = () => {
      if (canceled) return;
      if (currentText.length < step.after.length) {
        currentText = step.after.slice(0, currentText.length + 1);
        setDisplayCode(currentText);
        timeoutId = window.setTimeout(typePhase, 7);
      }
    };

    timeoutId = window.setTimeout(deletePhase, 130);

    return () => {
      canceled = true;
      window.clearTimeout(timeoutId);
    };
  }, [selectedFilePath, stepIndex, step]);

  useEffect(() => {
    if (!isPlaying || !step || stepIndex >= steps.length - 1) {
      if (stepIndex >= steps.length - 1) setIsPlaying(false);
      return;
    }
    const timerId = window.setTimeout(
      () => setStepIndex((prev) => Math.min(prev + 1, steps.length - 1)),
      Math.max(700, step.durationSeconds * 900),
    );
    return () => window.clearTimeout(timerId);
  }, [isPlaying, step, stepIndex, steps]);

  if (!course || !assignment || !student) return <NotFoundPage />;

  function playPause() {
    if (steps.length === 0) return;
    if (stepIndex >= steps.length - 1) {
      setStepIndex(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((prev) => !prev);
  }

  function submitInsight(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = query.trim();
    if (!cleaned) return;
    setInsights((prev) => [
      ...prev,
      `Teacher: ${cleaned}`,
      "AI: Placeholder answer. Connect this input to your LLM endpoint and append model output here.",
    ]);
    setQuery("");
  }

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "1rem 1.1rem 2rem" }}>
      <h1 style={{ marginBottom: "0.25rem" }}>{assignment.title} • Progress Replay</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>
        {student.name} ({student.email})
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
        <section style={{ border: "1px solid #cbd5e1", borderRadius: 12, background: "white", padding: "0.75rem" }}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>File Tree</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {replayFiles.map((file) => (
              <li key={file.filePath} style={{ marginBottom: "0.4rem" }}>
                <button
                  className="file-tree-button"
                  onClick={() => setSelectedFilePath(file.filePath)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "0.45rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    background: selectedFilePath === file.filePath ? "#dbeafe" : "#fff",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {file.filePath}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section style={{ border: "1px solid #cbd5e1", borderRadius: 12, background: "white", padding: "0.75rem" }}>
          <div style={{ border: "1px solid #1e293b", borderRadius: 8, background: "#0f172a", padding: "0.75rem", marginBottom: "0.8rem" }}>
            <p style={{ color: "#cbd5e1", marginTop: 0, marginBottom: "0.45rem" }}>
              Editing <code>{selectedFile?.filePath ?? "-"}</code>
            </p>
            <pre
              style={{
                margin: 0,
                color: "#e2e8f0",
                minHeight: 280,
                whiteSpace: "pre-wrap",
                fontSize: 13,
                lineHeight: 1.45,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              {displayCode || "// No replay data for this file."}
            </pre>
          </div>

          <div style={{ marginBottom: "0.65rem" }}>
            <p style={{ marginTop: 0, marginBottom: "0.35rem", fontSize: 12, color: "#64748b" }}>
              Timeline ({stepIndex + 1}/{Math.max(steps.length, 1)})
            </p>
            <div style={{ display: "flex", height: 18, overflow: "hidden", borderRadius: 999, border: "1px solid #cbd5e1" }}>
              {steps.map((entry, idx) => {
                const width = totalDuration > 0 ? (entry.durationSeconds / totalDuration) * 100 : 0;
                const active = idx === stepIndex;
                return (
                  <button
                    className="timeline-segment"
                    key={entry.id}
                    onClick={() => {
                      setIsPlaying(false);
                      setStepIndex(idx);
                    }}
                    title={`${entry.title} (${entry.durationSeconds}s)`}
                    style={{ width: `${width}%`, border: "none", borderRight: "1px solid #bfdbfe", background: active ? "#2563eb" : "#93c5fd", cursor: "pointer" }}
                  />
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              className="btn-icon"
              onClick={() => {
                setIsPlaying(false);
                setStepIndex((prev) => Math.max(prev - 1, 0));
              }}
              disabled={stepIndex === 0}
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
              className="btn-icon btn-icon-lg"
              onClick={playPause}
              disabled={steps.length === 0}
              aria-label={isPlaying ? "Pause" : "Play"}
              title={isPlaying ? "Pause" : "Play"}
              style={{ width: 44, height: 44, borderRadius: 999, display: "grid", placeItems: "center" }}
            >
              {isPlaying ? (
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
              className="btn-icon"
              onClick={() => {
                setIsPlaying(false);
                setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
              }}
              disabled={stepIndex >= steps.length - 1}
              aria-label="Next step"
              title="Next step"
              style={{ width: 36, height: 36, display: "grid", placeItems: "center" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="12" y="3" width="2" height="10" fill="currentColor" />
                <path d="M4 3L11 8L4 13V3Z" fill="currentColor" />
              </svg>
            </button>
            <span style={{ fontSize: 12, color: "#64748b" }}>{step?.title ?? "No step selected"}</span>
          </div>
        </section>

        <section style={{ border: "1px solid #cbd5e1", borderRadius: 12, background: "white", padding: "0.75rem", display: "flex", flexDirection: "column", minHeight: 450 }}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>AI Insights</h2>
          <div style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: 8, background: "#f8fafc", padding: "0.6rem", overflowY: "auto", marginBottom: "0.6rem" }}>
            {insights.map((line, idx) => (
              <p key={`${idx}-${line}`} style={{ margin: "0 0 0.5rem", lineHeight: 1.35 }}>
                {line}
              </p>
            ))}
          </div>
          <form onSubmit={submitInsight} style={{ display: "flex", gap: "0.45rem" }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask AI about this student and file..."
              style={{ flex: 1, padding: "0.55rem" }}
            />
            <button type="submit" style={{ padding: "0.55rem 0.8rem" }}>
              Send
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function GenericPage({ title, body }: { title: string; body: string }) {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "1rem 1.1rem 2rem" }}>
      <h1>{title}</h1>
      <p style={{ color: "#475569", lineHeight: 1.5 }}>{body}</p>
    </main>
  );
}

function NotFoundPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "1rem 1.1rem 2rem" }}>
      <h1>Not Found</h1>
      <p style={{ color: "#475569" }}>This page does not exist in the current routing setup.</p>
      <Link to="/" style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>
        Back to Dashboard
      </Link>
    </main>
  );
}

function AuthedApp({ onSignOut }: { onSignOut: () => Promise<void> }) {
  return (
    <BrowserRouter>
      <div style={appShellStyle}>
        <Navbar onSignOut={onSignOut} />
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route
            path="/faq"
            element={
              <GenericPage
                title="FAQ / How To Use"
                body="Use Dashboard to choose a course, click into assignments, inspect student and class stats, then open Details for per-student replay and AI-supported insight threads."
              />
            }
          />
          <Route
            path="/about"
            element={
              <GenericPage
                title="About Our Product"
                body="JumBud helps instructors identify where students struggle by combining assignment analytics, replay-based development traces, and AI-assisted interpretation of learning behaviors."
              />
            }
          />
          <Route
            path="/account"
            element={
              <GenericPage
                title="Account"
                body="Account settings can be connected here. Current demo includes authentication via Supabase and role-aware course navigation."
              />
            }
          />
          <Route path="/:courseId" element={<CoursePage />} />
          <Route path="/:courseId/:assignment" element={<AssignmentPage />} />
          <Route path="/:courseId/:assignment/:student" element={<ReplayPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogin(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      window.history.replaceState(null, "", "/");
    }
    return error?.message ?? null;
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  if (!session) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <AuthedApp onSignOut={handleSignOut} />;
}

export default App;
