/**
 * LLM-based Scene Composer — uses Claude API via tool_use for structured output.
 *
 * Falls back to rule-based composition on failure.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { ScriptSection, ComposedScene } from "./types";
import type { TransitionType } from "../types";
import { buildSystemPrompt, buildUserPrompt, buildFewShotSection, type PromptContext } from "./prompt-builder";
import { selectTransition } from "./rules";

// ── Tool schema for structured output ──

const COMPOSED_SCENE_TOOL: Anthropic.Tool = {
  name: "compose_scene",
  description: "Output the composed scene layout as structured data.",
  input_schema: {
    type: "object" as const,
    properties: {
      layout: {
        type: "string",
        enum: ["FullScreen", "CenterLayout", "SplitLayout", "TopBottomLayout", "GridLayout", "FocusLayout"],
      },
      layoutProps: {
        type: "object",
        properties: {
          ratio: { type: "number" },
          columns: { type: "number" },
          topHeight: { type: "number" },
        },
      },
      background: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["solid", "gradient", "radial"] },
          color: { type: "string" },
          from: { type: "string" },
          to: { type: "string" },
          angle: { type: "number" },
        },
        required: ["type"],
      },
      elements: {
        type: "array",
        items: {
          type: "object",
          properties: {
            component: { type: "string" },
            props: { type: "object" },
            position: {
              type: "object",
              properties: {
                x: { type: "number" },
                y: { type: "number" },
              },
              required: ["x", "y"],
            },
            enterAt: { type: "number" },
            durationInFrames: { type: "number" },
            animation: {
              type: "object",
              properties: {
                enter: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    durationInFrames: { type: "number" },
                    easing: { type: "string" },
                    direction: { type: "string" },
                  },
                  required: ["type", "durationInFrames"],
                },
                during: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    durationInFrames: { type: "number" },
                  },
                },
                exit: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    durationInFrames: { type: "number" },
                  },
                },
              },
              required: ["enter"],
            },
          },
          required: ["component", "props", "position", "enterAt", "animation"],
        },
      },
      transition: {
        type: ["object", "null"] as any,
        properties: {
          type: { type: "string" },
          durationInFrames: { type: "number" },
          color: { type: "string" },
        },
      },
      cameraMotion: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["ken_burns", "zoom_focus", "drift"] },
          endScale: { type: "number" },
          panX: { type: "number" },
          panY: { type: "number" },
        },
      },
    },
    required: ["layout", "background", "elements", "transition"],
  },
};

// ── Client ──

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }
  return new Anthropic({ apiKey });
}

// ── Single section compose ──

export async function composeSectionWithLLM(
  section: ScriptSection,
  context: {
    sceneIndex: number;
    totalScenes: number;
    prevTransition: TransitionType | null;
    prevScene?: ComposedScene;
  },
): Promise<ComposedScene> {
  const client = getClient();

  const promptCtx: PromptContext = {
    section,
    prevTransition: context.prevTransition,
    sceneIndex: context.sceneIndex,
    totalScenes: context.totalScenes,
  };

  const systemPrompt = buildSystemPrompt() + "\n\n" + buildFewShotSection();

  let userPrompt = buildUserPrompt(promptCtx);

  // Include previous scene for visual continuity
  if (context.prevScene) {
    const prevElements = context.prevScene.elements
      .map((e) => e.component)
      .join(", ");
    userPrompt += `\n\nPrevious scene used components: [${prevElements}]`;
    if (context.prevScene.cameraMotion) {
      userPrompt += `\nPrevious camera: ${context.prevScene.cameraMotion.type}`;
    }
  }

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: systemPrompt,
    tools: [COMPOSED_SCENE_TOOL],
    tool_choice: { type: "tool", name: "compose_scene" },
    messages: [{ role: "user", content: userPrompt }],
  });

  // Extract tool use result
  const toolBlock = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
  );

  if (!toolBlock) {
    throw new Error("LLM did not return a tool_use block");
  }

  return toolBlock.input as unknown as ComposedScene;
}

// ── Full sequence compose ──

export async function composeSequenceWithLLM(
  sections: ScriptSection[],
  options?: { fps?: number; colorPalette?: string[] },
): Promise<ComposedScene[]> {
  const results: ComposedScene[] = [];
  let prevTransition: TransitionType | null = null;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const prevScene = results[i - 1];

    try {
      const scene = await composeSectionWithLLM(section, {
        sceneIndex: i,
        totalScenes: sections.length,
        prevTransition,
        prevScene,
      });
      results.push(scene);
      prevTransition = scene.transition?.type as TransitionType ?? null;
    } catch (err) {
      console.error(
        `LLM compose failed for scene ${i + 1}, falling back to rules:`,
        err,
      );
      // Fallback: import rule-based composer dynamically to avoid circular deps
      const { composeSequence } = await import("./composer");
      const fallbackScenes = composeSequence([section], options);
      const fallbackScene = fallbackScenes[0];
      results.push(fallbackScene);
      prevTransition =
        fallbackScene.transition?.type as TransitionType ?? null;
    }
  }

  return results;
}
