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
      readonly embedSource: EmbedSource,
      readonly plugin: SimpleEmbedsPlugin,
    ) {
      super();
    }

    eq(other: EmbedWidget) {
      return other.link === this.link && other.fullWidth === this.fullWidth &&
        other.centered === this.centered;
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
        let definitions: DecorationDef[] = [];

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
            definitions.push(...this.hideOptions(
              mdLink,
              startOfLine,
            ));
            if (embedSource && replaceWithEmbed) {
              const link = line.text.match(embedSource.regex).first();
              const deco = Decoration.replace({
                widget: new EmbedWidget(
                  link,
                  fullWidth,
                  plugin.settings.centerEmbeds,
                  embedSource,
                  plugin,
                ),
                inclusive: false,
              });
              if (plugin.settings.keepLinksInPreview) {
                if (plugin.settings.embedPlacement === "above") {
                  definitions.push({
                    from: start,
                    to: start,
                    deco,
                  });
                } else if (plugin.settings.embedPlacement === "below") {
                  definitions.push({
                    from: end,
                    to: end,
                    deco,
                  });
                }
              } else {
                definitions.push({
                  from: start,
                  to: end,
                  deco,
                });
              }
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

      hideOptions(
        text: string,
        startOfLine: number,
      ) {
        const definitions: DecorationDef[] = [];
        for (let option of ["|noembed", "|embed", "|fullwidth"]) {
          if (text.includes(option)) {
            const from = text.indexOf(option) + startOfLine;
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
    },
    {
      decorations: (v) => v.decorations,
    },
  );

  return viewPlugin;
}
