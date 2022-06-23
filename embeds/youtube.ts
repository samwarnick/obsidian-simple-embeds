import { EmbedSource, EnableEmbedKey } from "./";
import { LiteYTEmbed } from "./lite-yt-embed";

const YOUTUBE_LINK = new RegExp(
  /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/|be\.com\/embed\/|be\.com\/shorts\/)(?<id>[\w\-\_]*)((?:\?|&)(?:t|start)=(?<startTime>(?:\d+h)?(?:\d+m)?\d+s|\d+))?/,
);

export class YouTubeEmbed implements EmbedSource {
  name = "YouTube";
  enabledKey: EnableEmbedKey = "replaceYouTubeLinks";
  regex = YOUTUBE_LINK;

  createEmbed(link: string, container: HTMLElement) {
    this._ensureLiteYouTubeLoaded();

    const wrapper = document.createElement("div");
    wrapper.classList.add("video-wrapper");

    const matches = link.match(YOUTUBE_LINK);
    const videoId = matches.groups.id;
    const startTime = this._normalizeStartTime(matches.groups.startTime);

    const youtube = document.createElement("lite-youtube");
    youtube.setAttribute("videoid", videoId);
    if (startTime) {
      youtube.setAttribute("params", `start=${startTime}`);
    }

    wrapper.appendChild(youtube);
    container.appendChild(wrapper);
    container.classList.add("youtube");
    return container;
  }

  private _ensureLiteYouTubeLoaded() {
    if (!customElements.get("lite-youtube")) {
      customElements.define("lite-youtube", LiteYTEmbed);
    }
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
