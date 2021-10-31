import { EmbedSource } from "./";
import { PluginSettings } from "settings";

const FLAT_IO_LINK = new RegExp(
  /https:\/\/flat\.io\/(?:score|embed)\/.*/,
);

export class FlatIOEmbed implements EmbedSource {
  canHandle(link: string, settings: PluginSettings) {
    return settings.replaceFlatIOLinks && FLAT_IO_LINK.test(link);
  }

  createEmbed(link: string, container: HTMLElement) {
    const iframe = document.createElement("iframe");

    iframe.src = link.replace("/score/", "/embed/");
    iframe.setAttr("frameborder", "0");
    iframe.allow = "fullscreen";
    container.appendChild(iframe);
    container.classList.add("flat_io");
    return container;
  }
}
