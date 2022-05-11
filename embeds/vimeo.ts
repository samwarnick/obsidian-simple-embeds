import { EmbedSource, EnableEmbedKey } from "./";

const VIMEO_LINK = new RegExp(/https:\/\/(www\.)?vimeo\.com\/(?<id>\d+)/);

export class VimeoEmbed implements EmbedSource {
  name = "Vimeo";
  enabledKey: EnableEmbedKey = "replaceVimeoLinks";
  regex = VIMEO_LINK;

  createEmbed(link: string, container: HTMLElement) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("video-wrapper");
    const iframe = document.createElement("iframe");

    const id = link.match(VIMEO_LINK).groups.id;

    iframe.src = `https://player.vimeo.com/video/${id}`;
    iframe.setAttribute("frameborder", "0");
    iframe.allow =
      "autoplay; fullscreen; picture-in-picture; picture-in-picture;";
    wrapper.appendChild(iframe);
    container.appendChild(wrapper);
    container.classList.add("vimeo");
    return container;
  }
}
