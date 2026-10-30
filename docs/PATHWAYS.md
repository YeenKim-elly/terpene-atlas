# Focused biosynthetic pathways

Atlas includes six focused pathways under the relevant Structure web family tabs.

| Family tab | Focused pathway | Main chemistry |
| --- | --- | --- |
| Monoterpenoids | Iridoids | Geraniol oxidation, ISY reduction, NEPS cyclisation and lactol oxidation |
| Sesquiterpenoids | Artemisinin | Aldehyde branch, DBR2 reduction, ALDH1 oxidation and separately labelled autoxidation |
| Diterpenoids | Gibberellins | ent-CPP/ent-kaurene, KO oxidations and KAO ring-B contraction to GA12 |
| Carotenoids | Plant poly-cis | PDS, Z-ISO, ZDS and CRTISO with individually defined geometries |
| Carotenoids | Astaxanthin esters | Free form, representative mono-/dipalmitates and analytical hydrolysis |
| Carotenoids | Cleavage to ABA | 9-cis substrate, NCED C15 + C25 cleavage, ABA2 and AAO3 |

The additions contain 28 molecular reference records and 19 enzyme-reaction
learning cards. Their 32 new connections distinguish individual reactions,
condensed chemistry and structural relationships. Five existing precursor
connections are reused to place the focused routes in context.

Each map includes bilingual scope notes and primary-source enzyme/cofactor
references. Compound records retain database identifiers, formula, SMILES and
stereochemical qualifications. RDKit preparation checks covered formulas,
carbon counts and supplied source InChIKeys.

The nepetalactol C1 anomers remain unassigned. The monopalmitate is a labelled
structural model with no PubChem CID. Both ester drawings retain the selected
S,S astaxanthin parent; condensed overview images abbreviate only the
hydrocarbon tails and link to complete drawings.

The ABA products use the separate `apo` family: C15 structures derived from
C40 cleavage. The NCED annotation retains the C25 coproduct and
40 = 15 + 25 carbon balance.

Runtime records and sources live in `data/`; the six graph files and
`data/pathway-notes.json` define the maps and scientific qualifications.
