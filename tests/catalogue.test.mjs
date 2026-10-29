import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {loadTestCatalogue, rootURL} from './support/catalogue.mjs';
import {allReferenceRecords} from '../src/lib/catalogue.js';
const data = await loadTestCatalogue();
test('curated records have distinct IDs, sources and local illustrations', async () => {
  assert.deepEqual([data.molecules.length,data.precursors.length,data.scaffolds.length,
    data.motifs.length,data.reactions.length,data.comparisons.length], [72,15,19,37,28,8]);
  const records = allReferenceRecords();
  assert.equal(new Set(records.map(record => record.id)).size, records.length);
  for (const record of records) {
    assert.ok(record.id && record.name && record.image);
    assert.match(record.source, /^https:\/\//);
    const bytes = await fs.readFile(new URL(record.image, rootURL));
    assert.ok(bytes.length > 100);
    if (record.image.endsWith('.svg')) assert.match(bytes.toString(), /<svg\b/);
    if (record.image.endsWith('.png')) assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  }
  for (const reaction of data.reactions) {
    assert.ok(data.enzymes[reaction.enzyme] && reaction.left && reaction.right && reaction.source);
  }
});
test('partial models and primary figures retain their qualifications', () => {
  assert.equal(data.precursors.find(record => record.id === 'kpp').CID,129626741);
  for (const id of ['clpp-cis-cis','clpp-cis-trans']) {
    const model = data.precursors.find(record => record.id === id);
    assert.equal(model.CID,null);
    assert.equal(model.structureScope,'relative-pairs-only');
    assert.match(model.note,/inter-pair/);
    assert.match(model.note,/C13 E\/Z/);
  }
  for (const record of data.molecules.filter(record => record.structureScope === 'primary-figure')) {
    assert.ok(!record.SMILES && !record.CID);
    assert.equal(record.sourceFigure.licence,'CC BY-NC-SA 3.0');
    assert.ok(record.sourceFigure.attribution && record.sourceFigure.licenceUrl);
  }
});
test('graph references and every comparison asset resolve', async () => {
  const ids = new Set(allReferenceRecords().map(record => record.id));
  for (const graph of Object.values(data.graphs)) {
    const local = new Set(graph.nodes.map(([id]) => id));
    for (const id of local) assert.ok(ids.has(id), id);
    for (const edge of graph.edges) assert.ok(local.has(edge.from) && local.has(edge.to));
  }
  for (const pair of data.comparisons) {
    assert.ok(ids.has(pair.leftId) && ids.has(pair.rightId));
    for (const side of ['left','right']) for (const key of ['plain','highlighted','numbered','numberedHighlighted']) {
      if (pair[side][key]) await fs.access(new URL(pair[side][key],rootURL));
    }
    assert.ok(pair.sources.length && pair.caveat.length);
  }
});
