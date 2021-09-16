import { App, Plugin, Setting, PluginSettingTab } from "obsidian";

const TWEET_LINK = new RegExp(/https:\/\/twitter\.com\/.+\/(\d+)/);
const YOUTUBE_LINK = new RegExp(
  /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/
);

interface Twitter {
  _e: (() => void)[];
  ready: (f: () => void) => void;
  widgets: {
    createTweet: (id: string, container: HTMLElement) => Promise<HTMLElement>;
  };
}
declare global {
  interface Window {
    twttr: Twitter;
  }
}

export default class SimpleEmbedsPlugin extends Plugin {
  settings: PluginSettings;

  async onload() {
    console.log(`Loading ${this.manifest.name} v${this.manifest.version}`);
    await this.loadSettings();
    this.addSettingTab(new SimpleEmbedPluginSettingTab(this.app, this));

    // Make sure Twitter script is not loaded more than once.
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

    // Add global settings for Twitter embeds.
    const meta = document.createElement("meta");
    meta.name = "twitter.dnt";
    meta.content = "on";
    document.getElementsByTagName("head")[0].appendChild(meta);

    this.registerMarkdownPostProcessor((el, ctx) => {
      const anchors = el.querySelectorAll("a");
      anchors.forEach((anchor) => {
        this._parseAnchor(anchor);
      });
    });
  }

  onunload() {
    console.log(`Unloading ${this.manifest.name}`);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private _parseAnchor(a: HTMLAnchorElement) {
    const href = a.getAttribute("href");
    const container = document.createElement("div");
    container.classList.add("embed-container");
    if (this.settings.replaceTwitterLinks && TWEET_LINK.test(href)) {
      const tweetId = href.match(TWEET_LINK)[1];
      container.id = `TweetContainer${tweetId}`;
      window.twttr.ready(() => {
        window.twttr.widgets.createTweet(tweetId, container);
      });
      a.parentElement.replaceChild(container, a);
    } else if (this.settings.replaceYouTubeLinks && YOUTUBE_LINK.test(href)) {
      const wrapper = document.createElement("div");
      wrapper.classList.add("video-wrapper");
      const iframe = document.createElement("iframe");

      const videoId = href.match(YOUTUBE_LINK)[1];

      iframe.src = `https://www.youtube.com/embed/${videoId}`;
      iframe.title = "YouTube video player";
      iframe.setAttr("frameborder", "0");
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      wrapper.appendChild(iframe);
      container.appendChild(wrapper);
      a.parentElement.replaceChild(container, a);
    }
  }
}

interface PluginSettings {
  replaceTwitterLinks: boolean;
  replaceYouTubeLinks: boolean;
}

const DEFAULT_SETTINGS: PluginSettings = {
  replaceTwitterLinks: true,
  replaceYouTubeLinks: true,
};

class SimpleEmbedPluginSettingTab extends PluginSettingTab {
  plugin: SimpleEmbedsPlugin;

  constructor(app: App, plugin: SimpleEmbedsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    let { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Replace Twitter links")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.replaceTwitterLinks)
          .onChange(async (value) => {
            this.plugin.settings.replaceTwitterLinks = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Replace YouTube links")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.replaceYouTubeLinks)
          .onChange(async (value) => {
            this.plugin.settings.replaceYouTubeLinks = value;
            await this.plugin.saveSettings();
          });
      });
  }
}
