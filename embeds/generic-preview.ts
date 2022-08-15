import { requestUrl } from "obsidian";
import { EmbedSource, EnableEmbedKey } from "./";
import { getPreviewFromContent } from "link-preview-js";

export class GenericPreviewEmbed implements EmbedSource {
  name = "Generic Preview";
  enabledKey: EnableEmbedKey = "replaceGenericLinks";
  regex = new RegExp("");

  createEmbed(
    link: string,
    container: HTMLElement,
  ) {
    const preview = document.createElement("a");
    preview.setAttr("href", link);
    preview.classList.add("preview");
    preview.textContent = "Loading embed...";

    const loadPreview = async () => {
      const res = await requestUrl({ url: link });
      const metadata = await getPreviewFromContent({
        headers: res.headers,
        data: res.text,
        url: link
      });

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
