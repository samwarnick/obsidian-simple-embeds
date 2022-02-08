import { YouTubeEmbed } from "../embeds";

let youtube: YouTubeEmbed;

beforeEach(() => {
  youtube = new YouTubeEmbed();
});

test.each([
  {
    link: "https://twitter.com/test/status/1111111111111111111",
    expected: false,
  },
  {
    link: "https://twitter.com/test/status/1111111111111111111",
    expected: false,
  },
  {
    link: "https://www.youtube.com/watch?v=xxxxxxxxxxx",
    expected: false,
  },
  {
    link: "https://www.youtube.com/watch?v=xxxxxxxxxxx",
    expected: true,
  },
  {
    link: "https://www.youtube.com/watch?v=xxxxxxxxxxx&t=42s",
    expected: true,
  },
  {
    link: "https://www.youtube.com/watch?v=xxxxxxxxxxx&t=1h42m42s",
    expected: true,
  },
  {
    link: "https://www.youtube.com/watch?v=xxxxxxxxxxx&t=1h42s",
    expected: true,
  },
  {
    link: "https://youtu.be/xxxxxxxxxxx",
    expected: true,
  },
  {
    link: "https://youtu.be/xxxxxxxxxxx?t=42",
    expected: true,
  },
  {
    link: "https://www.youtube.com/embed/xxxxxxxxxxx",
    expected: true,
  },
  {
    link: "https://www.youtube.com/embed/xxxxxxxxxxx?start=3642",
    expected: true,
  },
])(
  "canHandle returns $expected when link is $link and replaceYouTubeLinks is $settings.replaceYouTubeLinks",
  ({ link, expected }) => {
    expect(youtube.regex.test).toBe(expected);
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
