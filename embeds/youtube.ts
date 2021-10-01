import { EmbedSource } from "./";
import { PluginSettings } from "settings";

const YOUTUBE_LINK = new RegExp(
  /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/
);

export class YouTubeEmbed implements EmbedSource {
  canHandle(link: string, settings: PluginSettings) {
    return settings.replaceYouTubeLinks && YOUTUBE_LINK.test(link);
  }

  createEmbed(link: string, container: HTMLElement) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("video-wrapper");
    const iframe = document.createElement("iframe");

    const videoId = link.match(YOUTUBE_LINK)[1];

    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.title = "YouTube video player";
    iframe.setAttr("frameborder", "0");
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;";
    iframe.setAttr(
      "sandbox",
      "allow-scripts allow-same-origin allow-presentation allow-popups"
    );
    wrapper.appendChild(iframe);
    container.appendChild(wrapper);
    return container;
  }
}
