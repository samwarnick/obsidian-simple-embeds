# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

# [1.10.0]

### Added

- Live preview support.
  - Can be disabled in settings.

# [1.9.0]

### Added

- Make embed full width by add `|fullwidth` to link description.
  - For example, `[Useful description|fullwidth](https://youtube.com/watch?v=acdefghijk)`
- Add option to center embeds.
- Add support for Apple Podcasts links.
- Add partial support for Apple TV links.
  - For some reason, playback fails. Clicking play will open Apple TV instead.
- Add partial support for Apple Music.
  - Unable to sign into your Apple Music account, so you only get the previews.

# [1.8.0]

### Added

- Add support for CodePen embeds
- Add support for GitHub gists
# [1.7.0]

### Added

- Add support for Instagram tv and instagram reels

# [1.6.3]

### Fixed

- `|noembed` was not being removed from link text.

# [1.6.2]

### Fixed

- Text within links was being modified even when it was not being replaced with an embed, stripping out any styles.
## [1.6.1]

### Fixed

- YouTube links using a start time in the format of 0h0m0s will now be parsed correctly.
## [1.6.0]

### Added

- Support for YouTube video start times in links.
- Support for dark themes for Twitter embeds.
  - With setting for automatic, always dark, and always light.

## [1.5.0]

### Added

- Support for [Flat.io](https://flat.io) links.
- Support for [Noteflight](https://www.noteflight.com) links.
## [1.4.0] - 2021-10-29

### Added

- Support for Instagram links.

## [1.3.0] - 2021-10-07

### Fixed

- Links will not be replaced with embeds when they are within text.

## [1.2.0] - 2021-10-03

### Added

- Setting to choose whether to place embeds above or below the link when "Keep links in preview" is enabled.

## [1.1.0] - 2021-10-02

### Added

- Prevent a link from being replaced with an embed by adding `|noembed` to the link text.
  - For example, `[Useful description|noembed](https://twitter.com/user/status/123)`
- New setting to place embeds above link in preview, instead of replacing it.
- New setting to disable automatic embeds and require `|embed` to be added to link text.
  - For example, `[Some description|embed](https://twitter.com/user/status/123)`

## [1.0.2] - 2021-09-29

### Fixed

- Recognize Twitter links for the mobile site

## [1.0.1] - 2021-09-21

### Changed

- Only load Twitter embed script if a Twitter link is found
- Add sandbox properties to YouTube iframe

## [1.0.0] - 2021-09-15

- Initial release 🎉

[Unreleased]: https://github.com/samwarnick/obsidian-simple-embeds/compare/1.10.0...HEAD
[1.10.0]: https://github.com/samwarnick/obsidian-simple-embeds/compare/1.9.0...1.10.0
[1.9.0]: https://github.com/samwarnick/obsidian-simple-embeds/compare/1.8.0...1.9.0
[1.8.0]: https://github.com/samwarnick/obsidian-simple-embeds/compare/1.7.0...1.8.0
[1.7.0]: https://github.com/samwarnick/obsidian-simple-embeds/compare/1.6.3...1.7.0
[1.6.3]: https://github.com/samwarnick/obsidian-simple-embeds/compare/1.6.2...1.6.3
[1.6.2]: https://github.com/samwarnick/obsidian-simple-embeds/compare/1.6.1...1.6.2
[1.6.1]: https://github.com/samwarnick/obsidian-simple-embeds/compare/1.6.0...1.6.1
[1.6.0]: https://github.com/samwarnick/obsidian-simple-embeds/compare/1.5.0...1.6.0
[1.5.0]: https://github.com/samwarnick/obsidian-simple-embeds/compare/1.4.0...1.5.0
[1.4.0]: https://github.com/samwarnick/obsidian-simple-embeds/compare/1.3.0...1.4.0
[1.3.0]: https://github.com/samwarnick/obsidian-simple-embeds/compare/1.2.0...1.3.0
[1.2.0]: https://github.com/samwarnick/obsidian-simple-embeds/compare/1.1.0...1.2.0
[1.1.0]: https://github.com/samwarnick/obsidian-simple-embeds/compare/1.0.2...1.1.0
[1.0.2]: https://github.com/samwarnick/obsidian-simple-embeds/compare/1.0.1...1.0.2
[1.0.1]: https://github.com/samwarnick/obsidian-simple-embeds/compare/1.0.0...1.0.1
[1.0.0]: https://github.com/samwarnick/obsidian-simple-embeds/releases/tag/1.0.0