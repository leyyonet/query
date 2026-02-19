import { packageJson } from "@leyyo/common";

// noinspection JSUnusedGlobalSymbols
export const { name: NME, fqn: FQN, version: VER } = packageJson(import.meta.url);
