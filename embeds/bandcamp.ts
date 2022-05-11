import { requestUrl } from "obsidian";
import { EmbedSource, EnableEmbedKey } from "./";

const BANDCAMP_LINK = new RegExp(
  /http(s)?:\/\/([a-z0-9-]+\.)?bandcamp\.com\/(?<type>album|track)\/[\w&$+,\/:;=?@#\._~%-]+/,
);
const ID = new RegExp(/<!-- (track|album) id (?<id>\d+)/);

export class BandcampEmbed implements EmbedSource {
  name = "Bandcamp";
  enabledKey: EnableEmbedKey = "replaceBandcampLinks";
  regex = BANDCAMP_LINK;

  createEmbed(link: string, container: HTMLElement) {
    const iframe = document.createElement("iframe");
    const type = link.match(BANDCAMP_LINK).groups.type;
    const isAlbum = type === "album";

    requestUrl({ url: link }).then(({ text }) => {
      const id = text.match(ID).groups?.id;
      if (id) {
        iframe.src = `https://bandcamp.com/EmbeddedPlayer/${type}=${id}/tracklist=${isAlbum}/artwork=small/${
          isAlbum ? "size=large/" : ""
        }`;
      }
    });

    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("seamless", "");
    iframe.height = isAlbum ? "472" : "120";
    iframe.width = "400";
    container.appendChild(iframe);
    container.classList.add("bandcamp");
    return container;
  }
}
