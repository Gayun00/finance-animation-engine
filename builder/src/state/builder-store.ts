import { create } from "zustand";
import type { TransitionType } from "../types/preset-meta";
import { getPresetById } from "../data/preset-registry";
import {
  generateSceneSequence,
  type SceneConfig,
  type SceneSequenceOutput,
} from "../utils/scene-generator";

// ── localStorage persistence ──

const STORAGE_KEY = "scene-builder-state";

interface SavedState {
  _v: 1;
  sequenceTitle: string;
  scenes: SceneConfig[];
  sceneCounter: number;
}

function saveToStorage(title: string, scenes: SceneConfig[]) {
  try {
    const data: SavedState = { _v: 1, sequenceTitle: title, scenes, sceneCounter };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* quota exceeded etc */ }
}

function loadFromStorage(): Partial<{ sequenceTitle: string; scenes: SceneConfig[] }> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: SavedState = JSON.parse(raw);
    if (data._v !== 1) return null;
    sceneCounter = data.sceneCounter ?? data.scenes.length;
    return { sequenceTitle: data.sequenceTitle, scenes: data.scenes };
  } catch {
    return null;
  }
}

// ── Project file format ──

interface ProjectFile {
  _type: "scene-builder-project";
  _v: 1;
  sequenceTitle: string;
  scenes: SceneConfig[];
}

// ── Store ──

interface BuilderState {
  sequenceTitle: string;
  fps: number;
  width: number;
  height: number;

  scenes: SceneConfig[];

  selectedSceneIndex: number | null;
  activeSlotId: string | null;

  // Actions
  setSequenceTitle: (title: string) => void;
  addScene: (presetId: string) => void;
  removeScene: (index: number) => void;
  moveScene: (from: number, to: number) => void;
  selectScene: (index: number | null) => void;

  updateSceneTitle: (index: number, title: string) => void;
  updateSceneDuration: (index: number, frames: number) => void;
  updateSceneSubtitle: (index: number, text: string) => void;

  assignAsset: (sceneIndex: number, slotId: string, assetId: string | null) => void;
  setActiveSlot: (slotId: string | null) => void;

  updateTransition: (
    sceneIndex: number,
    type: TransitionType,
    duration?: number,
    color?: string
  ) => void;

  // Export (Remotion SceneSequence)
  exportJSON: () => string;
  exportSequence: () => SceneSequenceOutput;

