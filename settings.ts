export interface PluginSettings {
  replaceTwitterLinks: boolean;
  replaceYouTubeLinks: boolean;
  replaceInstagramLinks: boolean;
  replaceFlatIOLinks: boolean;
  replaceNoteflightLinks: boolean;
  replaceCodepenLinks: boolean;

  twitterTheme: "auto" | "dark" | "light";

  codepenTheme: "auto" | "dark" | "light";
  codepenDefaultTab: "html" | "css" | "js";
  codepenShowResult: boolean;
  codepenClickToLoad: boolean;
  codepenEditable: boolean;

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
  replaceCodepenLinks: true,

  twitterTheme: "auto",

  codepenTheme: "auto",
  codepenDefaultTab: "html",
  codepenShowResult: true,
  codepenClickToLoad: false,
  codepenEditable: false,

  keepLinksInPreview: false,
  embedPlacement: "above",
  disableAutomaticEmbeds: false,
};
