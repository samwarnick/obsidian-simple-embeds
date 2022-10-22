import {
  AppleMusicEmbed,
  ApplePodcastsEmbed,
  AppleTVEmbed,
  BandcampEmbed,
  CodepenEmbed,
  EmbedSource,
  FlatIOEmbed,
  GitHubGistEmbed,
  InstagramEmbed,
  NoteflightEmbed,
  RedditEmbed,
  TwitterEmbed,
  VimeoEmbed,
  YouTubeEmbed,
  GenericPreviewEmbed,
} from "./embeds";
import { debounce, Debouncer, MarkdownView, Plugin, TFile } from "obsidian";
import {
  DEFAULT_SETTINGS,
  GenericPreviewMetadata,
  PluginSettings,
} from "./settings";
import { SimpleEmbedPluginSettingTab } from "./settings-tab";
import { buildSimpleEmbedsViewPlugin } from "./view-plugin";

export default class SimpleEmbedsPlugin extends Plugin {
  settings: PluginSettings;
  embedSources: EmbedSource[] = [
    new TwitterEmbed(),
    new YouTubeEmbed(),
    new InstagramEmbed(),
    new FlatIOEmbed(),
    new NoteflightEmbed(),
    new CodepenEmbed(),
    new GitHubGistEmbed(),
    new AppleMusicEmbed(),
    new ApplePodcastsEmbed(),
    new AppleTVEmbed(),
    new BandcampEmbed(),
    new VimeoEmbed(),
    new RedditEmbed(),
  ];
  processedMarkdown: Debouncer<[]>;
  currentTheme: "dark" | "light";

  genericPreviewEmbed = new GenericPreviewEmbed();
  genericPreviewCache = null as {
    [url: string]: GenericPreviewMetadata;
  } | null;
  genericPreviewCacheFile =
    this.app.vault.configDir +
    "/plugins/obsidian-simple-embeds/genericPreviewCache.json";
  cacheFileLoadPromise = null as Promise<void>;

  async onload() {
    console.log(`Loading ${this.manifest.name} v${this.manifest.version}`);
    await this.loadSettings();
    this.addSettingTab(new SimpleEmbedPluginSettingTab(this.app, this));

    this.currentTheme = this._getCurrentTheme();

    const ext = buildSimpleEmbedsViewPlugin(this);
    this.registerEditorExtension(ext);

    this.processedMarkdown = debounce(() => {
      this.embedSources.forEach((source) => {
        source.afterAllEmbeds?.();
      });
    }, 100);

    this.registerMarkdownPostProcessor((el, ctx) => {
      const anchors = el.querySelectorAll(
        "a.external-link"
      ) as NodeListOf<HTMLAnchorElement>;
      anchors.forEach((anchor) => {
        this._handleAnchor(anchor);
      });
      this.processedMarkdown();
    });

    this.registerEvent(
      this.app.workspace.on("css-change", () => {
        // Theme has potentially changed.
        const previousTheme = this.currentTheme;
        this.currentTheme = this._getCurrentTheme();
        if (previousTheme !== this.currentTheme) {
          setTimeout(() => {
            this.embedSources.forEach((embedSource) => {
              embedSource.updateTheme?.(this.currentTheme, this.settings);
            });
          });
        }
      })
    );

    // Load file for generic preview cache
    const loadCacheFile = async () => {
      if (
        !(await this.app.vault.adapter.exists(this.genericPreviewCacheFile))
      ) {
        await this.app.vault.create(this.genericPreviewCacheFile, "{}");
      }
      try {
        const contents = JSON.parse(
          await this.app.vault.adapter.read(this.genericPreviewCacheFile)
        );
        this.genericPreviewCache = contents;
      } catch (e) {
        console.error("Error reading generic preview cache file");
        console.error(e);
      }
    };
    this.cacheFileLoadPromise = loadCacheFile();
  }

