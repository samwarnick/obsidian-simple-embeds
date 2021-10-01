import { PluginSettings } from "settings";

export interface EmbedSource {
  canHandle: (link: string, settings: PluginSettings) => boolean;
  createEmbed: (link: string, container: HTMLElement) => HTMLElement;
}

export * from "./twitter";
export * from "./youtube";
