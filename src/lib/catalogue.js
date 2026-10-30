export const graphIds=['precursors','carotenoids','diterpenes','scaffolds','monoterpenes','sesquiterpenes','carotenoid-frameworks'];
export const catalogue = {
  molecules: [], precursors: [], scaffolds: [], motifs: [], reactions: [],
  comparisons: [], comparisonStructures: [], graphNotes: [], comparisonQuestions: [],
  references: [], families: {}, enzymes: {}, graphs: {}, familyGuides: {}
};

export const catalogueFiles = {
  molecules: 'molecules.json',
  precursors: 'precursors.json',
  scaffolds: 'scaffolds.json',
  motifs: 'motifs.json',
  reactions: 'reactions.json',
  comparisons: 'comparisons.json',
  comparisonStructures: 'comparison-structures.json',
  graphNotes: 'graph-notes.json',
  comparisonQuestions: 'questions/comparisons.json',
  references: 'references.json',
  families: 'families.json',
  enzymes: 'enzymes.json',
  familyGuides: 'framework-guides.json'
};

export function hydrateCatalogue(records, graphs) {
  for (const key of Object.keys(catalogueFiles)) {
    const value = records[key];
    if (Array.isArray(catalogue[key])) {
      if (!Array.isArray(value)) throw new Error('Expected a list: ' + key);
      catalogue[key].splice(0, catalogue[key].length, ...value);
    } else {
      if (!value || Array.isArray(value) || typeof value !== 'object') {
        throw new Error('Expected an object: ' + key);
      }
      Object.assign(catalogue[key], value);
    }
  }
  Object.assign(catalogue.graphs, graphs);
  return catalogue;
}

export async function loadCatalogue(fetcher = fetch) {
  const read = async path => {
    const url = new URL('../../data/' + path, import.meta.url);
    const response = await fetcher(url);
    if (!response.ok) throw new Error('Cannot load reference data: ' + path);
    return response.json();
  };
  const records = Object.fromEntries(await Promise.all(
    Object.entries(catalogueFiles).map(async ([key, path]) => [key, await read(path)])
  ));
  const graphs = Object.fromEntries(await Promise.all(
    graphIds.map(
      async id => [id, await read('graphs/' + id + '.json')]
    )
  ));
  return hydrateCatalogue(records, graphs);
}

export const allStructures = () => [...catalogue.molecules, ...catalogue.precursors];
export const allReferenceRecords = () => [
  ...allStructures(), ...catalogue.scaffolds, ...catalogue.motifs,
  ...catalogue.comparisonStructures, ...catalogue.graphNotes
];
export const findRecord = id => allReferenceRecords().find(record => record.id === id);
