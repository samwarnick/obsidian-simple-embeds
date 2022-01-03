import {
  EmbedSource,
  FlatIOEmbed,
  InstagramEmbed,
  NoteflightEmbed,
  TwitterEmbed,
  YouTubeEmbed,
} from "embeds";
import {
  App,
  debounce,
  Debouncer,
  MarkdownView,
  Plugin,
  PluginSettingTab,
  Setting,
} from "obsidian";
import { DEFAULT_SETTINGS, PluginSettings } from "settings";

export default class SimpleEmbedsPlugin extends Plugin {
  settings: PluginSettings;
  embedSources: EmbedSource[] = [
    new TwitterEmbed(this),
    new YouTubeEmbed(),
    new InstagramEmbed(),
    new FlatIOEmbed(),
    new NoteflightEmbed(),
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
        (this.embedSources[0] as TwitterEmbed).updateTheme(
          this.currentTheme,
        );
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

  async saveSettings() {
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
      ? a.innerText.endsWith("|embed")
      : !a.innerText.endsWith("|noembed");
    a.innerHTML = a.innerHTML.replace("|noembed", "").replace("|embed", "");
    if (isWithinText && !disableAutomaticEmbeds) {
      return;
    }

    const href = a.getAttribute("href");
    const container = document.createElement("div");
    container.classList.add("embed-container");

    let embedSource = this.embedSources.find((source) => {
      return source.canHandle(href, this.settings);
    });

    if (embedSource && replaceWithEmbed) {
      const embed = embedSource.createEmbed(href, container);
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
      },
    );

    new Setting(containerEl).setName("Twitter").addToggle((toggle) => {
      toggle
        .setValue(this.plugin.settings.replaceTwitterLinks)
        .onChange(async (value) => {
          this.plugin.settings.replaceTwitterLinks = value;
          await this.plugin.saveSettings();
          twitterTheme.setDisabled(!this.plugin.settings.replaceTwitterLinks);
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

    new Setting(containerEl).setName("Instagram").addToggle((toggle) => {
      toggle
        .setValue(this.plugin.settings.replaceInstagramLinks)
        .onChange(async (value) => {
          this.plugin.settings.replaceInstagramLinks = value;
          await this.plugin.saveSettings();
        });
    });

    new Setting(containerEl).setName("Flat.io").addToggle((toggle) => {
      toggle
        .setValue(this.plugin.settings.replaceFlatIOLinks)
        .onChange(async (value) => {
          this.plugin.settings.replaceFlatIOLinks = value;
          await this.plugin.saveSettings();
        });
    });

    new Setting(containerEl).setName("Noteflight").addToggle((toggle) => {
      toggle
        .setValue(this.plugin.settings.replaceNoteflightLinks)
        .onChange(async (value) => {
          this.plugin.settings.replaceNoteflightLinks = value;
          await this.plugin.saveSettings();
        });
    });

    containerEl.createEl("h3", { text: "Appearance" });

    const twitterTheme = new Setting(containerEl)
      .setName("Twitter theme")
      .addDropdown((dropdown) => {
        dropdown.addOptions({ auto: "Automatic", dark: "Dark", light: "Light" })
          .setValue(this.plugin.settings.twitterTheme)
          .onChange(async (value: "auto" | "dark" | "light") => {
            this.plugin.settings.twitterTheme = value;
            await this.plugin.saveSettings();
          });
      })
      .setDisabled(!this.plugin.settings.replaceTwitterLinks);

    containerEl.createEl("h3", { text: "Advanced Settings" });

    new Setting(containerEl)
      .setName("Keep links in preview")
      .setDesc(
        "Insert embeds above the link, instead of replacing the link in the preview.",
      )
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.keepLinksInPreview)
          .onChange(async (value) => {
            this.plugin.settings.keepLinksInPreview = value;
            await this.plugin.saveSettings();
            placement.setDisabled(!this.plugin.settings.keepLinksInPreview);
          });
      });

    const placement = new Setting(containerEl)
      .setName("Place embeds")
      .setDesc(
        'When "Keep links in preview" is enabled, choose whether to place the embed above or below the link.',
      )
      .addDropdown((dropdown) => {
        dropdown
          .addOptions({ above: "Above link", below: "Below link" })
          .setValue(this.plugin.settings.embedPlacement)
          .onChange(async (value: "above" | "below") => {
            this.plugin.settings.embedPlacement = value;
            await this.plugin.saveSettings();
          });
      })
      .setDisabled(!this.plugin.settings.keepLinksInPreview);

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
