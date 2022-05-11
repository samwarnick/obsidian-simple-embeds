import { Setting } from "obsidian";
import { PluginSettings } from "settings";
import { EmbedSource, EnableEmbedKey } from "./";

const REDDIT_LINK = new RegExp(
  /https:\/\/(?:www\.)?reddit\.com\/r\/(?<comment>.+)/,
);

export class RedditEmbed implements EmbedSource {
  name = "Reddit";
  enabledKey: EnableEmbedKey = "replaceRedditLinks";
  regex = REDDIT_LINK;

  createEmbed(
    link: string,
    container: HTMLElement,
    settings: Readonly<PluginSettings>,
    currentTheme: "light" | "dark",
  ) {
    const iframe = document.createElement("iframe");

    const comment = link.match(REDDIT_LINK).groups.comment;

    const theme =
      settings.redditTheme === "auto" ? currentTheme : settings.redditTheme;
    iframe.src = `https://www.redditmedia.com/r/${comment}/?ref_source=embed&amp;ref=share&amp;embed=true;theme=${theme}`;
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-popups",
    );
    iframe.height = "198";
    iframe.width = "640";
    container.appendChild(iframe);
    container.classList.add("reddit");
    return container;
  }

  updateTheme(theme: "dark" | "light", settings: Readonly<PluginSettings>) {
    if (settings.redditTheme !== "auto") {
      return;
    }
    const redditEmbed = document.querySelectorAll(
      ".embed-container.reddit iframe",
    ) as NodeListOf<HTMLIFrameElement>;
    redditEmbed.forEach((embed) => {
      let src = embed.src;
      if (theme === "dark") {
        src = src.replace("theme=light", "theme=dark");
      } else {
        src = src.replace("theme=dark", "theme=light");
      }
      embed.src = src;
    });
  }

  createAdditionalSettings(
    containerEl: HTMLElement,
    settings: Readonly<PluginSettings>,
    saveSettings: (updates: Partial<PluginSettings>) => Promise<void>,
  ) {
    const themeSetting = new Setting(containerEl)
      .setName("Theme")
      .addDropdown((dropdown) => {
        dropdown
          .addOptions({
            auto: "Automatic",
            dark: "Dark",
            light: "Light",
          })
          .setValue(settings.redditTheme)
          .onChange(async (value: "auto" | "dark" | "light") => {
            await saveSettings({ redditTheme: value });
          });
      });

    return [themeSetting];
  }
}
