# Simple Embeds

This [Obsidian](https://obsidian.md) plugin will turn Twitter and YouTube links into embeds when the file is previewed, without changing the contents of your file. Even works when hovering over internal links. 

Just add links like you normally would:

```md
[Twitter link](https://twitter.com/johnvoorhees/status/1437735225086316548?s=21)
[YouTube link](https://youtu.be/C4sAUc_ZGMY)
```

If you would like to disable a particular link, add `|noembed` to the link text. For example:
```md
[Twitter link|noembed](https://twitter.com/johnvoorhees/status/1437735225086316548?s=21)
```

By default, most embeds have a max width of 550px (the max width of Twitter embeds). To make an embed full width[^1], add `|fullwidth` to the link text. For example:

```md
[YouTube link|fullwidth](https://www.youtube.com/watch?v=aqafn8kFDyY)
```
## Supported links

- Apple Music[^2]
- Apple Podcasts
- Apple TV[^2]
- CodePen
- Flat.io
- Github Gists
- Instagram
- Noteflight
- Twitter
- YouTube
- Reddit

## Styling

Each embed is wrapped in a container with the class of `.embed-container` and a class unique to each embed type:
| Embed | Class |
| ------------- | ------------- |
| Apple Music | `.apple-music` |
| Apple Podcasts | `.apple-podcasts` |
| Apple TV | `.apple-tv` |
| CodePen | `.codepen` |
| Flat.io | `.flat_io` |
| GitHub Gists | `.github_gist` |
| Instagram | `.instagram` |
| Noteflight | `.noteflight` |
| Twitter | `.twitter` |
| YouTube | `.youtube` |
| Reddit | `.reddit` |

You can use these in your own [CSS snippets](https://help.obsidian.md/How+to/Add+custom+styles#Use+Themes+and+or+CSS+snippets). For example, if you would like to make all YouTube embeds full width, you could add the following:

```css
.embed-container.youtube {
    max-width: 100%;
} 
```

Or if you want to center all Twitter embeds:

```css
.embed-container.twitter {
    margin: 0 auto;
}
```

## Screenshots

![Simple Embeds demo](https://raw.githubusercontent.com/samwarnick/obsidian-simple-embeds/main/screenshots/demo.gif)

_Demo_

![Screenshot of embeds in iOS app](https://raw.githubusercontent.com/samwarnick/obsidian-simple-embeds/main/screenshots/ios.png)

_iOS app_

![Screenshot of embeds in Android app](https://raw.githubusercontent.com/samwarnick/obsidian-simple-embeds/main/screenshots/android.png)

_Android app_

[^1]: Many themes set a max width on the preview area, often around 750px. Embeds will not be wider than your theme allows.
[^2]: Partial support. Some known issues exist.
