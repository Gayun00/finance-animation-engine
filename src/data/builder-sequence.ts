/**
 * Builder output loader.
 *
 * 사용법:
 * 1. Scene Builder (pnpm builder)에서 시퀀스를 구성
 * 2. JSON 다운로드 → public/builder-output.json 으로 저장
 * 3. Studio에서 "BuilderOutput" 컴포지션 선택하여 미리보기
 */
import type { SceneSequence } from "../types";
import data from "./builder-output.json";

export const builderSequence: SceneSequence = data as unknown as SceneSequence;
