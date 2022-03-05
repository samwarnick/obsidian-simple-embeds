import { EmbedSource, EnableEmbedKey } from "../embeds";
import { PluginSettings } from "../settings";

const APPLE_TV_LINK = new RegExp(
  /https:\/\/tv.apple.com\/(?<locale>[a-z-]+)\/(?<type>episode|show|movie)\/(?<content>\S*)/,
);

export class AppleTVEmbed implements EmbedSource {
  name = "Apple TV+";
  enabledKey: EnableEmbedKey = "replaceAppleTVLinks";
  regex = APPLE_TV_LINK;

  createEmbed(link: string, container: HTMLElement, settings: PluginSettings, currentTheme: "light" | "dark") {
    const wrapper = document.createElement("div");
    wrapper.classList.add("video-wrapper");
    const iframe = document.createElement("iframe");

    const fakeLink = document.createElement("a");
    fakeLink.href = link;
    fakeLink.classList.add("fake-link");

    const matches = link.match(APPLE_TV_LINK);
    const locale = matches.groups.locale;
    const type = matches.groups.type;
    const content = matches.groups.content;
    const src = `https://embed.tv.apple.com/${locale}/${type}/${content}`;

    iframe.src = src;
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute(
      "sandbox",
      "allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation",
    );
    iframe.allow = "autoplay *; encrypted-media *;";
    wrapper.appendChild(iframe);
    wrapper.appendChild(fakeLink);
    container.appendChild(wrapper);
    container.classList.add("apple-tv");
    return container;
  }
}