  // Project save/load (filesystem)
  savedProjects: { name: string; updatedAt: number }[];
  saveProject: () => Promise<void>;
  loadProject: (name: string) => Promise<void>;
  deleteProject: (name: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
  getProjectJSON: () => string;

  reset: () => void;
}

let sceneCounter = 0;

function createDefaultSceneConfig(presetId: string): SceneConfig {
  const preset = getPresetById(presetId);
  if (!preset) throw new Error(`Unknown preset: ${presetId}`);

  sceneCounter++;

  const slotAssignments: Record<string, string | null> = {};
  for (const slot of preset.slots) {
    slotAssignments[slot.id] = slot.defaultAssetId ?? null;
  }

  return {
    id: `scene-${sceneCounter}`,
    presetId,
    title: `${preset.name} 장면`,
    durationInFrames: preset.defaultDurationInFrames,
    subtitle: "",
    slotAssignments,
    transitionType: preset.defaultTransition?.type ?? "fade",
    transitionDuration: preset.defaultTransition?.duration ?? 15,
    transitionColor: preset.defaultTransition?.color,
  };
}

// Load initial state from localStorage
const restored = loadFromStorage();

export const useBuilderStore = create<BuilderState>()((set, get) => ({
  sequenceTitle: restored?.sequenceTitle ?? "내 영상",
  fps: 30,
  width: 1920,
  height: 1080,

  scenes: restored?.scenes ?? [],
  selectedSceneIndex: null,
  activeSlotId: null,
  savedProjects: [],

  setSequenceTitle: (title) => {
    set({ sequenceTitle: title });
    saveToStorage(title, get().scenes);
  },

  addScene: (presetId) =>
    set((s) => {
      const config = createDefaultSceneConfig(presetId);
      const scenes = [...s.scenes, config];
      saveToStorage(s.sequenceTitle, scenes);
      return { scenes, selectedSceneIndex: scenes.length - 1, activeSlotId: null };
    }),

  removeScene: (index) =>
    set((s) => {
      const scenes = s.scenes.filter((_, i) => i !== index);
      let sel = s.selectedSceneIndex;
      if (sel !== null) {
        if (sel === index) sel = scenes.length > 0 ? Math.min(index, scenes.length - 1) : null;
        else if (sel > index) sel--;
      }
      saveToStorage(s.sequenceTitle, scenes);
      return { scenes, selectedSceneIndex: sel, activeSlotId: null };
    }),

  moveScene: (from, to) =>
    set((s) => {
      const scenes = [...s.scenes];
      const [item] = scenes.splice(from, 1);
      scenes.splice(to, 0, item);
      saveToStorage(s.sequenceTitle, scenes);
      return { scenes, selectedSceneIndex: to };
    }),

  selectScene: (index) => set({ selectedSceneIndex: index, activeSlotId: null }),

  updateSceneTitle: (index, title) =>
    set((s) => {
      const scenes = [...s.scenes];
      scenes[index] = { ...scenes[index], title };
      saveToStorage(s.sequenceTitle, scenes);
      return { scenes };
    }),

  updateSceneDuration: (index, frames) =>
    set((s) => {
      const scenes = [...s.scenes];
      scenes[index] = { ...scenes[index], durationInFrames: frames };
      saveToStorage(s.sequenceTitle, scenes);
      return { scenes };
    }),

  updateSceneSubtitle: (index, text) =>
    set((s) => {
      const scenes = [...s.scenes];
      scenes[index] = { ...scenes[index], subtitle: text };
      saveToStorage(s.sequenceTitle, scenes);
      return { scenes };
    }),

  assignAsset: (sceneIndex, slotId, assetId) =>
    set((s) => {
      const scenes = [...s.scenes];
      scenes[sceneIndex] = {
        ...scenes[sceneIndex],
        slotAssignments: { ...scenes[sceneIndex].slotAssignments, [slotId]: assetId },
      };
      saveToStorage(s.sequenceTitle, scenes);
      return { scenes, activeSlotId: null };
    }),

  setActiveSlot: (slotId) => set({ activeSlotId: slotId }),

  updateTransition: (sceneIndex, type, duration, color) =>
    set((s) => {
      const scenes = [...s.scenes];
      scenes[sceneIndex] = {
        ...scenes[sceneIndex],
        transitionType: type,
        transitionDuration: duration ?? scenes[sceneIndex].transitionDuration,
        transitionColor: color,
      };
      saveToStorage(s.sequenceTitle, scenes);
      return { scenes };
    }),

  exportSequence: () => {
    const s = get();
    return generateSceneSequence(s.scenes, {
      id: "builder-output",
      title: s.sequenceTitle,
      fps: s.fps,
      width: s.width,
      height: s.height,
    });
  },

  exportJSON: () => {
    const seq = get().exportSequence();
    return JSON.stringify(seq, null, 2);
  },

  // ── Project save/load ──

  getProjectJSON: () => {
    const s = get();
    const proj: ProjectFile = {
      _type: "scene-builder-project",
      _v: 1,
      sequenceTitle: s.sequenceTitle,
      scenes: s.scenes,
    };
    return JSON.stringify(proj, null, 2);
  },

  refreshProjects: async () => {
    try {
      const res = await fetch("/api/projects/list");
      const list = await res.json();
      set({ savedProjects: list });
    } catch { /* ignore */ }
  },

  saveProject: async () => {
    const s = get();
    const name = s.sequenceTitle || "untitled";
    const proj: ProjectFile = {
      _type: "scene-builder-project",
      _v: 1,
      sequenceTitle: s.sequenceTitle,
      scenes: s.scenes,
    };
    await fetch("/api/projects/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, project: proj }),
    });
    await get().refreshProjects();
  },

  loadProject: async (name: string) => {
    try {
      const res = await fetch(`/api/projects/load?name=${encodeURIComponent(name)}`);
      if (!res.ok) return;
      const data: ProjectFile = await res.json();
      if (data._type !== "scene-builder-project" || data._v !== 1) return;
      const maxId = data.scenes.reduce((max, sc) => {
        const n = parseInt(sc.id.replace("scene-", ""), 10);
        return isNaN(n) ? max : Math.max(max, n);
      }, 0);
      sceneCounter = maxId;
      set({
        sequenceTitle: data.sequenceTitle,
        scenes: data.scenes,
        selectedSceneIndex: null,
        activeSlotId: null,
      });
      saveToStorage(data.sequenceTitle, data.scenes);
    } catch { /* ignore */ }
  },

  deleteProject: async (name: string) => {
    await fetch("/api/projects/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await get().refreshProjects();
  },

  reset: () => {
    set({
      sequenceTitle: "내 영상",
      scenes: [],
      selectedSceneIndex: null,
      activeSlotId: null,
    });
    localStorage.removeItem(STORAGE_KEY);
    sceneCounter = 0;
  },
}));
