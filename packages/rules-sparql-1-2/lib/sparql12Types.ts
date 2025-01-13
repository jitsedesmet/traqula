import type * as RdfJs from '@rdfjs/types';
import type * as T11 from '@traqula/rules-sparql-1-1';

export type BaseQuadTerm = RdfJs.BaseQuad;
export type GraphTerm = T11.GraphTerm | BaseQuadTerm;
export type Term = T11.Term | BaseQuadTerm;
export type Expression = T11.Expression | BaseQuadTerm;

export type Triple = {
  subject: Term;
  predicate: T11.IriTerm | T11.VariableTerm | T11.PropertyPath;
  object: Term;
};

/**
 * OVERRIDES: {@link T11.TripleCreatorS}
 */
export type TripleCreatorS = (part: Pick<Triple, 'subject'>) => Triple;
/**
 * OVERRIDES: {@link T11.TripleCreatorSP}
 */
export type TripleCreatorSP = (part: Pick<Triple, 'subject' | 'predicate'>) => Triple;

/**
 * OVERRIDES: {@link T11.ITriplesNode}
 */
export interface ITriplesNode {
  node: T11.IriTerm | T11.BlankTerm;
  triples: Triple[];
}

/**
 * OVERRIDES: {@link T11.IGraphNode}
 */
export interface IGraphNode {
  node: ITriplesNode['node'] | Term;
  triples: Triple[];
}
