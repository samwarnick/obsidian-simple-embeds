import { requestUrl } from "obsidian";
import { EmbedSource, EnableEmbedKey } from "./";
import { getPreviewFromContent } from "link-preview-js";
import { PluginSettings } from "settings";
import SimpleEmbedsPlugin from "main";

export class GenericPreviewEmbed implements EmbedSource {
  name = "Generic Preview";
  enabledKey: EnableEmbedKey = "replaceGenericLinks";
  // unmatchable regex
  // this source is used as a fallback when other sources fail to match
  regex = new RegExp("(?!)");

  createEmbed(
    link: string,
    container: HTMLElement,
    settings: Readonly<PluginSettings>,
    currentTheme: "light" | "dark",
    plugin: SimpleEmbedsPlugin,
  ) {
    const preview = document.createElement("a");
    preview.setAttr("href", link);
    preview.classList.add("preview");
    preview.textContent = "Loading preview...";

    const loadPreview = async () => {
      let metadata;

      // await cache file load if not available yet
      if (!plugin.genericPreviewCache) await plugin.cacheFileLoadPromise;

      if (settings.useCacheForGenericLinks && link in plugin.genericPreviewCache) {
        metadata = plugin.genericPreviewCache[link];
      } else {
        const res = await requestUrl({ url: link });
        metadata = await getPreviewFromContent({
          headers: res.headers,
          data: res.text,
          url: link
        });

        if (settings.useCacheForGenericLinks && "title" in metadata) {
          plugin.saveGenericPreviewCache(link, metadata);
        }
      }

      if (!("title" in metadata)) return;

      preview.innerHTML = 
        String.raw`
          <div class="image-container">
            ${ metadata.images.length ? String.raw`<img src="${metadata.images[0]}" />` : "" }
          </div>
          <div class="content">
            <div class="title">${metadata.title}</div>
            <div class="description">${metadata.description ? metadata.description : ""}</div>
          </div>
        `;
    }

    try {
      loadPreview();
    } catch {
      preview.textContent = "Could not load preview";
    }

    container.appendChild(preview);
    container.classList.add("generic-preview");
    return container;
  }
}
