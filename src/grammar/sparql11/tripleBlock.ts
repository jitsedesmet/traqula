import type { BlankNode } from 'rdf-data-factory';
import * as l from '../../lexer/sparql11/index.js';
import type { RuleDef } from '../parserBuilder.js';
import type { BgpPattern, IriTerm, PropertyPath, Term, Triple, VariableTerm } from '../sparqlJSTypes.js';
import { var_, varOrTerm, verb } from './general.js';
import { path } from './propertyPaths.js';

const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

/**
 * [[55]](https://www.w3.org/TR/sparql11-query/#rTriplesBlock)
 */
export const triplesBlock: RuleDef<'triplesBlock', BgpPattern> = {
  name: 'triplesBlock',
  impl: ({ ACTION, SUBRULE, CONSUME, OPTION1, OPTION2 }) => () => {
    const triples = SUBRULE(triplesSameSubjectPath);
    const pattern = OPTION1(() => {
      CONSUME(l.symbols.dot);
      return OPTION2(() => SUBRULE(triplesBlock));
    });
    return ACTION(() => ({
      type: 'bgp',
      triples: [ ...triples, ...(pattern?.triples ?? []) ],
    }));
  },
};

/**
 * [[75]](https://www.w3.org/TR/sparql11-query/#rTriplesSameSubject)
 * [[81]](https://www.w3.org/TR/sparql11-query/#rTriplesSameSubjectPath)
 */
function triplesSameSubjectImpl<T extends string>(name: T, allowPaths: boolean): RuleDef<T, Triple[]> {
  return {
    name,
    impl: ({ ACTION, SUBRULE, OR }) => () => OR<Triple[]>([
      {
        ALT: () => {
          const subject = SUBRULE(varOrTerm);
          const propNotEmpty = SUBRULE(allowPaths ? propertyListPathNotEmpty : propertyListNotEmpty);

          return ACTION(() =>
            propNotEmpty.map(partial => partial({ subject })));
        },
      },
      {
        ALT: () => {
          const subjectNode = SUBRULE(allowPaths ? triplesNodePath : triplesNode);
          const restNode = SUBRULE(allowPaths ? propertyListPath : propertyList);
          return ACTION(() => [
            ...restNode.map(partial => partial({ subject: subjectNode.node })),
            ...subjectNode.triples,
          ]);
        },
      },
    ]),
  };
}
export const triplesSameSubject = triplesSameSubjectImpl('triplesSameSubject', false);
export const triplesSameSubjectPath = triplesSameSubjectImpl('triplesSameSubjectPath', true);

type TripleCreatorS = (part: Pick<Triple, 'subject'>) => Triple;
type TripleCreatorSP = (part: Pick<Triple, 'subject' | 'predicate'>) => Triple;

/**
 * [[76]](https://www.w3.org/TR/sparql11-query/#rPropertyList)
 * [[82]](https://www.w3.org/TR/sparql11-query/#rPropertyListPath)
 */
function propertyListImpl<T extends string>(name: T, allowPaths: boolean): RuleDef<T, TripleCreatorS[]> {
  return {
    name,
    impl: ({ SUBRULE, OPTION }) => () =>
      OPTION(() => SUBRULE(allowPaths ? propertyListPathNotEmpty : propertyListNotEmpty)) ?? [],
  };
}
export const propertyList = propertyListImpl('propertyList', false);
export const propertyListPath = propertyListImpl('propertyListPath', true);

// We could use gates for this, but in that case,
// a grammar not in need of paths would still have to include the path rules
/**
 * [[77]](https://www.w3.org/TR/sparql11-query/#rPropertyListNotEmpty)
 * [[83]](https://www.w3.org/TR/sparql11-query/#rPropertyListPathNotEmpty)
 */
