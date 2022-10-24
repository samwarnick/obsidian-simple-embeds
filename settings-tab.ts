import { EmbedSource } from "embeds";
import SimpleEmbedsPlugin from "main";
import { App, Platform, PluginSettingTab, Setting } from "obsidian";
import { PluginSettings } from "settings";

export class SimpleEmbedPluginSettingTab extends PluginSettingTab {
  plugin: SimpleEmbedsPlugin;

  private embedSettings: { [key: string]: Setting[] } = {};

  constructor(app: App, plugin: SimpleEmbedsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    let { containerEl } = this;

    containerEl.empty();
    containerEl.classList.add("simple-embeds-settings");

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

    // Toggles to enabled/disabled embed sources.
    this.plugin.embedSources.forEach((embedSource) => {
      new Setting(containerEl).setName(embedSource.name).addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings[embedSource.enabledKey])
          .onChange(async (enabled) => {
            await this.saveSettings({ [embedSource.enabledKey]: enabled });
            this.toggleAdditionalSettings(embedSource, enabled);
          });
      });
    });

    // Settings for generic link previews
    containerEl.createEl("h3", { text: "Generic Link Previews" });
    containerEl.createEl(
      "p",
      {
        cls: "setting-item-description",
      },
      (el) => {
        el.innerHTML =
          "Desktop only";
      },
    );

    new Setting(containerEl)
      .setName("Show generic previews for links")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.replaceGenericLinks)
          .onChange(async (enabled) => {
            await this.saveSettings({ replaceGenericLinks: enabled });
          });
      })
      .setDisabled(Platform.isMobile);
    new Setting(containerEl)
      .setName("Use a cache for link preview metadata")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.useCacheForGenericLinks)
          .onChange(async (enabled) => {
            await this.saveSettings({ useCacheForGenericLinks: enabled });
          });
      })
      .setDisabled(Platform.isMobile);
    new Setting(containerEl)
      .setName("Clear link preview metadata cache")
      .addButton((button) => {
        button
          .setButtonText("Clear")
          .onClick(async () => {
            await this.app.vault.adapter.write(this.plugin.genericPreviewCacheFile, "{}");
            this.plugin.genericPreviewCache = {};
            await this.plugin.saveSettings({});
          });
      })
      .setDisabled(Platform.isMobile);

    // Any additional settings for embed sources.
    containerEl.createEl("h3", { text: "Appearance" });

    this.plugin.embedSources.forEach((embedSource) => {
      if (embedSource.createAdditionalSettings) {
        containerEl.createEl("details", {}, (el) => {
          const fragment = new DocumentFragment();
          const summary = fragment.createEl("summary");
          const title = fragment.createEl("h4", {
            text: embedSource.name,
          });
          summary.appendChild(title);
          el.appendChild(summary);
          const settings = embedSource.createAdditionalSettings(
            el,
            this.plugin.settings,
            this.saveSettings.bind(this),
          );
          this.embedSettings[embedSource.constructor.name] = settings;
          const enabled = this.plugin.settings[embedSource.enabledKey];
          this.toggleAdditionalSettings(embedSource, enabled);
        });
      }
    });

    containerEl.createEl("h3", { text: "Advanced Settings" });

    new Setting(containerEl)
      .setName("Show Embeds in Live Preview (beta)")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.enableInLivePreview)
          .onChange(async (value) => {
            await this.saveSettings({ enableInLivePreview: value });
          });
      });

    new Setting(containerEl).setName("Center embeds").addToggle((toggle) => {
      toggle
        .setValue(this.plugin.settings.centerEmbeds)
        .onChange(async (value) => {
          await this.saveSettings({ centerEmbeds: value });
        });
    });

    new Setting(containerEl)
      .setName("Keep links in preview")
      .setDesc(
        "Insert embeds above the link, instead of replacing the link in the preview.",
      )
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.keepLinksInPreview)
          .onChange(async (value) => {
            await this.saveSettings({ keepLinksInPreview: value });
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
            await this.saveSettings({ embedPlacement: value });
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
            await this.saveSettings({ disableAutomaticEmbeds: value });
          });
      });
  }

  private async saveSettings(updates: Partial<PluginSettings>) {
    return this.plugin.saveSettings(updates);
  }

  // Disable/enable all additional settings when embed is disabled/enabled.
  private toggleAdditionalSettings(embedSource: EmbedSource, enabled: boolean) {
    const additionalSettings = this.embedSettings[embedSource.constructor.name];
    if (additionalSettings) {
      additionalSettings.forEach((setting) => {
        setting.setDisabled(!enabled);
      });
    }
  }
}
