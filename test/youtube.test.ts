import { YouTubeEmbed } from "../embeds/youtube";

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
  {
    link: "https://www.youtube.com/shorts/xxxxxxxxxxx",
    expected: true,
  },
])("test returns $expected when link is $link", ({ link, expected }) => {
  expect(youtube.regex.test(link)).toBe(expected);
});

test.each([
  {
    link: "https://www.youtube.com/watch?v=xxxxxxxxxxx",
    expected: ["xxxxxxxxxxx", null],
  },
  {
    link: "https://www.youtube.com/watch?v=xxxxxxxxxxx&t=42s",
    expected: ["xxxxxxxxxxx", "start=42"],
  },
  {
    link: "https://www.youtube.com/watch?v=xxxxxxxxxxx&t=1h42m42s",
    expected: ["xxxxxxxxxxx", "start=6162"],
  },
  {
    link: "https://www.youtube.com/watch?v=xxxxxxxxxxx&t=1h42s",
    expected: ["xxxxxxxxxxx", "start=3642"],
  },
  {
    link: "https://youtu.be/xxxxxxxxxxx",
    expected: ["xxxxxxxxxxx", null],
  },
  {
    link: "https://youtu.be/xxxxxxxxxxx?t=42",
    expected: ["xxxxxxxxxxx", "start=42"],
  },
  {
    link: "https://www.youtube.com/embed/xxxxxxxxxxx",
    expected: ["xxxxxxxxxxx", null],
  },
  {
    link: "https://www.youtube.com/embed/xxxxxxxxxxx?start=3642",
    expected: ["xxxxxxxxxxx", "start=3642"],
  },
])(
  "createEmbed returns iframe with src of $expected when link is $link",
  ({ link, expected }) => {
    let container: HTMLElement = document.createElement("div");
    container = youtube.createEmbed(link, container);
    const embed = container.querySelector("lite-youtube");
    expect(embed.getAttribute("videoid")).toBe(expected[0]);
    expect(embed.getAttribute("params")).toBe(expected[1]);
  },
);
