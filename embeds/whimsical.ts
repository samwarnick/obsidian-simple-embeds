import { EmbedSource, EnableEmbedKey } from './';

const WHIMSICAL_LINK = new RegExp(
  /https:\/\/whimsical.com\/(?:[a-zA-Z0-9\-]+\-)?(?<id>[a-km-zA-HJ-NP-Z1-9]{16,22})(@[a-km-zA-HJ-NP-Z1-9]+)?/
);

export class WhimsicalEmbed implements EmbedSource {
  name = 'Whimsical';
  enabledKey: EnableEmbedKey = 'replaceWhimsicalLinks';
  regex = WHIMSICAL_LINK;

  createEmbed(link: string, container: HTMLElement) {
    const iframe = document.createElement('iframe');

    const matches = link.match(WHIMSICAL_LINK);
    const id = matches.groups.id;

    iframe.src = `https://whimsical.com/embed/${id}`;
    iframe.style.aspectRatio = '800/450';
    iframe.style.width = '100%';
    iframe.setAttribute('frameborder', '0');
    iframe.allow = 'fullscreen';
    container.appendChild(iframe);
    container.classList.add('whimsical');
    return container;
  }
}
