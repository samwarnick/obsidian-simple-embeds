import { EmbedSource } from "./";
import { PluginSettings } from "settings";

const APPLE_MUSIC_LINK = new RegExp(
  /https:\/\/(?:embed\.)?music\.apple\.com\/.+\/(?:playlist|album)\/.+\/.+/
);
const APPLE_MUSIC_SONG_LINK = new RegExp(
  /https:\/\/(?:embed\.)?music\.apple\.com\/.+\/(?:playlist|album)\/.+\/.+\?i=\d+/
);

export class AppleMusicEmbed implements EmbedSource {
  canHandle(link: string, settings: PluginSettings) {
    return settings.replaceAppleMusicLinks && APPLE_MUSIC_LINK.test(link);
  }

  createEmbed(link: string, container: HTMLElement) {
    const isSong = APPLE_MUSIC_SONG_LINK.test(link);
    const iframe = document.createElement("iframe");

    iframe.src = link.replace(
      "https://music.apple",
      "https://embed.music.apple"
    );
    iframe.setAttr("frameborder", "0");
    iframe.allow = "autoplay *; encrypted-media *; fullscreen *";
    iframe.setAttr(
      "sandbox",
      "allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
    );
    iframe.height = isSong ? "150" : "450";
    iframe.style.width = "100%";
    iframe.style.maxWidth = "550px";
    iframe.style.overflow = "hidden";
    iframe.style.background = "transparent";
    container.appendChild(iframe);
    return container;
  }
}
