import { EmbedSource, TwitterEmbed, YouTubeEmbed } from "embeds";
import { App, Plugin, Setting, PluginSettingTab, MarkdownView } from "obsidian";
import { DEFAULT_SETTINGS, PluginSettings } from "settings";

export default class SimpleEmbedsPlugin extends Plugin {
  settings: PluginSettings;
  embedSources: EmbedSource[] = [new TwitterEmbed(), new YouTubeEmbed()];

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
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    view?.previewMode?.rerender(true);
  }

  private _parseAnchor(a: HTMLAnchorElement) {
    const href = a.getAttribute("href");
    const container = document.createElement("div");
    container.classList.add("embed-container");

    for (let source of this.embedSources) {
      if (source.canHandle(href, this.settings)) {
        this._insertEmbed(a, source.createEmbed(href, container));
        return;
      }
    }
  }

  private _insertEmbed(a: HTMLAnchorElement, container: HTMLElement) {
    if (this.settings.keepLinksInPreview) {
      a.prepend(container);
    } else {
      a.parentElement.replaceChild(container, a);
    }
  }
}

class SimpleEmbedPluginSettingTab extends PluginSettingTab {
  plugin: SimpleEmbedsPlugin;

  constructor(app: App, plugin: SimpleEmbedsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    let { containerEl } = this;

    containerEl.empty();

    containerEl.createEl("h3", { text: "Available Embeds" });
    containerEl.createEl("p", {
      text: "Disable to prevent links from source being turned into embeds.",
      cls: "setting-item-description",
    });

    new Setting(containerEl).setName("Twitter").addToggle((toggle) => {
      toggle
        .setValue(this.plugin.settings.replaceTwitterLinks)
        .onChange(async (value) => {
          this.plugin.settings.replaceTwitterLinks = value;
          await this.plugin.saveSettings();
        });
    });

    new Setting(containerEl).setName("YouTube").addToggle((toggle) => {
      toggle
        .setValue(this.plugin.settings.replaceYouTubeLinks)
        .onChange(async (value) => {
          this.plugin.settings.replaceYouTubeLinks = value;
          await this.plugin.saveSettings();
        });
    });

    containerEl.createEl("h3", { text: "Advanced Settings" });

    new Setting(containerEl)
      .setName("Keep links in preview")
      .setDesc(
        "Insert embeds above the link, instead of replacing the link in the preview."
      )
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.keepLinksInPreview)
          .onChange(async (value) => {
            this.plugin.settings.keepLinksInPreview = value;
            await this.plugin.saveSettings();
          });
      });
  }
}
