import fs from 'node:fs/promises';
import {catalogueFiles, hydrateCatalogue, graphIds} from '../../src/lib/catalogue.js';
export const rootURL = new URL('../../', import.meta.url);
export const json = async file => JSON.parse(await fs.readFile(new URL(file, rootURL), 'utf8'));
export async function loadTestCatalogue() {
  const records = Object.fromEntries(await Promise.all(Object.entries(catalogueFiles).map(
    async ([key, file]) => [key, await json('data/' + file)]
  )));
  const graphs = Object.fromEntries(await Promise.all(
    graphIds.map(
      async id => [id, await json('data/graphs/' + id + '.json')]
    )
  ));
  return hydrateCatalogue(records, graphs);
}