function propertyListNotEmptyImplementation<T extends string>(
  name: T,
  allowPaths: boolean,
): RuleDef<T, TripleCreatorS[]> {
  return {
    name,
    impl: ({ ACTION, CONSUME, MANY, SUBRULE1, SUBRULE2, OPTION, OR1, OR2, context: { dataFactory }}) => () => {
      const result: TripleCreatorS[] = [];
      const resultAppendage: typeof result = [];

      // Generates predicate and objectList
      const firstProperty = allowPaths ?
        OR1<IriTerm | VariableTerm | PropertyPath>([
          { ALT: () => SUBRULE1(verbPath) },
          { ALT: () => SUBRULE1(verbSimple) },
        ]) :
        SUBRULE1(verb);
      const firstObjects = SUBRULE1(allowPaths ? objectListPath : objectList);
      ACTION(() => {
        // TODO: this filter is only here to be compliant with sparqlJS and is quite arbitrary.
        //   For the first predicate,
        //   additionally generated triples (like from collections) are shoved to the back of the result.
        const filterSubject = dataFactory.namedNode('internal:filterSubject');
        for (const cObject of firstObjects) {
          const triple = cObject({ subject: filterSubject, predicate: firstProperty });
          const generator: TripleCreatorS = rest => cObject({ ...rest, predicate: firstProperty });
          if (triple.subject === filterSubject) {
            result.push(generator);
          } else {
            resultAppendage.push(generator);
          }
        }
      });

      MANY(() => {
        CONSUME(l.symbols.semi);
        OPTION(() => {
          const predicate = allowPaths ?
            OR2<IriTerm | VariableTerm | PropertyPath>([
              { ALT: () => SUBRULE2(verbPath) },
              { ALT: () => SUBRULE2(verbSimple) },
            ]) :
            SUBRULE2(verb);
          // https://www.w3.org/2013/sparql-errata#errata-query-3
          const objects = SUBRULE2(allowPaths ? objectListPath : objectList);

          ACTION(() => {
            result.push(
              ...objects
                .map(object => (partS: Pick<Triple, 'subject'>) => object({ ...partS, predicate })),
            );
          });
        });
      });
      return [ ...result, ...resultAppendage ];
    },
  };
}
export const propertyListNotEmpty = propertyListNotEmptyImplementation('propertyListNotEmpty', false);
export const propertyListPathNotEmpty = propertyListNotEmptyImplementation('propertyListPathNotEmpty', true);

/**
 * [[84]](https://www.w3.org/TR/sparql11-query/#rVerbPath)
 */
export const verbPath: RuleDef<'verbPath', PropertyPath | IriTerm> = {
  name: 'verbPath',
  impl: ({ SUBRULE }) => () => SUBRULE(path),
};

/**
 * [[85]](https://www.w3.org/TR/sparql11-query/#rVerbSimple)
 */
export const verbSimple: RuleDef<'verbSimple', VariableTerm> = {
  name: 'verbSimple',
  impl: ({ SUBRULE }) => () => SUBRULE(var_),
};

/**
 * [[79]](https://www.w3.org/TR/sparql11-query/#rObjectList)
 * [[86]](https://www.w3.org/TR/sparql11-query/#rObjectListPath)
 */
function objectListImpl<T extends string>(name: T, allowPaths: boolean): RuleDef<T, TripleCreatorSP[]> {
  return {
    name,
    impl: ({ ACTION, SUBRULE, AT_LEAST_ONE_SEP }) => () => {
      const objects: TripleCreatorSP[] = [];
      AT_LEAST_ONE_SEP({
        DEF: () => {
          const node = SUBRULE(allowPaths ? objectPath : object);
          ACTION(() => {
            const nodeHandler: TripleCreatorSP = part => ({ ...part, object: node.node });
            objects.push(
              nodeHandler,
              ...node.triples.map(val => () => val),
            );
          });
        },
        SEP: l.symbols.comma,
      });
      return objects;
    },
  };
}
export const objectList = objectListImpl('objectList', false);
export const objectListPath = objectListImpl('objectListPath', true);

/**
 * [[80]](https://www.w3.org/TR/sparql11-query/#rObject)
 * [[87]](https://www.w3.org/TR/sparql11-query/#rObjectPath)
 */
export const object: RuleDef<'object', IGraphNode> = {
  name: 'object',
  impl: ({ SUBRULE }) => () => SUBRULE(graphNode),
};
export const objectPath: RuleDef<'objectPath', IGraphNode> = {
  name: 'objectPath',
  impl: ({ SUBRULE }) => () => SUBRULE(graphNodePath),
};

export interface ITriplesNode {
  node: IriTerm | BlankNode;
  triples: Triple[];
}

/**
 * [[98]](https://www.w3.org/TR/sparql11-query/#rTriplesNode)
 * [[100]](https://www.w3.org/TR/sparql11-query/#rTriplesNodePath)
 */
export const triplesNode: RuleDef<'triplesNode', ITriplesNode> = {
  name: 'triplesNode',
  impl: ({ SUBRULE, OR }) => () => OR<ITriplesNode>([
    { ALT: () => SUBRULE(collection) },
    { ALT: () => SUBRULE(blankNodePropertyList) },
  ]),
};
export const triplesNodePath: RuleDef<'triplesNodePath', ITriplesNode> = {
  name: 'triplesNodePath',
  impl: ({ SUBRULE, OR }) => () => OR<ITriplesNode>([
    { ALT: () => SUBRULE(collectionPath) },
    { ALT: () => SUBRULE(blankNodePropertyListPath) },
  ]),
};

