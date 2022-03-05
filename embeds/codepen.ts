import { EmbedSource, EnableEmbedKey } from "./";
import { Setting } from "obsidian";
import { PluginSettings } from "../settings";

const CODEPEN_LINK = new RegExp(/https:\/\/codepen\.io\/(\w+)\/(?:pen)\/(\w+)/);

declare global {
  interface Window {
    __CPEmbed?: (selector: String) => void;
  }
}

export class CodepenEmbed implements EmbedSource {
  name = "CodePen";
  enabledKey: EnableEmbedKey = "replaceCodepenLinks";
  regex = CODEPEN_LINK;

  createEmbed(
    link: string,
    container: HTMLElement,
    settings: Readonly<PluginSettings>,
  ) {
    this._ensureCodepenLoaded();

    const user = link.match(CODEPEN_LINK)[1];
    const slug = link.match(CODEPEN_LINK)[2];

    const defaultTabs = [
      settings.codepenDefaultTab,
      settings.codepenShowResult ? "result" : false,
    ].filter(Boolean);

    container.classList.add("codepen");
    container.dataset["themeId"] = settings.codepenTheme;
    container.dataset["height"] = "300";
    container.dataset["defaultTab"] = defaultTabs.join(",");
    container.dataset["user"] = user;
    container.dataset["slugHash"] = slug;

    if (settings.codepenClickToLoad) {
      container.dataset["preview"] = "true";
    }

    if (settings.codepenEditable) {
      container.dataset["editable"] = "true";
    }

    container.classList.add("codepen");
    return container;
  }

  afterAllEmbeds() {
    setTimeout(() => {
      window.__CPEmbed?.(".codepen");
    });
  }

  updateTheme(theme: "dark" | "light", settings: Readonly<PluginSettings>) {
    if (settings.codepenTheme !== "auto") return;

    const codepenEmbeds = document.querySelectorAll(
      ".cp_embed_wrapper iframe",
    ) as NodeListOf<HTMLIFrameElement>;

    codepenEmbeds.forEach((embed) => {
      let src = embed.src;

      if (theme === "dark") {
        src = src.replace("theme-id=light", "theme=dark");
      } else {
        src = src.replace("theme-id=dark", "theme=light");
      }

      embed.src = src;
    });
  }

  private _ensureCodepenLoaded() {
    (function (d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = "https://cpwebassets.codepen.io/assets/embed/ei.js";
      js.async = true;
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "ei-codepen");
  }

  createAdditionalSettings(
    containerEl: HTMLElement,
    settings: Readonly<PluginSettings>,
    saveSettings: (updates: Partial<PluginSettings>) => Promise<void>,
  ) {
    const themeSetting = new Setting(containerEl)
      .setName("Theme")
      .addDropdown((dropdown) => {
        dropdown.addOptions({
          auto: "Automatic",
          dark: "Dark",
          light: "Light",
        })
          .setValue(settings.codepenTheme)
          .onChange(async (value: "auto" | "dark" | "light") => {
            await saveSettings({ codepenTheme: value });
          });
      });

    const defaultTabSetting = new Setting(containerEl)
      .setName("Default tab")
      .addDropdown((dropdown) => {
        dropdown.addOptions({ html: "HTML", css: "CSS", js: "JS" })
          .setValue(settings.codepenDefaultTab)
          .onChange(async (value: "html" | "css" | "js") => {
            await saveSettings({ codepenDefaultTab: value });
          });
      });

    const showResultSetting = new Setting(containerEl)
      .setName("Show result")
      .addToggle((toggle) => {
        toggle
          .setValue(settings.codepenShowResult)
          .onChange(async (value) => {
            await saveSettings({ codepenShowResult: value });
          });
      });

    const clickToLoadSetting = new Setting(containerEl)
      .setName("Click to load")
      .addToggle((toggle) => {
        toggle
          .setValue(settings.codepenClickToLoad)
          .onChange(async (value) => {
            await saveSettings({ codepenClickToLoad: value });
          });
      });

    const editableSetting = new Setting(containerEl)
      .setName("Codepen editable")
      .addToggle((toggle) => {
        toggle
          .setValue(settings.codepenEditable)
          .onChange(async (value) => {
            await saveSettings({ codepenEditable: value });
          });
      });

    return [
      themeSetting,
      defaultTabSetting,
      showResultSetting,
      clickToLoadSetting,
      editableSetting,
    ];
  }
}
