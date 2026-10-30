# Pathway expansion reference data

These source-checked data drafts cover six pathway modules for Terpene Atlas.

| Module | Proposed location | Main chemistry |
| --- | --- | --- |
| Iridoids | Monoterpenoids | Oxidation, reductive activation, stereoselective cyclisation and lactol oxidation |
| Artemisinin | Sesquiterpenoids | Sequential oxidation, aldehyde branch-point reduction and late nonenzymatic oxidative chemistry |
| Gibberellins | Diterpenoids | Plant KO/KAO oxidation and ring-B contraction toward GA12 |
| Plant carotenoids | Carotenoids | PDS, Z-ISO, ZDS and CRTISO with explicit poly-cis intermediates |
| Astaxanthin esters | Carotenoids | Mono-/diester examples, characterised acyltransferases and analytical de-esterification |
| ABA cleavage | Carotenoid-derived pathways | C40 cleavage into C15/C25 products and subsequent ABA biosynthesis |

[pathway-modules.json](pathway-modules.json) retains molecule identities, SMILES, formulas, enzyme examples, source links and evidence scope. They are content drafts; they are not loaded by the application.

## Scientific scope

- A single enzyme-catalysed biochemical stage is distinct from a condensed sequence or a proposed internal mechanism.
- The iridoid reference route combines characterised Catharanthus and Nepeta systems. It does not establish one native pathway containing all displayed enzymes.
- The two nepetalactol reference structures leave the C1 anomeric configuration unassigned.
- DBR2 acts on artemisinic aldehyde. It is not a direct artemisinic-acid-to-DHAA enzyme.
- Late DHAA-to-artemisinin oxidation is represented as nonenzymatic reference chemistry.
- Plant poly-cis carotenoid intermediates remain separate from all-trans CrtI references.
- Ester illustrations do not establish a named acyltransferase's unrestricted donor specificity or an export phenotype.
- Xanthoxin and ABA are C15 apocarotenoids derived from C40 substrates. They must not be silently classified as FPP-derived sesquiterpenoids or C40 skeletons.
- Reference enzymes do not assign functions to untested organism-specific candidates.

## Integration requirements

1. Parse each SMILES and verify formula, charge, connectivity and stereochemical scope before generating local molecular illustrations.
2. Add the new compound records and required apocarotenoid family handling to the library and relevant practice flows.
3. Build graph views using the existing routing and fullscreen components; retain source-qualified connection details.
4. Connect the six modules to their family navigation and integrate relevant enzyme-reaction practice cards.
5. Verify carbon accounting, source links, graph routing, bilingual rendering and navigation in both application editions.
6. Publish only after the structure and application checks pass.
