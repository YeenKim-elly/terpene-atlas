# Architecture

Terpene Atlas is a static application with native JavaScript modules.
It has no server-side application or runtime package dependencies.

## Application flow

1. index.html loads styles and src/app.js.
2. src/lib/catalogue.js fetches canonical JSON datasets.
3. src/components/shell.js renders navigation and the page container.
4. src/pages/ renders the selected view.
5. Shared card, modal and diagram components render scientific records.

The hash routes are #practice, #library, #web, #compare and #sources.

## Module responsibilities

| Directory | Responsibility |
| --- | --- |
| src/pages/ | Library, practice, structure web, comparison and source views |
| src/components/ | Shell, icons, cards, modal and carbocation illustrations |
| src/lib/ | Data loading, translations, answer matching, progress and graph routing |
| styles/ | Shared and view-specific styling |
| data/ | Canonical reference records and relationship definitions |
| assets/ | Locally served scientific illustrations and branding |
| scripts/ | Local server and validation entry points |
| tests/ | Data, rendering, interaction, routing and server checks |

Language, learning progress and optional graph layouts use browser storage.
Unavailable storage does not prevent the reference features from working.

## Editing

Change records in data/ and place illustrations in the corresponding assets/
directory. Update relative paths together. Run npm run check after editing.

The server only serves index.html and the src/, styles/, data/ and assets/
directories. It supports GET and HEAD requests.
