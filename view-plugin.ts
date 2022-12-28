import { RangeSetBuilder } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { Platform } from "obsidian";
import { EmbedSource } from "./embeds";
import SimpleEmbedsPlugin from "./main";

interface DecorationDef {
  from: number;
  to: number;
  deco: Decoration;
}

export function buildSimpleEmbedsViewPlugin(plugin: SimpleEmbedsPlugin) {
  class EmbedWidget extends WidgetType {
    constructor(
      readonly link: string,
      readonly fullWidth: boolean,
      readonly centered: boolean,
      readonly keepLinks: boolean,
      readonly embedSource: EmbedSource,
      readonly plugin: SimpleEmbedsPlugin,
    ) {
      super();
    }

    eq(other: EmbedWidget) {
      return (
        other.link === this.link &&
        other.fullWidth === this.fullWidth &&
        other.centered === this.centered &&
        other.keepLinks === this.keepLinks
      );
    }

    toDOM() {
      const embed = this.plugin.createEmbed(
        this.embedSource,
        this.link,
        this.fullWidth,
        this.centered,
        this.keepLinks,
      );
      return embed;
    }
  }

  const viewPlugin = ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
      }

      update(update: ViewUpdate) {
        if (
          update.docChanged ||
          update.viewportChanged ||
          update.selectionSet
        ) {
          this.decorations = this.buildDecorations(update.view);
        }
      }

      destroy() {}

      buildDecorations(view: EditorView) {
        let builder = new RangeSetBuilder<Decoration>();
        let definitions: DecorationDef[] = [];

        if (!plugin.isLivePreviewSupported) {
          return builder.finish();
        }

        let lines: number[] = [];
        if (view.state.doc.length > 0) {
          lines = Array.from({ length: view.state.doc.lines }, (_, i) => i + 1);
        }

        const currentSelections = [...view.state.selection.ranges];

        for (let n of lines) {
          const line = view.state.doc.line(n);
          const startOfLine = line.from;
          const endOfLine = line.to;

          let currentLine = false;

          currentSelections.forEach((r) => {
            if (r.from >= startOfLine && r.to <= endOfLine) {
              currentLine = true;
              return;
            }
          });

          const text = line.text;
          const mdLink = text
            .match(/\[([^\[]+)\](\(.*\))/)
            ?.first()
            .trim();

          if (!currentLine && mdLink) {
            const start = line.text.indexOf(mdLink) + startOfLine;
            const end = start + mdLink.length;
            let embedSource = plugin.embedSources.find((source) => {
              return (
                plugin.settings[source.enabledKey] &&
                source.regex.test(line.text)
              );
            });

            if (!embedSource && Platform.isDesktopApp && plugin.settings.replaceGenericLinks) {
              embedSource = plugin.genericPreviewEmbed;
            }

            const isWithinText = this.isWithinText(text);
            const replaceWithEmbed = plugin.shouldReplaceWithEmbed(
              mdLink,
              isWithinText,
            );
            const fullWidth = mdLink.includes("|fullwidth");
            definitions.push(...this.hideOptions(mdLink, start));
            if (embedSource && replaceWithEmbed) {
              let link;

              if (embedSource == plugin.genericPreviewEmbed) {
                const mdLinkRegex = /^\[([\w\s\d]+)\]\((https?:\/\/[\w\d./?=#]+)\)$/;
                const [_full, _text, url] = line.text.match(mdLinkRegex);
                if (!url) continue;
                link = url;
              }
              else {
                link = line.text.match(embedSource.regex).first();
              }

              definitions.push(
                this.createWidget(link, fullWidth, embedSource, start, end),
              );
            }
          }
        }

        definitions.sort((a, b) => {
          return a.from - b.from;
        });
        definitions.forEach(({ from, to, deco }) =>
          builder.add(from, to, deco)
        );

        return builder.finish();
      }

      hideOptions(text: string, startOfLink: number) {
        const definitions: DecorationDef[] = [];
        for (let option of ["|noembed", "|embed", "|fullwidth"]) {
          if (text.includes(option)) {
            const from = text.indexOf(option) + startOfLink;
            const to = from + option.length;

            const deco = Decoration.replace({});
            definitions.push({
              from,
              to,
              deco,
            });
          }
        }
        return definitions;
      }

      createWidget(
        link: string,
        fullWidth: boolean,
        embedSource: EmbedSource,
        start: number,
        end: number,
      ) {
        const deco = Decoration.widget({
          widget: new EmbedWidget(
            link,
            fullWidth,
            plugin.settings.centerEmbeds,
            plugin.settings.keepLinksInPreview,
            embedSource,
            plugin,
          ),
        });
        if (plugin.settings.keepLinksInPreview) {
          if (plugin.settings.embedPlacement === "above") {
            return {
              from: start,
              to: start,
              deco,
            };
          } else if (plugin.settings.embedPlacement === "below") {
            return {
              from: end,
              to: end,
              deco,
            };
          }
        } else {
          return {
            from: start,
            to: end,
            deco,
          };
        }
      }

      isWithinText(text: string) {
        const mdLink = text
          .match(/\[([^\[]+)\](\(.*\))/)[0].trim();

        const lineWithoutLink = text.replace(mdLink, "");
        const lineWithoutListMarkup = lineWithoutLink.replace(
          /-|\s\[|(\w|\s)\]/g,
          "",
        )
          .trim();
        return lineWithoutListMarkup?.length > 0;
      }
    },
    {
      decorations: (v) => v.decorations,
    },
  );

  return viewPlugin;
}
