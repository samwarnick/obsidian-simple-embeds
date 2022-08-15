import { Setting } from "obsidian";
import { PluginSettings } from "settings";
import { EmbedSource, EnableEmbedKey } from "./";

import got from "got";
import metascraperModule from "metascraper";
import metascraperTitleModule from "metascraper-title";
import metascraperDescriptionModule from "metascraper-description";
import metascraperImageModule from "metascraper-image";

const metascraper = metascraperModule([
  metascraperTitleModule(),
  metascraperImageModule(),
  metascraperDescriptionModule(),
]);

export class GenericPreviewEmbed implements EmbedSource {
  name = "Generic Preview";
  enabledKey: EnableEmbedKey = "replaceGenericLinks";
  // unmatchable regex
  // this embed will be created as a fallback on all others failing to match
  regex = new RegExp("(?!)");

  createEmbed(
    link: string,
    container: HTMLElement,
    settings: Readonly<PluginSettings>,
    currentTheme: "light" | "dark",
  ) {
    const preview = document.createElement("div");
    preview.textContent = "Loading...";

    const loadPreview = async () => {
      const { body: html, url } = await got(link);
      const metadata = await metascraper({ html, url });
      preview.innerHTML = `<h2>${metadata.title}</h2> <br> <p>${metadata.description}</p>`
    }
    loadPreview();

    container.appendChild(preview);
    container.classList.add("generic-preview");
    return container;
  }
}
