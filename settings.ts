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
  replaceRedditLinks: boolean;
  replaceTwitterLinks: boolean;
  replaceVimeoLinks: boolean;
  replaceWhimsicalLinks: boolean;
  replaceYouTubeLinks: boolean;
  replaceGenericLinks: boolean;
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
export interface RedditAppearanceSettings {
  redditTheme: "auto" | "dark" | "light";
  redditLocale: string;
  redditHideMedia: boolean;
  redditHideEdits: boolean;
  redditHideUsername: boolean;
}
export interface AdvancedSettings {
  enableInLivePreview: boolean;
  centerEmbeds: boolean;
  keepLinksInPreview: boolean;
  embedPlacement: "above" | "below";
  disableAutomaticEmbeds: boolean;
}

export interface GenericPreviewMetadata {
  title: string;
  description: string;
  images: string[];
}

export interface GenericPreviewSettings {
  useCacheForGenericLinks: boolean;
  // genericPreviewCache: {
  //   [url: string]: GenericPreviewMetadata;
  // };
}

export interface PluginSettings
  extends EnableEmbeds,
  TwitterAppearanceSettings,
  CodePenAppearanceSettings,
  RedditAppearanceSettings,
  GenericPreviewSettings,
  AdvancedSettings { }

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
  replaceRedditLinks: true,
  replaceTwitterLinks: true,
  replaceVimeoLinks: true,
  replaceWhimsicalLinks: true,
  replaceYouTubeLinks: true,

  replaceGenericLinks: false,
  useCacheForGenericLinks: true,

  twitterTheme: "auto",

  codepenTheme: "auto",
  codepenDefaultTab: "html",
  codepenShowResult: true,
  codepenClickToLoad: false,
  codepenEditable: false,

  redditTheme: "auto",

  enableInLivePreview: false,
  centerEmbeds: false,
  keepLinksInPreview: false,
  embedPlacement: "above",
  disableAutomaticEmbeds: false,
  redditLocale: "auto",
  redditHideMedia: false,
  redditHideEdits: false,
  redditHideUsername: false
};
