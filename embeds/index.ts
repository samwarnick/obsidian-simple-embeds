import { PluginSettings } from "settings";

export interface EmbedSource {
  canHandle: (link: string, settings: PluginSettings) => boolean;
  createEmbed: (link: string, container: HTMLElement) => HTMLElement;
  afterAllEmbeds?: () => void;
}

export * from "./twitter";
export * from "./youtube";
export * from "./instagram";
export * from "./flat_io";
export * from "./noteflight";
export * from "./codepen";
