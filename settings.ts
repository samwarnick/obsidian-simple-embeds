export interface EnableEmbeds {
  replaceAppleMusicLinks: boolean;
  replaceApplePodcastsLinks: boolean;
  replaceAppleTVLinks: boolean;
  replaceBandcampLinks: boolean;
  replaceCodepenLinks: boolean;
  replaceFlatIOLinks: boolean;
  replaceGitHubGistLinks: boolean;
  replaceInstagramLinks: boolean;
  replaceNoteflightLinks: boolean;
  replaceTwitterLinks: boolean;
  replaceYouTubeLinks: boolean;
}
export interface TwitterAppearanceSettings {
  twitterTheme: "auto" | "dark" | "light";
}

export interface CodePenAppearanceSettings {
  codepenTheme: "auto" | "dark" | "light";
  codepenDefaultTab: "html" | "css" | "js";
  codepenShowResult: boolean;
  codepenClickToLoad: boolean;
  codepenEditable: boolean;
}
export interface AdvancedSettings {
  enableInLivePreview: boolean;
  centerEmbeds: boolean;
  keepLinksInPreview: boolean;
  embedPlacement: "above" | "below";
  disableAutomaticEmbeds: boolean;
}

export interface PluginSettings
  extends EnableEmbeds,
    TwitterAppearanceSettings,
    CodePenAppearanceSettings,
    AdvancedSettings {}

export const DEFAULT_SETTINGS: PluginSettings = {
  replaceAppleMusicLinks: true,
  replaceApplePodcastsLinks: true,
  replaceAppleTVLinks: true,
  replaceBandcampLinks: true,
  replaceCodepenLinks: true,
  replaceFlatIOLinks: true,
  replaceGitHubGistLinks: true,
  replaceInstagramLinks: true,
  replaceNoteflightLinks: true,
  replaceTwitterLinks: true,
  replaceYouTubeLinks: true,

  twitterTheme: "auto",

  codepenTheme: "auto",
  codepenDefaultTab: "html",
  codepenShowResult: true,
  codepenClickToLoad: false,
  codepenEditable: false,

  enableInLivePreview: false,
  centerEmbeds: false,
  keepLinksInPreview: false,
  embedPlacement: "above",
  disableAutomaticEmbeds: false,
};
