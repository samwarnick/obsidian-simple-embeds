import { App, Plugin, Setting, PluginSettingTab } from "obsidian";

const TWEET_LINK = new RegExp(/https:\/\/(?:mobile\.)?twitter\.com\/.+\/(\d+)/);
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

    this.registerMarkdownPostProcessor((el, ctx) => {
      const anchors = el.querySelectorAll(
        "a.external-link"
      ) as NodeListOf<HTMLAnchorElement>;
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
      this._ensureTwitterLoaded();
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
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;";
      iframe.setAttr(
        "sandbox",
        "allow-scripts allow-same-origin allow-presentation allow-popups"
      );
      wrapper.appendChild(iframe);
      container.appendChild(wrapper);
      a.parentElement.replaceChild(container, a);
    }
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

      // Add global settings for Twitter embeds

      const meta = d.createElement("meta");
      meta.name = "twitter.dnt";
      meta.content = "on";
      d.getElementsByTagName("head")[0].appendChild(meta);

      t._e = [];
      t.ready = function (f: () => void) {
        t._e.push(f);
      };

      return t;
    })(document, "script", "twitter-wjs");
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
