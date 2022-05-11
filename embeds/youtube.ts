import { EmbedSource, EnableEmbedKey } from "./";

const YOUTUBE_LINK = new RegExp(
  /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/|be\.com\/embed\/)(?<id>[\w\-\_]*)((?:\?|&)(?:t|start)=(?<startTime>(?:\d+h)?(?:\d+m)?\d+s|\d+))?/,
);

export class YouTubeEmbed implements EmbedSource {
  name = "YouTube";
  enabledKey: EnableEmbedKey = "replaceYouTubeLinks";
  regex = YOUTUBE_LINK;

  createEmbed(link: string, container: HTMLElement) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("video-wrapper");
    const iframe = document.createElement("iframe");

    const matches = link.match(YOUTUBE_LINK);
    const videoId = matches.groups.id;
    const startTime = this._normalizeStartTime(matches.groups.startTime);

    let src = `https://www.youtube.com/embed/${videoId}`;
    if (startTime) {
      src = `${src}?start=${startTime}`;
    }
    iframe.src = src;
    iframe.title = "YouTube video player";
    iframe.setAttribute("frameborder", "0");
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen;";
    iframe.setAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-presentation allow-popups",
    );
    wrapper.appendChild(iframe);
    container.appendChild(wrapper);
    container.classList.add("youtube");
    return container;
  }

  private _normalizeStartTime(startTime: string) {
    if (!startTime) {
      return;
    }
    if (!isNaN(Number(startTime))) {
      return startTime;
    }
    const matches = startTime.match(
      /(?<hours>\d+h)?(?<minutes>\d+m)?(?<seconds>\d+s)/,
    );
    const hoursInSeconds = parseInt(matches.groups.hours ?? "0") * 60 * 60;
    const minutesInSeconds = parseInt(matches.groups.minutes ?? "0") * 60;
    const seconds = parseInt(matches.groups.seconds ?? "0");
    return `${hoursInSeconds + minutesInSeconds + seconds}`;
  }
}
