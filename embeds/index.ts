import { Setting } from "obsidian";
import { EnableEmbeds, PluginSettings } from "settings";

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

export * from "./apple-podcasts";
export * from "./codepen";
export * from "./flat_io";
export * from "./github_gist";
export * from "./instagram";
export * from "./noteflight";
export * from "./twitter";
export * from "./youtube";
