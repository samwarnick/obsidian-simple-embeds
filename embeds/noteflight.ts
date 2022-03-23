import { EmbedSource, EnableEmbedKey } from "./";

const NOTEFLIGHT_LINK = new RegExp(
  /https:\/\/(?:www\.)?noteflight\.com\/(?:(?:scores\/view)|embed)\/.*/g,
);

export class NoteflightEmbed implements EmbedSource {
  name = "Noteflight";
  enabledKey: EnableEmbedKey = "replaceNoteflightLinks";
  regex = NOTEFLIGHT_LINK;

  createEmbed(link: string, container: HTMLElement) {
    const iframe = document.createElement("iframe");

    iframe.src = link.replace("/scores/view/", "/embed/");
    iframe.setAttribute("frameborder", "0");
    iframe.allow = "fullscreen";
    container.appendChild(iframe);
    container.classList.add("noteflight");
    return container;
  }
}
