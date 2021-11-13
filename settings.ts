export interface PluginSettings {
  replaceTwitterLinks: boolean;
  replaceYouTubeLinks: boolean;
  replaceInstagramLinks: boolean;
  replaceFlatIOLinks: boolean;
  replaceNoteflightLinks: boolean;

  twitterTheme: "auto" | "dark" | "light";

  keepLinksInPreview: boolean;
  embedPlacement: "above" | "below";
  disableAutomaticEmbeds: boolean;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  replaceTwitterLinks: true,
  replaceYouTubeLinks: true,
  replaceInstagramLinks: true,
  replaceFlatIOLinks: true,
  replaceNoteflightLinks: true,

  twitterTheme: "auto",

  keepLinksInPreview: false,
  embedPlacement: "above",
  disableAutomaticEmbeds: false,
};
