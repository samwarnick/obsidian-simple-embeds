import { Setting } from "obsidian";
import { PluginSettings } from "settings";
import { EmbedSource, EnableEmbedKey } from "./";

const REDDIT_LINK = new RegExp(
  /https:\/\/(?:www\.)?reddit\.com\/r\/(?<comment>.+)/
);

export class RedditEmbed implements EmbedSource {
  name = "Reddit";
  enabledKey: EnableEmbedKey = "replaceRedditLinks";
  regex = REDDIT_LINK;
  blockquotes: any;

  createEmbed(
    link: string,
    container: HTMLElement,
    settings: Readonly<PluginSettings>,
    currentTheme: "light" | "dark"
  ) {
    const theme = settings.redditTheme === "dark" ? "dark" : "light";
    const blockquote = document.createElement("blockquote");
    blockquote.classList.add("reddit-embed-bq");
    blockquote.setAttribute("data-embed-height", "500");
    blockquote.setAttribute(
      "data-embed-locale",
      settings.redditLocale || "auto"
    );
    blockquote.setAttribute(
      "data-embed-showmedia",
      settings.redditHideMedia ? "false" : "true"
    );
    blockquote.setAttribute(
      "data-embed-theme",
      theme
    );
    blockquote.setAttribute(
      "data-embed-showedits",
      settings.redditHideEdits ? "false" : "true"
    );
    blockquote.setAttribute(
      "data-embed-showusername",
      settings.redditHideUsername ? "false" : "true"
    );
    blockquote.setAttribute("data-embed-created", new Date().toISOString());

    const aLink = document.createElement("a");
    aLink.href = link;
    aLink.textContent = link;
    blockquote.appendChild(aLink);

    if (theme === "dark" || currentTheme === "dark") {
      blockquote.setAttribute("data-embed-theme", "dark");
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://embed.reddit.com/widgets.js`;
    script.setAttribute("charset", "UTF-8");

    const newContainer = document.createElement("div");
    newContainer.appendChild(blockquote);
    newContainer.appendChild(script);

    container.replaceWith(newContainer);
    return newContainer;
  }

  updateTheme(theme: "dark" | "light", settings: Readonly<PluginSettings>) {
    this.blockquotes.forEach((blockquote: { classList: { toggle: (arg0: string, arg1: boolean) => void; }; }) => {
      blockquote.classList.toggle(
        "dark",
        settings.redditTheme === "dark" || theme === "dark"
      );
    });
  }

  createAdditionalSettings(
    containerEl: HTMLElement,
    settings: Readonly<PluginSettings>,
    saveSettings: (updates: Partial<PluginSettings>) => Promise<void>
  ) {
    const settingsList: Setting[] = [];

    // Language setting
    const languageSetting = new Setting(containerEl)
      .setName("Select Display Text Language")
      .addDropdown((dropdown) => {
        dropdown
          .addOptions({
            auto: "Automatic",
            "en-EN": "English",
            "fr-FR": "French",
            "de-DE": "German",
            "es-MX": "Mexican Spanish",
            "es-ES": "Spain Spanish",
            "pt-BR": "Brazilian Portuguese",
            "pt-PT": "Portugal Portuguese",
          })
          .setValue(settings.redditLocale || "auto")
          .onChange(async (value: string) => {
            await saveSettings({ redditLocale: value });
          });
      });
    settingsList.push(languageSetting);

    // Hide post content setting
    const hidePostContentSetting = new Setting(containerEl)
      .setName("Hide Post Content")
      .addToggle((toggle) => {
        toggle
          .setValue(settings.redditHideMedia || false)
          .onChange(async (value: boolean) => {
            await saveSettings({ redditHideMedia: value });
          });
      });
    settingsList.push(hidePostContentSetting);

    // Dark mode setting
    const darkModeSetting = new Setting(containerEl)
      .setName("Display in Dark Mode")
      .addToggle((toggle) => {
        toggle
          .setValue(settings.redditTheme === "dark")
          .onChange(async (value: boolean) => {
            await saveSettings({ redditTheme: value ? "dark" : "auto" });
          });
      });
    settingsList.push(darkModeSetting);

    // Hide if edited setting
    const hideIfEditedSetting = new Setting(containerEl)
      .setName("Hide If Edited")
      .addToggle((toggle) => {
        toggle
          .setValue(settings.redditHideEdits || false)
          .onChange(async (value: boolean) => {
            await saveSettings({ redditHideEdits: value });
          });
      });
    settingsList.push(hideIfEditedSetting);

    // Hide username setting
    const hideUsernameSetting = new Setting(containerEl)
      .setName("Hide Username")
      .addToggle((toggle) => {
        toggle
          .setValue(settings.redditHideUsername || false)
          .onChange(async (value: boolean) => {
            await saveSettings({ redditHideUsername: value });
          });
      });
    settingsList.push(hideUsernameSetting);

    return settingsList;
  }
}
