import {
  AppleMusicEmbed,
  ApplePodcastsEmbed,
  AppleTVEmbed,
  CodepenEmbed,
  EmbedSource,
  FlatIOEmbed,
  GitHubGistEmbed,
  InstagramEmbed,
  NoteflightEmbed,
  TwitterEmbed,
  YouTubeEmbed,
} from "./embeds";
import { debounce, Debouncer, MarkdownView, Plugin } from "obsidian";
import { DEFAULT_SETTINGS, PluginSettings } from "./settings";
import { SimpleEmbedPluginSettingTab } from "./settings-tab";

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
    new AppleTVEmbed()
  ];
  processedMarkdown: Debouncer<[]>;
  currentTheme: "dark" | "light";

  async onload() {
    console.log(`Loading ${this.manifest.name} v${this.manifest.version}`);
    await this.loadSettings();
    this.addSettingTab(new SimpleEmbedPluginSettingTab(this.app, this));

    this.currentTheme = this._getCurrentTheme();

    this.processedMarkdown = debounce(() => {
      this.embedSources.forEach((source) => {
        source.afterAllEmbeds?.();
      });
    }, 100);

    this.registerMarkdownPostProcessor((el, ctx) => {
      const anchors = el.querySelectorAll(
        "a.external-link",
      ) as NodeListOf<HTMLAnchorElement>;
      anchors.forEach((anchor) => {
        this._handleAnchor(anchor);
      });
      this.processedMarkdown();
    });

    this.registerEvent(this.app.workspace.on("css-change", () => {
      // Theme has potentially changed.
      const previousTheme = this.currentTheme;
      this.currentTheme = this._getCurrentTheme();
      if (
        previousTheme !== this.currentTheme
      ) {
        this.embedSources.forEach((embedSource) => {
          embedSource.updateTheme?.(this.currentTheme, this.settings);
        });
      }
    }));
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

    const disableAutomaticEmbeds = this.settings.disableAutomaticEmbeds;
    const replaceWithEmbed = disableAutomaticEmbeds
      ? a.innerText.includes("|embed")
      : !a.innerText.includes("|noembed");
    const fullWidth = a.innerText.includes("|fullwidth");
    // Remove any allowed properties:
    // |embed, |noembed, |fullwidth
    a.innerHTML = a.innerHTML.replace(/\|(?:embed|noembed|fullwidth)/g, "");
    if (isWithinText && !disableAutomaticEmbeds) {
      return;
    }

    const href = a.getAttribute("href");
    const container = document.createElement("div");
    container.classList.add("embed-container");

    // Try and find an enabled embed source that can handle the link.
    let embedSource = this.embedSources.find((source) => {
      return this.settings[source.enabledKey] && source.regex.test(href);
    });

    if (embedSource && replaceWithEmbed) {
      const embed = embedSource.createEmbed(href, container, this.settings, this.currentTheme);
      if (fullWidth) {
        embed.classList.add("full-width");
      }
      if (this.settings.centerEmbeds) {
        embed.classList.add("center");
      }
      this._insertEmbed(a, embed);
    }
  }

  private _insertEmbed(a: HTMLAnchorElement, container: HTMLElement) {
    const parent = a.parentElement;
    const keepLinksInPreview = this.settings.keepLinksInPreview;
    const placement = this.settings.embedPlacement;
    if (keepLinksInPreview && placement === "above") {
      parent.insertBefore(container, a);
    } else if (keepLinksInPreview && placement === "below") {
      container.insertAfter(a);
    } else {
      parent.replaceChild(container, a);
    }
  }
}
