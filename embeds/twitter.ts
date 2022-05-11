import { EmbedSource, EnableEmbedKey } from "./";
import { Setting } from "obsidian";
import { PluginSettings } from "../settings";

const TWEET_LINK = new RegExp(/https:\/\/(?:mobile\.)?twitter\.com\/.+\/(\d+)/);

interface EmbedOptions {
  theme: "dark" | "light";
  dnt: boolean;
}
interface Twitter {
  _e: (() => void)[];
  ready: (f: () => void) => void;
  widgets: {
    createTweet: (
      id: string,
      container: HTMLElement,
      options?: EmbedOptions,
    ) => Promise<HTMLElement>;
  };
}
declare global {
  interface Window {
    twttr: Twitter;
  }
}

export class TwitterEmbed implements EmbedSource {
  name = "Twitter";
  enabledKey: EnableEmbedKey = "replaceTwitterLinks";
  regex = TWEET_LINK;

  createEmbed(
    link: string,
    container: HTMLElement,
    settings: Readonly<PluginSettings>,
    currentTheme: "light" | "dark",
  ) {
    this._ensureTwitterLoaded();
    const tweetId = link.match(TWEET_LINK)[1];
    container.id = `TweetContainer${tweetId}`;
    const theme =
      settings.twitterTheme == "auto" ? currentTheme : settings.twitterTheme;
    window.twttr.ready(() => {
      window.twttr.widgets.createTweet(tweetId, container, {
        theme,
        dnt: true,
      });
    });
    container.classList.add("twitter");
    return container;
  }

  updateTheme(theme: "dark" | "light", settings: Readonly<PluginSettings>) {
    if (settings.twitterTheme !== "auto") {
      return;
    }
    const twitterEmbeds = document.querySelectorAll(
      ".embed-container .twitter-tweet.twitter-tweet-rendered iframe",
    ) as NodeListOf<HTMLIFrameElement>;
    twitterEmbeds.forEach((embed) => {
      let src = embed.src;
      if (theme === "dark") {
        src = src.replace("theme=light", "theme=dark");
      } else {
        src = src.replace("theme=dark", "theme=light");
      }
      embed.src = src;
    });
  }

  private _ensureTwitterLoaded() {
    window.twttr = (function (d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0],
        t = window.twttr || ({} as Twitter);
      if (d.getElementById(id)) return t;
      js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = "https://platform.twitter.com/widgets.js";
      fjs.parentNode.insertBefore(js, fjs);

      t._e = [];
      t.ready = function (f: () => void) {
        t._e.push(f);
      };

      return t;
    })(document, "script", "twitter-wjs");
  }

  createAdditionalSettings(
    containerEl: HTMLElement,
    settings: Readonly<PluginSettings>,
    saveSettings: (updates: Partial<PluginSettings>) => Promise<void>,
  ) {
    const themeSetting = new Setting(containerEl)
      .setName("Theme")
      .addDropdown((dropdown) => {
        dropdown
          .addOptions({
            auto: "Automatic",
            dark: "Dark",
            light: "Light",
          })
          .setValue(settings.twitterTheme)
          .onChange(async (value: "auto" | "dark" | "light") => {
            await saveSettings({ twitterTheme: value });
          });
      });

    return [themeSetting];
  }
}
