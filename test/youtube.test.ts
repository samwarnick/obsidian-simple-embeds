import { YouTubeEmbed } from "../embeds";

let youtube: YouTubeEmbed;

beforeEach(() => {
  youtube = new YouTubeEmbed();
});

test.each([
  {
    link: "https://twitter.com/test/status/1111111111111111111",
    settings: { replaceYouTubeLinks: false },
    expected: false,
  },
  {
    link: "https://twitter.com/test/status/1111111111111111111",
    settings: { replaceYouTubeLinks: true },
    expected: false,
  },
  {
    link: "https://www.youtube.com/watch?v=xxxxxxxxxxx",
    settings: { replaceYouTubeLinks: false },
    expected: false,
  },
  {
    link: "https://www.youtube.com/watch?v=xxxxxxxxxxx",
    settings: { replaceYouTubeLinks: true },
    expected: true,
  },
  {
    link: "https://www.youtube.com/watch?v=xxxxxxxxxxx&t=42s",
    settings: { replaceYouTubeLinks: true },
    expected: true,
  },
  {
    link: "https://www.youtube.com/watch?v=xxxxxxxxxxx&t=1h42m42s",
    settings: { replaceYouTubeLinks: true },
    expected: true,
  },
  {
    link: "https://www.youtube.com/watch?v=xxxxxxxxxxx&t=1h42s",
    settings: { replaceYouTubeLinks: true },
    expected: true,
  },
  {
    link: "https://youtu.be/xxxxxxxxxxx",
    settings: { replaceYouTubeLinks: true },
    expected: true,
  },
  {
    link: "https://youtu.be/xxxxxxxxxxx?t=42",
    settings: { replaceYouTubeLinks: true },
    expected: true,
  },
  {
    link: "https://www.youtube.com/embed/xxxxxxxxxxx",
    settings: { replaceYouTubeLinks: true },
    expected: true,
  },
  {
    link: "https://www.youtube.com/embed/xxxxxxxxxxx?start=3642",
    settings: { replaceYouTubeLinks: true },
    expected: true,
  },
])(
  "canHandle returns $expected when link is $link and replaceYouTubeLinks is $settings.replaceYouTubeLinks",
  ({ link, settings, expected }) => {
    expect(youtube.canHandle(link, settings as any)).toBe(expected);
  },
);

test.each([
  {
    link: "https://www.youtube.com/watch?v=xxxxxxxxxxx",
    expected: "https://www.youtube.com/embed/xxxxxxxxxxx",
  },
  {
    link: "https://www.youtube.com/watch?v=xxxxxxxxxxx&t=42s",
    expected: "https://www.youtube.com/embed/xxxxxxxxxxx?start=42",
  },
  {
    link: "https://www.youtube.com/watch?v=xxxxxxxxxxx&t=1h42m42s",
    expected: "https://www.youtube.com/embed/xxxxxxxxxxx?start=6162",
  },
  {
    link: "https://www.youtube.com/watch?v=xxxxxxxxxxx&t=1h42s",
    expected: "https://www.youtube.com/embed/xxxxxxxxxxx?start=3642",
  },
  {
    link: "https://youtu.be/xxxxxxxxxxx",
    expected: "https://www.youtube.com/embed/xxxxxxxxxxx",
  },
  {
    link: "https://youtu.be/xxxxxxxxxxx?t=42",
    expected: "https://www.youtube.com/embed/xxxxxxxxxxx?start=42",
  },
  {
    link: "https://www.youtube.com/embed/xxxxxxxxxxx",
    expected: "https://www.youtube.com/embed/xxxxxxxxxxx",
  },
  {
    link: "https://www.youtube.com/embed/xxxxxxxxxxx?start=3642",
    expected: "https://www.youtube.com/embed/xxxxxxxxxxx?start=3642",
  },
])(
  "createEmbed returns iframe with src of $expected when link is $link",
  ({ link, expected }) => {
    let container: HTMLElement = document.createElement("div");
    container = youtube.createEmbed(link, container);
    const iframe = container.querySelector("iframe");
    expect(iframe.src).toBe(expected);
  },
);
