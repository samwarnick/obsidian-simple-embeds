# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0]

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

[Unreleased]: https://github.com/samwarnick/obsidian-simple-embeds/compare/1.4.0...HEAD
[1.4.0]: https://github.com/samwarnick/obsidian-simple-embeds/compare/1.3.0...HEAD
[1.3.0]: https://github.com/samwarnick/obsidian-simple-embeds/compare/1.2.0...1.3.0
[1.2.0]: https://github.com/samwarnick/obsidian-simple-embeds/compare/1.1.0...1.2.0
[1.1.0]: https://github.com/samwarnick/obsidian-simple-embeds/compare/1.0.2...1.1.0
[1.0.2]: https://github.com/samwarnick/obsidian-simple-embeds/compare/1.0.1...1.0.2
[1.0.1]: https://github.com/samwarnick/obsidian-simple-embeds/compare/1.0.0...1.0.1
[1.0.0]: https://github.com/samwarnick/obsidian-simple-embeds/releases/tag/1.0.0