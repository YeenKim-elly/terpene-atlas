# Terpene Atlas

A bilingual learning atlas for exploring terpene structures, functional motifs
and biosynthetic relationships.

## Features

- Searchable reference library with **83 molecule entries**, **17 precursors**,
  **33 scaffold and ring models**, **37 functional motifs** and **40 enzyme reactions**.
- Six family tabs with eight structure-web maps, including C10/C15/C20 precursor–enzyme–framework maps and a C40 end-group overview.
- Scaffold galleries with C10, C15, C20, C40 and shared ring-system filters in both the library and Structure web.
- Diterpenoid subviews for precursor frameworks, expanded pathways and C20 ring fusion, rearrangements and clerodane classes.
- Fullscreen graph viewing with zoom, full-network Fit and Escape-to-close.
- Multiple-choice and typed-answer practice, hints, feedback and review.
- Eighteen aligned structure comparisons, including stereochemical and functional-group differences.
- English and Korean interface.
- Source references, stereochemical qualifications and figure attribution.

Counts describe reference entries. Selected alternative database representations
and explicitly labelled partial models are included. Two additional molecular
records support the comparison view.

## Quick start

Requirements: Node.js 22 or later, with npm.

No package installation or build step is required.

~~~sh
npm start
~~~

Open the local URL printed by the server. The default address is
<http://127.0.0.1:5173>.

To choose another port:

~~~sh
npm start -- --port 8080
~~~

Use an HTTP server; JavaScript modules and JSON data loading do not support
opening index.html directly from the filesystem.

## Validation

~~~sh
npm run check
~~~

This checks module syntax, reference-data integrity, local resource paths,
quiz answers, screen controls and diagram routing.

Without npm, the equivalent commands are:

~~~sh
node scripts/serve.mjs
node scripts/check.mjs
~~~

## Project structure

~~~text
terpene-atlas/
├── index.html
├── src/
│   ├── app.js
│   ├── components/
│   ├── lib/
│   └── pages/
├── styles/
├── data/
│   ├── graphs/
│   └── questions/
├── assets/
│   ├── branding/
│   ├── structures/
│   ├── scaffolds/
│   ├── motifs/
│   ├── comparisons/
│   └── literature/
├── scripts/
├── tests/
├── docs/
├── package.json
├── README.txt
└── THIRD_PARTY_NOTICES.md
~~~

The application uses native JavaScript modules, CSS and curated JSON data.
See [Architecture](docs/ARCHITECTURE.md) and [Data format](docs/DATA_FORMAT.md)
for editing guidance.

## Scientific scope

This is an educational reference. Structural similarity alone does not establish
a biosynthetic conversion or compound identity. Reaction labels identify their
scope, and relative stereochemical models retain their stated limitations.
Consult the linked sources for organism-specific and enzyme-specific evidence.

## Attribution

Scientific records and illustrations retain their source information.
See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for attribution and
asset-specific licence terms. Source-derived Crispene figure panels are subject
to CC BY-NC-SA 3.0.
