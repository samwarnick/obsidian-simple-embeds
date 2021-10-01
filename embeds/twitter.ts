import { EmbedSource } from "./";
import { PluginSettings } from "settings";

const TWEET_LINK = new RegExp(/https:\/\/(?:mobile\.)?twitter\.com\/.+\/(\d+)/);

interface Twitter {
  _e: (() => void)[];
  ready: (f: () => void) => void;
  widgets: {
    createTweet: (id: string, container: HTMLElement) => Promise<HTMLElement>;
  };
}
declare global {
  interface Window {
    twttr: Twitter;
  }
}

export class TwitterEmbed implements EmbedSource {
  canHandle(link: string, settings: PluginSettings) {
    return settings.replaceTwitterLinks && TWEET_LINK.test(link);
  }

  createEmbed(link: string, container: HTMLElement) {
    this._ensureTwitterLoaded();
    const tweetId = link.match(TWEET_LINK)[1];
    container.id = `TweetContainer${tweetId}`;
    window.twttr.ready(() => {
      window.twttr.widgets.createTweet(tweetId, container);
    });
    return container;
  }

  private _ensureTwitterLoaded() {
    window.twttr = (function (d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0],
        t = window.twttr || ({} as Twitter);
      if (d.getElementById(id)) return t;
      js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = "https://platform.twitter.com/widgets.js";
      fjs.parentNode.insertBefore(js, fjs);

      // Add global settings for Twitter embeds

      const meta = d.createElement("meta");
      meta.name = "twitter.dnt";
      meta.content = "on";
      d.getElementsByTagName("head")[0].appendChild(meta);

      t._e = [];
      t.ready = function (f: () => void) {
        t._e.push(f);
      };

      return t;
    })(document, "script", "twitter-wjs");
  }
}
