// Mock comments generator for development
import type { Comment, HazardReport } from "@weather/types";

const sampleNames = [
  "Amit",
  "Neha",
  "Vikram",
  "Priya",
  "Sanjay",
  "Radhika",
  "Kiran",
  "Meera",
  "Ravi",
  "Anita",
];

const sampleComments = [
  "Please stay safe everyone near the coast.",
  "Can confirm, saw similar conditions nearby.",
  "Any update from officials?",
  "Thanks for reporting this.",
  "Roads are getting waterlogged here too.",
  "Avoid the promenade until the tide recedes.",
  "Local authorities have put up warning signs.",
  "Strong winds picking up now.",
  "Hearing sirens, looks serious.",
  "Sharing this with my community group.",
];

function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function getMockCommentsForReport(
  report: Pick<HazardReport, "id" | "timestamp" | "type">
): Comment[] {
  const seed = Array.from(`${report.id}-${report.timestamp}-${report.type}`).reduce(
    (acc, ch) => acc + ch.charCodeAt(0),
    0
  );
  const rand = seededRandom(seed);

  const count = Math.max(1, Math.floor(rand() * 4) + 1); // 1-5 comments
  const now = new Date(report.timestamp).getTime();

  const comments: Comment[] = Array.from({ length: count }).map((_, idx) => {
    const name = sampleNames[Math.floor(rand() * sampleNames.length)];
    const text = sampleComments[Math.floor(rand() * sampleComments.length)];
    const minutesAgo = Math.floor(rand() * 240) + idx * 3; // up to ~4h ago
    const ts = new Date(now + minutesAgo * 60 * 1000).toISOString();
    return {
      id: `${report.id}-c${idx + 1}`,
      author: name,
      text,
      timestamp: ts,
    };
  });

  return comments;
}
