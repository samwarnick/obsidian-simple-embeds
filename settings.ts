export interface PluginSettings {
  replaceTwitterLinks: boolean;
  replaceYouTubeLinks: boolean;

  keepLinksInPreview: boolean;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  replaceTwitterLinks: true,
  replaceYouTubeLinks: true,

  keepLinksInPreview: false,
};
