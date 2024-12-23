import type * as RdfJs from '@rdfjs/types';
import type * as S11 from '../sparql11/Sparql11types';

export type BaseQuadTerm = RdfJs.BaseQuad;
export type GraphTerm = S11.GraphTerm | BaseQuadTerm;
export type Term = S11.Term | BaseQuadTerm;
export type Expression = S11.Expression | BaseQuadTerm;
