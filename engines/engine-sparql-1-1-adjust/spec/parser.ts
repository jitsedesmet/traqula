import { ErrorSkipped, } from 'rdf-test-suite';
import { Sparql11AdjustParser } from '../lib'

export async function parse(query: string, baseIRI: string) {
  const parser = new Sparql11AdjustParser({ baseIRI });
  parser.parse(query);
}
export function query() {
  return Promise.reject(new ErrorSkipped('Querying is not supported'));
}

export function update() {
  return Promise.reject(new ErrorSkipped('Updating is not supported'));
}
