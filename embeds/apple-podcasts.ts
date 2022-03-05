import { EmbedSource, EnableEmbedKey } from "../embeds";
import { PluginSettings } from "../settings";

const APPLE_PODCAST_LINK = new RegExp(
  /https:\/\/podcasts.apple.com\/(?<locale>[a-z-]+)\/podcast\/(?<content>.*\/id[0-9]+(?:\?i=[0-9]+)?)/,
);

export class ApplePodcastsEmbed implements EmbedSource {
  name = "Apple Podcasts";
  enabledKey: EnableEmbedKey = "replaceApplePodcastsLinks";
  regex = APPLE_PODCAST_LINK;

  createEmbed(link: string, container: HTMLElement, settings: PluginSettings, currentTheme: "light" | "dark") {
    const iframe = document.createElement("iframe");

    const matches = link.match(APPLE_PODCAST_LINK);
    const locale = matches.groups.locale;
    const content = matches.groups.content;
    const isEpisode = content.contains("?i=");
    const src = `https://embed.podcasts.apple.com/${locale}/podcast/${content}${
      isEpisode ? "&" : "?"
    }theme=${currentTheme}`;

    iframe.src = src;
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute(
      "sandbox",
      "allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation",
    );
    iframe.allow = "autoplay *; encrypted-media *;";
    iframe.height = isEpisode ? "175px" : "450px";
    container.appendChild(iframe);
    container.classList.add("apple-podcasts");
    return container;
  }

  updateTheme(theme: "dark" | "light", settings: PluginSettings) {
    const podcastEmbeds = document.querySelectorAll(
      ".embed-container.apple-podcasts iframe",
    ) as NodeListOf<HTMLIFrameElement>;
    podcastEmbeds.forEach((embed) => {
      let src = embed.src;
      if (theme === "dark") {
        src = src.replace("theme=light", "theme=dark");
      } else {
        src = src.replace("theme=dark", "theme=light");
      }
      embed.src = src;
    });
  }
}
