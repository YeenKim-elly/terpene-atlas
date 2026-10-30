# Reference data

JSON files are the canonical runtime datasets. JavaScript modules load them
through src/lib/catalogue.js.

## Structure records

Molecules and precursors use:
- id: stable identifier, unique across the reference catalogue.
- name and ko: display labels.
- family: key from families.json.
- skeleton: terpene-derived parent carbon count; 15 for the ABA cleavage products.
- originSkeleton: optional biosynthetic origin, 40 for those C15 apocarotenoids.
- family apo: C40-derived C15 apocarotenoids; not FPP-derived sesquiterpenoids.
- fullStructureImage: optional unabridged SVG when image condenses a labelled hydrocarbon tail.
- MolecularFormula: selected record's total formula.
- image: relative local illustration path.
- source: supporting record or publication URL.
- note and noteKo: teaching explanation and qualifications.
- aliases: accepted alternative answers, where applicable.
- CID and SMILES: selected PubChem representation, when available.
- structureScope: qualification for a partial model or primary-source figure.

A null CID is intentional for records without an assigned PubChem representation.
A primary-figure record uses sourceFigure for attribution, compound number and
licence information. A relative-pairs-only model leaves the stated absolute,
inter-pair and side-chain stereochemistry unresolved.

Scaffolds and motifs add category, schematic or ring-relationship fields where
appropriate. comparison-structures.json contains the two additional records used
in the aligned comparison view.

## Reactions

reactions.json contains enzyme, left, right, cofactor, title, ko, note, noteKo
and source. enzyme must exist in enzymes.json. Schemes are educational summaries;
their notes identify assay treatments and organism-specific scope.

## Graphs

Each file in graphs/ defines:
- title and intro: English/Korean pairs.
- width and height: diagram coordinates.
- nodes: arrays of record ID, x and y.
- edges: from, to, label, type, detail and source.
- reversible: optional edge flag.
- layers: optional captions and vertical positions.

Edge types distinguish step (reaction), summary (condensed route), structure
(structural relation without an arrowhead) and mechanism (qualified internal
TPS II rearrangement). labelKo and detailKo localise pathway annotations.
A structural relation does not assert a chemical conversion. An optional
coproduct annotation retains the NCED C25 product and C40 = C15 + C25 balance.

pathway-notes.json supplies bilingual map scope, primary-source callouts and
reference enzyme/cofactor tables. New focused graph IDs also belong in
src/lib/catalogue.js and src/lib/structure-views.js.

## Comparisons and practice

comparisons.json holds paired record IDs, aligned assets, numbering availability,
mapped changes and scientific caveats.

questions/comparisons.json supplies explicit prompts, accepted answers, answer
options, explanations and an aligned figure reference. General identification
questions are generated from the structure and reaction records.

Answer matching normalises punctuation and Greek-letter names while preserving
leading (+)/(−) stereochemical signs.
