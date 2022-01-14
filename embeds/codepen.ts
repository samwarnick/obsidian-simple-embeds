import { EmbedSource } from "./";
import { PluginSettings } from "settings";
import SimpleEmbedsPlugin from "main";

const CODEPEN_LINK = new RegExp(/https:\/\/codepen\.io\/(\w+)\/(?:pen)\/(\w+)/);

declare global {
  interface Window {
    __CPEmbed?: (selector: String) => void;
  }
}

export class CodepenEmbed implements EmbedSource {
  constructor(private plugin: SimpleEmbedsPlugin) {}

  canHandle(link: string, settings: PluginSettings) {
    return settings.replaceCodepenLinks && CODEPEN_LINK.test(link);
  }

  createEmbed(link: string, container: HTMLElement) {
    this._ensureCodepenLoaded();

    const user = link.match(CODEPEN_LINK)[1];
    const slug = link.match(CODEPEN_LINK)[2];

    const defaultTabs = [
      this.plugin.settings.codepenDefaultTab,
      this.plugin.settings.codepenShowResult ? "result" : false,
    ].filter(Boolean);

    container.classList.add("codepen");
    container.dataset["themeId"] = this.plugin.settings.codepenTheme;
    container.dataset["height"] = "300";
    container.dataset["defaultTab"] = defaultTabs.join(",");
    container.dataset["user"] = user;
    container.dataset["slugHash"] = slug;

    if (this.plugin.settings.codepenClickToLoad) {
      container.dataset["preview"] = "true";
    }

    if (this.plugin.settings.codepenEditable) {
      container.dataset["editable"] = "true";
    }

    return container;
  }

  afterAllEmbeds() {
    setTimeout(() => {
      window.__CPEmbed(".codepen");
    });
  }

  updateTheme(theme: "dark" | "light") {
    if (this.plugin.settings.codepenTheme !== "auto") return;

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
}
