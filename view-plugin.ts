import { RangeSetBuilder } from "@codemirror/rangeset";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { EmbedSource } from "./embeds";
import SimpleEmbedsPlugin from "./main";

export function buildSimpleEmbedsViewPlugin(plugin: SimpleEmbedsPlugin) {
  class EmbedWidget extends WidgetType {
    constructor(
      readonly link: string,
      readonly fullWidth: boolean,
      readonly embedSource: EmbedSource,
      readonly plugin: SimpleEmbedsPlugin,
    ) {
      super();
    }

    eq(other: EmbedWidget) {
      return other.link === this.link && other.fullWidth === this.fullWidth;
    }

    toDOM() {
      const embed = this.plugin.createEmbed(
        this.embedSource,
        this.link,
        this.fullWidth,
      );
      return embed;
    }

    ignoreEvent() {
      return true;
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
          update.docChanged || update.viewportChanged || update.selectionSet
        ) {
          this.decorations = this.buildDecorations(update.view);
        }
      }

      destroy() {
      }

      buildDecorations(view: EditorView) {
        let builder = new RangeSetBuilder<Decoration>();

        if (!plugin.isLivePreviewSupported) {
          return builder.finish();
        }

        let lines: number[] = [];
        if (view.state.doc.length > 0) {
          lines = Array.from(
            { length: view.state.doc.lines },
            (_, i) => i + 1,
          );
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

          const mdLink = line.text.match(/\[.*\]\(\S*\)/)?.first().trim();
          if (!currentLine && mdLink) {
            const start = line.text.indexOf(mdLink) + startOfLine;
            const end = start + mdLink.length;
            let embedSource = plugin.embedSources.find((source) => {
              return plugin.settings[source.enabledKey] &&
                source.regex.test(line.text);
            });
            const replaceWithEmbed = plugin.shouldReplaceWithEmbed(mdLink);
            const fullWidth = mdLink.includes("|fullwidth");
            this.hideOptions(mdLink, startOfLine, builder);
            if (embedSource && replaceWithEmbed) {
              const link = line.text.match(embedSource.regex).first();
              const deco = Decoration.replace({
                widget: new EmbedWidget(
                  link,
                  fullWidth,
                  embedSource,
                  plugin,
                ),
                inclusive: false,
              });
              if (plugin.settings.keepLinksInPreview) {
                if (plugin.settings.embedPlacement === "above") {
                  builder.add(start, start, deco);
                } else if (plugin.settings.embedPlacement === "below") {
                  builder.add(end, end, deco);
                }
              } else {
                builder.add(start, end, deco);
              }
            }
          }
        }

        return builder.finish();
      }

      hideOptions(
        text: string,
        startOfLine: number,
        builder: RangeSetBuilder<Decoration>,
      ) {
        for (let option of ["|noembed", "|embed", "|fullwidth"]) {
          if (text.includes(option)) {
            const start = text.indexOf(option) + startOfLine;
            const end = start + option.length;

            const deco = Decoration.replace({});
            builder.add(start, end, deco);
          }
        }
      }
    },
    {
      decorations: (v) => v.decorations,
    },
  );

  return viewPlugin;
}