  onunload() {
    console.log(`Unloading ${this.manifest.name}`);
    this.processedMarkdown = null;
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(updates: Partial<PluginSettings>) {
    this.settings = { ...this.settings, ...updates };
    await this.saveData(this.settings);
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    view?.previewMode?.rerender(true);
    view?.editor?.transaction({
      selection: { from: { line: 0, ch: 0 }, to: { line: 0, ch: 0 } },
    });
  }

  async saveGenericPreviewCache(
    link: string,
    metadata: GenericPreviewMetadata
  ) {
    if (this.genericPreviewCacheFile) {
      this.genericPreviewCache[link] = metadata;
      await this.app.vault.adapter.write(
        this.genericPreviewCacheFile,
        JSON.stringify(this.genericPreviewCache)
      );
    }
  }

  private _getCurrentTheme(): "dark" | "light" {
    return document.body.classList.contains("theme-dark") ? "dark" : "light";
  }

  private _handleAnchor(a: HTMLAnchorElement) {
    const isWithinText = Array.from(a.parentElement.childNodes)
      .filter((node) => {
        return node instanceof Text;
      })
      .some((text: Text) => {
        const nbsp = new RegExp(String.fromCharCode(160), "g");
        const data = text.data.replace(nbsp, "").trim();
        return !!data;
      });

    const replaceWithEmbed = this.shouldReplaceWithEmbed(
      a.innerText,
      isWithinText
    );
    const fullWidth = a.innerText.includes("|fullwidth");
    // Remove any allowed properties:
    // |embed, |noembed, |fullwidth
    a.innerHTML = a.innerHTML.replace(/\|(?:embed|noembed|fullwidth)/g, "");

    if (!replaceWithEmbed) {
      return;
    }

    const href = a.getAttribute("href");

    // Try and find an enabled embed source that can handle the link.
    let embedSource = this.embedSources.find((source) => {
      return this.settings[source.enabledKey] && source.regex.test(href);
    });

    if (embedSource) {
      const embed = this.createEmbed(
        embedSource,
        href,
        fullWidth,
        this.settings.centerEmbeds,
        this.settings.keepLinksInPreview
      );
      this._insertEmbed(a, embed);
    } else {
      if (this.settings.replaceGenericLinks) {
        // fall back to creating a generic embed
        const embed = this.createEmbed(
          this.genericPreviewEmbed,
          href,
          fullWidth,
          this.settings.centerEmbeds,
          this.settings.keepLinksInPreview
        );
        this._insertEmbed(a, embed);
      }
    }
  }

  shouldReplaceWithEmbed(text: string, isWithinText: boolean) {
    const disableAutomaticEmbeds = this.settings.disableAutomaticEmbeds;
    if (isWithinText && !disableAutomaticEmbeds) {
      return false;
    }
    return disableAutomaticEmbeds
      ? text.includes("|embed")
      : !text.includes("|noembed");
  }

  createEmbed(
    embedSource: EmbedSource,
    link: string,
    fullWidth: boolean,
    centered: boolean,
    keepLinks: boolean
  ) {
    const container = document.createElement("div");
    container.classList.add("embed-container");
    const embed = embedSource.createEmbed(
      link,
      container,
      this.settings,
      this.currentTheme,
      this
    );
    if (fullWidth) {
      embed.classList.add("full-width");
    }
    if (centered) {
      embed.classList.add("center");
    }
    if (!keepLinks) {
      embed.classList.add("hide-link");
    }
    return embed;
  }

  private _insertEmbed(a: HTMLAnchorElement, container: HTMLElement) {
    const parent = a.parentElement;
    const keepLinksInPreview = this.settings.keepLinksInPreview;
    const placement = this.settings.embedPlacement;
    if (keepLinksInPreview && placement === "above") {
      parent.insertBefore(container, a);
    } else if (keepLinksInPreview && placement === "below") {
      a.after(container);
    } else {
      parent.replaceChild(container, a);
    }
  }

  get isLivePreviewSupported(): boolean {
    return (
      !!document.querySelector(".is-live-preview") &&
      this.settings.enableInLivePreview
    );
  }
}
