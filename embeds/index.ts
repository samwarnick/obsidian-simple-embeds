import SimpleEmbedsPlugin from "main";
import { Setting } from "obsidian";
import { EnableEmbeds, PluginSettings } from "../settings";

export type EnableEmbedKey = keyof EnableEmbeds;
export interface EmbedSource {
  readonly name: string;
  readonly enabledKey: EnableEmbedKey;
  readonly regex: RegExp;
  createEmbed(
    link: string,
    container: HTMLElement,
    settings: Readonly<PluginSettings>,
    currentTheme: "light" | "dark",
    plugin: SimpleEmbedsPlugin,
  ): HTMLElement;
  afterAllEmbeds?(): void;
  updateTheme?(
    theme: "dark" | "light",
    settings: Readonly<PluginSettings>,
  ): void;
  createAdditionalSettings?(
    containerEl: HTMLElement,
    settings: Readonly<PluginSettings>,
    saveSettings: (updates: Partial<PluginSettings>) => Promise<void>,
  ): Setting[];
}

export * from "./apple-music";
export * from "./apple-podcasts";
export * from "./apple-tv";
export * from "./bandcamp";
export * from "./codepen";
export * from "./flat_io";
export * from "./github_gist";
export * from "./instagram";
export * from "./noteflight";
export * from "./reddit";
export * from "./twitter";
export * from "./vimeo";
export * from "./whimsical";
export * from "./youtube";
export * from "./generic-preview";