/**
 * [[99]](https://www.w3.org/TR/sparql11-query/#rBlankNodePropertyList)
 * [[101]](https://www.w3.org/TR/sparql11-query/#rBlankNodePropertyListPath)
 */
function blankNodePropertyListImpl<T extends string>(name: T, allowPaths: boolean): RuleDef<T, ITriplesNode> {
  return {
    name,
    impl: ({ ACTION, SUBRULE, CONSUME, context: { dataFactory }}) => () => {
      CONSUME(l.symbols.LSquare);
      const propList = SUBRULE(allowPaths ? propertyListPathNotEmpty : propertyListNotEmpty);
      CONSUME(l.symbols.RSquare);

      return ACTION(() => {
        const subject = dataFactory.blankNode();
        return {
          node: subject,
          triples: propList.map(part => part({ subject })),
        };
      });
    },
  };
}
export const blankNodePropertyList = blankNodePropertyListImpl('blankNodePropertyList', false);
export const blankNodePropertyListPath = blankNodePropertyListImpl('blankNodePropertyListPath', true);

/**
 * [[102]](https://www.w3.org/TR/sparql11-query/#rCollection)
 * [[103]](https://www.w3.org/TR/sparql11-query/#rCollectionPath)
 */
function collectionImpl<T extends string>(name: T, allowPaths: boolean): RuleDef<T, ITriplesNode> {
  return {
    name,
    impl: ({ ACTION, AT_LEAST_ONE, SUBRULE, CONSUME, context: { dataFactory }}) => () => {
      // Construct a [cons list](https://en.wikipedia.org/wiki/Cons#Lists),
      // here called a [RDF collection](https://www.w3.org/TR/sparql11-query/#collections).
      const terms: IGraphNode[] = [];
      CONSUME(l.symbols.LParen);
      AT_LEAST_ONE(() => {
        terms.push(SUBRULE(allowPaths ? graphNodePath : graphNode));
      });
      CONSUME(l.symbols.RParen);

      return ACTION(() => {
        const triples: Triple[] = [];
        const appendTriples: Triple[] = [];

        const listHead = dataFactory.blankNode();
        let iterHead = listHead;
        const predFirst = dataFactory.namedNode(`${RDF}first`);
        const predRest = dataFactory.namedNode(`${RDF}rest`);
        for (const [ index, term ] of terms.entries()) {
          const headTriple: Triple = {
            subject: iterHead,
            predicate: predFirst,
            object: term.node,
          };
          triples.push(headTriple);
          appendTriples.push(...term.triples);

          // If not the last, create new iterHead, otherwise, close list
          if (index === terms.length - 1) {
            const nilTriple: Triple = {
              subject: iterHead,
              predicate: predRest,
              object: dataFactory.namedNode(`${RDF}nil`),
            };
            triples.push(nilTriple);
          } else {
            const tail = dataFactory.blankNode();
            const linkTriple: Triple = {
              subject: iterHead,
              predicate: predRest,
              object: tail,
            };
            triples.push(linkTriple);
            iterHead = tail;
          }
        }
        return {
          node: listHead,
          triples: [ ...triples, ...appendTriples ],
        };
      });
    },
  };
}
export const collection = collectionImpl('collection', false);
export const collectionPath = collectionImpl('collectionPath', true);

export interface IGraphNode {
  node: ITriplesNode['node'] | Term;
  triples: Triple[];
}
/**
 * [[103]](https://www.w3.org/TR/sparql11-query/#rGraphNode)
 * [[105]](https://www.w3.org/TR/sparql11-query/#rGraphNodePath)
 */
function graphNodeImpl<T extends string>(name: T, allowPaths: boolean): RuleDef<T, IGraphNode> {
  return {
    name,
    impl: ({ SUBRULE, OR }) => () => OR<IGraphNode>([
      {
        ALT: () => {
          const val = SUBRULE(varOrTerm);
          return {
            node: val,
            triples: [],
          };
        },
      },
      { ALT: () => SUBRULE(allowPaths ? triplesNodePath : triplesNode) },
    ]),
  };
}
export const graphNode = graphNodeImpl('graphNode', false);
export const graphNodePath = graphNodeImpl('graphNodePath', true);
