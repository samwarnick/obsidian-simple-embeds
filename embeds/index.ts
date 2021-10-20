import { PluginSettings } from "settings";

export interface EmbedSource {
  canHandle: (link: string, settings: PluginSettings) => boolean;
  createEmbed: (link: string, container: HTMLElement) => HTMLElement;
  afterAllEmbeds?: () => void;
}

export * from "./twitter";
export * from "./youtube";
export * from "./instagram";
