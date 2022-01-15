import { EmbedSource } from "./";
import { PluginSettings } from "settings";

const GITHUB_GIST = new RegExp(
  /https:\/\/gist.github\.com\/[a-zA-Z\d](?:[a-zA-z\d]|-(?=[a-zA-Z\d])){0,38}\/[a-z0-9]{32}/,
);

export class GitHubGistEmbed implements EmbedSource {
  canHandle(link: string, settings: PluginSettings) {
    return settings.replaceGitHubGistLinks && GITHUB_GIST.test(link);
  }

  createEmbed(link: string, container: HTMLElement) {
    const iframe = document.createElement("iframe");

    iframe.srcdoc = `<script src="${link}.js"></script>`;
    iframe.setAttribute("frameborder", "0");
    iframe.onload = () => {
      iframe.style.height =
        `${iframe.contentWindow.document.documentElement.scrollHeight}px`;
    };
    container.appendChild(iframe);
    container.classList.add("github_gist");
    return container;
  }
}
