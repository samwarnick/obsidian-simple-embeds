function isWithinText(text: string) {
  const mdLink = text
    .match(/\[([^\[]+)\](\(.*\))/)[0].trim();

  const lineWithoutLink = text.replace(mdLink, "");
  const lineWithoutListMarkup = lineWithoutLink.replace(/-|\s\[|(\w|\s)\]/g, "")
    .trim();
  return lineWithoutListMarkup.length > 0;
}

test.each([
  {
    text: "[a link|embed](https://example.com)",
    expected: false,
  },
  {
    text: "- [a link|embed](https://example.com)",
    expected: false,
  },
  {
    text: "- [ ] [a link|embed](https://example.com)",
    expected: false,
  },
  {
    text: "- [x] [a link|embed](https://example.com)",
    expected: false,
  },
  {
    text: "this is some text [a link|embed](https://example.com)",
    expected: true,
  },
  {
    text: "- this is some text [a link|embed](https://example.com)",
    expected: true,
  },
  {
    text: "- [ ] this is some text [a link|embed](https://example.com)",
    expected: true,
  },
  {
    text: "- [x] this is some text [a link|embed](https://example.com)",
    expected: true,
  },
])(
  "test returns $expected when line is $text",
  ({ text, expected }) => {
    expect(isWithinText(text)).toBe(expected);
  },
);

export {};
