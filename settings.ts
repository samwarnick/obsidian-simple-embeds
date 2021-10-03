export interface PluginSettings {
  replaceTwitterLinks: boolean;
  replaceYouTubeLinks: boolean;

  keepLinksInPreview: boolean;
  embedPlacement: "above" | "below";
  disableAutomaticEmbeds: boolean;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  replaceTwitterLinks: true,
  replaceYouTubeLinks: true,

  keepLinksInPreview: false,
  embedPlacement: "above",
  disableAutomaticEmbeds: false,
};
