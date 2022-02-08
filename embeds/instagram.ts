import { EmbedSource, EnableEmbedKey } from "./";

const INSTAGRAM_LINK = new RegExp(
  /https:\/\/www\.instagram\.com\/(?:p|tv|reel)\/(\w+)/,
);

interface Instagram {
  Embeds: {
    process: () => void;
  };
}
declare global {
  interface Window {
    instgrm?: Instagram;
  }
}

export class InstagramEmbed implements EmbedSource {
  name = "Instagram";
  enabledKey: EnableEmbedKey = "replaceInstagramLinks";
  regex = INSTAGRAM_LINK;

  createEmbed(link: string, container: HTMLElement) {
    this._ensureInstagramLoaded();

    const blockquote = document.createElement("blockquote");
    blockquote.classList.add("instagram-media");
    blockquote.dataset["instgrmCaptioned"] = "";
    blockquote.dataset["instgrmPermalink"] = link;
    blockquote.dataset["instgrmVersion"] = "13";

    container.appendChild(blockquote);
    container.classList.add("instagram");

    return container;
  }

  afterAllEmbeds() {
    setTimeout(() => {
      window.instgrm?.Embeds.process();
    });
  }

  private _ensureInstagramLoaded() {
    (function (d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = "http://www.instagram.com/embed.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "instagram-wjs");
  }
}
