import { EmbedSource, EnableEmbedKey } from "./";

const FLAT_IO_LINK = new RegExp(
  /https:\/\/flat\.io\/(?:score|embed)\/.*/,
);

export class FlatIOEmbed implements EmbedSource {
  name = "Flat.io";
  enabledKey: EnableEmbedKey = "replaceFlatIOLinks";
  regex = FLAT_IO_LINK;

  createEmbed(link: string, container: HTMLElement) {
    const iframe = document.createElement("iframe");

    iframe.src = link.replace("/score/", "/embed/");
    iframe.setAttribute("frameborder", "0");
    iframe.allow = "fullscreen";
    container.appendChild(iframe);
    container.classList.add("flat_io");
    return container;
  }
}
