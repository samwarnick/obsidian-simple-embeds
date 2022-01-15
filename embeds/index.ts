import { PluginSettings } from "settings";

export interface EmbedSource {
  canHandle: (link: string, settings: PluginSettings) => boolean;
  createEmbed: (link: string, container: HTMLElement) => HTMLElement;
  afterAllEmbeds?: () => void;
}

export * from "./codepen";
export * from "./flat_io";
export * from "./github_gist";
export * from "./instagram";
export * from "./noteflight";
export * from "./twitter";
export * from "./youtube";
