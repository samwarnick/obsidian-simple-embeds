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

    let embedSource = this.embedSources.find((source) => {
      return source.canHandle(href, this.settings);
    });

    if (embedSource) {
      const replaceWithEmbed = this.settings.disableAutomaticEmbeds
        ? a.innerText.endsWith("|embed")
        : !a.innerText.endsWith("|noembed");
      a.innerText = a.innerText.replace("|noembed", "").replace("|embed", "");
      if (replaceWithEmbed) {
        const embed = embedSource.createEmbed(href, container);
        this._insertEmbed(a, embed);
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

    containerEl.createEl("h3", { text: "Available Embed Sources" });
    containerEl.createEl(
      "p",
      {
        cls: "setting-item-description",
      },
      (el) => {
        el.innerHTML =
          "Disable to prevent <em>all</em> links from source ever being turned into embeds. To disable an individual link, add <code>|noembed</code> to the link text. For example, <code>[Some description|noembed](https://twitter.com/user/status/123)</code>";
      }
    );

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

    const fragment = new DocumentFragment();
    const div = fragment.createEl("div");
    const span = fragment.createEl("span");
    span.innerHTML =
      "Instead of automatically embedding all matching links, you must add <code>|embed</code> to the link text of each link you would like to turn into an embed. For example, <code>[Some description|embed](https://twitter.com/user/status/123)</code>";
    div.appendChild(span);
    fragment.appendChild(div);
    new Setting(containerEl)
      .setName("Disable automatic embeds")
      .setDesc(fragment)
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.disableAutomaticEmbeds)
          .onChange(async (value) => {
            this.plugin.settings.disableAutomaticEmbeds = value;
            await this.plugin.saveSettings();
          });
      });
  }
}
