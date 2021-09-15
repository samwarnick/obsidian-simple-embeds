import { Plugin } from "obsidian";

const TWEET_LINK = new RegExp(/https:\/\/twitter\.com\/.+\/(\d+)/);
const YOUTUBE_LINK = new RegExp(
  /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/
);

declare global {
  interface Window {
    twttr: any;
  }
}

export default class SimpleEmbedPlugin extends Plugin {
  async onload() {
    window.twttr = (function (d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0],
        t = window.twttr || {};
      if (d.getElementById(id)) return t;
      js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = "https://platform.twitter.com/widgets.js";
      fjs.parentNode.insertBefore(js, fjs);

      t._e = [];
      t.ready = function (f: any) {
        t._e.push(f);
      };

      return t;
    })(document, "script", "twitter-wjs");
    const meta = document.createElement("meta");
    meta.name = "twitter.dnt";
    meta.content = "on";
    document.getElementsByTagName("head")[0].appendChild(meta);

    this.registerMarkdownPostProcessor((el, ctx) => {
      const anchors = el.querySelectorAll("a");
      anchors.forEach((anchor) => {
        this._parseAnchor(anchor);
      });
    });
  }

  onunload() {
    const twitterScript = document.getElementById("twitter-wjs");
    twitterScript.parentElement.removeChild(twitterScript);
  }

  private _parseAnchor(a: HTMLAnchorElement) {
    const href = a.getAttribute("href");
    if (TWEET_LINK.test(href)) {
      const tweetId = href.match(TWEET_LINK)[1];
      const tweetContainer = document.createElement("div");
      tweetContainer.id = `TweetContainer${tweetId}`;
      a.parentElement.replaceChild(tweetContainer, a);

      window.twttr.ready(() => {
        window.twttr.widgets.createTweet(tweetId, tweetContainer);
      });
    } else if (YOUTUBE_LINK.test(href)) {
      const videoId = href.match(YOUTUBE_LINK)[1];
      const iframe = document.createElement("iframe");
      iframe.width = "550";
      iframe.height = "309";
      iframe.src = `https://www.youtube.com/embed/${videoId}`;
      iframe.title = "YouTube video player";
      iframe.setAttr("frameborder", "0");
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      a.parentElement.replaceChild(iframe, a);
    }
  }
}
