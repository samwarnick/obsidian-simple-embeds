import { EmbedSource } from "./";
import { PluginSettings } from "settings";

const NOTEFLIGHT_LINK = new RegExp(
    /https:\/\/(?:www\.)?noteflight\.com\/(?:(?:scores\/view)|embed)\/.*/g,
);

export class NoteflightEmbed implements EmbedSource {
  canHandle(link: string, settings: PluginSettings) {
    return settings.replaceNoteflightLinks && NOTEFLIGHT_LINK.test(link);
  }

  createEmbed(link: string, container: HTMLElement) {
      console.log("creating embed for", link)
    const iframe = document.createElement("iframe");

    iframe.src = link.replace("/scores/view/", "/embed/");
    iframe.setAttr("frameborder", "0");
    iframe.allow = "fullscreen";
    container.appendChild(iframe);
    container.classList.add("noteflight");
    return container;
  }
}
