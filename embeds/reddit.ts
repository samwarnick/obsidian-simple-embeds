import { Setting } from "obsidian";
import { PluginSettings } from "settings";
import { EmbedSource, EnableEmbedKey } from "./";

export class RedditEmbed implements EmbedSource {
  name = "Reddit";
  enabledKey: EnableEmbedKey = "replaceRedditLinks";
  regex = /https:\/\/(?:www\.)?reddit\.com\/r\/(?<comment>.+)/;

  createEmbed(
    link: string,
    container: HTMLElement,
    settings: Readonly<PluginSettings>,
    currentTheme: "light" | "dark",
  ) {
    const blockquote = document.createElement("blockquote");
    blockquote.classList.add("reddit-embed-bq");
    blockquote.style.height = "500px";
    blockquote.setAttribute("data-embed-height", "500");
    blockquote.setAttribute("data-embed-locale", settings.redditLocale || "auto");
    blockquote.setAttribute("data-embed-showmedia", settings.redditHideMedia ? "false" : "true");
    blockquote.setAttribute("data-embed-theme", settings.redditTheme === "dark" ? "dark" : "light");
    blockquote.setAttribute("data-embed-showedits", settings.redditHideEdits ? "false" : "true");
    blockquote.setAttribute("data-embed-showusername", settings.redditHideUsername ? "false" : "true");
    blockquote.setAttribute("data-embed-created", new Date().toISOString());

    const aLink = document.createElement("a");
    aLink.href = link;
    aLink.textContent = link;
    blockquote.appendChild(aLink);

    if (settings.redditTheme === "dark") {
      blockquote.setAttribute("data-embed-theme", "dark");
    } else if (currentTheme === "dark") {
      blockquote.setAttribute("data-embed-theme", "dark");
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://embed.reddit.com/widgets.js";
    script.setAttribute("charset", "UTF-8");

    container.appendChild(blockquote);
    container.appendChild(script);
    return container;
  }

  updateTheme(theme: "dark" | "light", settings: Readonly<PluginSettings>) {
    const redditEmbeds = document.querySelectorAll(
      ".embed-container.reddit blockquote.reddit-embed-bq"
    );
    redditEmbeds.forEach((blockquote) => {
      if (settings.redditTheme === "dark") {
        blockquote.setAttribute("data-embed-theme", "dark");
      } else if (theme === "dark") {
        blockquote.setAttribute("data-embed-theme", "dark");
      } else {
        blockquote.removeAttribute("data-embed-theme");
      }
    });
  }

  createAdditionalSettings(
    containerEl: HTMLElement,
    settings: Readonly<PluginSettings>,
    saveSettings: (updates: Partial<PluginSettings>) => Promise<void>,
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
