import { DataFactory } from 'rdf-data-factory';
import * as l from '../../lexer/sparql11/index';
import type { RuleDef } from '../parserBuilder';
import type { BgpPattern, IriTerm, PropertyPath, Term, Triple, VariableTerm } from '../sparqlJSTypes';
import { var_, varOrTerm, verb } from './general';
import { path } from './propertyPaths';

const factory = new DataFactory();
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

          return ACTION(() => [
            ...propNotEmpty.additionalTriples,
            ...propNotEmpty.partialTriples.map(({ predicate, object }) => ({
              subject,
              predicate,
              object,
            })),
          ]);
        },
      },
      {
        ALT: () => {
          const subjectNode = SUBRULE(allowPaths ? triplesNodePath : triplesNode);
          const restNode = SUBRULE(allowPaths ? propertyListPath : propertyList);
          return ACTION(() => [
            ...subjectNode.additionalTriples,
            ...restNode.additionalTriples,
            ...restNode.partialTriples.map(({ predicate, object }) => ({
              subject: subjectNode.object,
              predicate,
              object,
            })),
          ]);
        },
      },
    ]),
  };
}
export const triplesSameSubject = triplesSameSubjectImpl('triplesSameSubject', false);
export const triplesSameSubjectPath = triplesSameSubjectImpl('triplesSameSubjectPath', true);

/**
 * [[76]](https://www.w3.org/TR/sparql11-query/#rPropertyList)
 * [[82]](https://www.w3.org/TR/sparql11-query/#rPropertyListPath)
 */
function propertyListImpl<T extends string>(name: T, allowPaths: boolean): RuleDef<T, IPropertyListNotEmpty> {
  return {
    name,
    impl: ({ SUBRULE, OPTION }) => () => {
      const partials = OPTION(() => SUBRULE(allowPaths ? propertyListPathNotEmpty : propertyListNotEmpty));
      return partials ?? {
        additionalTriples: [],
        partialTriples: [],
      };
    },
  };
}
export const propertyList = propertyListImpl('propertyList', false);
export const propertyListPath = propertyListImpl('propertyListPath', true);

export interface IPropertyListNotEmpty {
  partialTriples: Pick<Triple, 'predicate' | 'object'>[];
  additionalTriples: Triple[];
}

// We could use gates for this, but in that case,
// a grammar not in need of paths would still have to include the path rules
/**
 * [[77]](https://www.w3.org/TR/sparql11-query/#rPropertyListNotEmpty)
 * [[83]](https://www.w3.org/TR/sparql11-query/#rPropertyListPathNotEmpty)
 */
function propertyListNotEmptyImplementation<T extends string>(
  name: T,
  allowPaths: boolean,
): RuleDef<T, IPropertyListNotEmpty> {
  return {
    name,
    impl: ({ ACTION, CONSUME, MANY, SUBRULE1, SUBRULE2, OPTION, OR1, OR2 }) => () => {
      const tripleConstructor: { predicate: Triple['predicate']; objects: IObjectList }[] = [];

      const firstProperty = allowPaths ?
        OR1<IriTerm | VariableTerm | PropertyPath>([
          { ALT: () => SUBRULE1(verbPath) },
          { ALT: () => SUBRULE1(verbSimple) },
        ]) :
        SUBRULE1(verb);

      const firstObjects = SUBRULE1(allowPaths ? objectListPath : objectList);
      tripleConstructor.push({ predicate: firstProperty, objects: firstObjects });

      MANY(() => {
        CONSUME(l.symbols.semi);
        OPTION(() => {
          const predicate = allowPaths ?
            OR2<IriTerm | VariableTerm | PropertyPath>([
              { ALT: () => SUBRULE2(verbPath) },
              { ALT: () => SUBRULE2(verbSimple) },
            ]) :
            SUBRULE2(verb);
          const objects = SUBRULE2(allowPaths ? objectListPath : objectList);
          tripleConstructor.push({ predicate, objects });
        });
      });

      return ACTION(() => {
        // Extract all partial triples
        const partialTriples: IPropertyListNotEmpty['partialTriples'] = [];
        const additionalTriples: Triple[] = [];

        for (const { predicate, objects } of tripleConstructor) {
          const { objects: innerObject, additionalTriples: innerAdditionalTriples } = objects;
          additionalTriples.push(...innerAdditionalTriples);
          partialTriples.push(
            ...innerObject.map(object => ({
              predicate,
              object,
            })),
          );
        }
        return {
          partialTriples,
          additionalTriples,
        };
      });
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

export interface IObjectList {
  objects: Term[];
  additionalTriples: Triple[];
}

/**
 * [[79]](https://www.w3.org/TR/sparql11-query/#rObjectList)
 * [[86]](https://www.w3.org/TR/sparql11-query/#rObjectListPath)
 */
function objectListImpl<T extends string>(name: T, allowPaths: boolean): RuleDef<T, IObjectList> {
  return {
    name,
    impl: ({ ACTION, SUBRULE, AT_LEAST_ONE_SEP }) => () => {
      const objects: Term[] = [];
      const moreTriples: Triple[][] = [];
      AT_LEAST_ONE_SEP({
        DEF: () => {
          const objectVal = SUBRULE(allowPaths ? objectPath : object);
          ACTION(() => {
            objects.push(objectVal.object);
            moreTriples.push(objectVal.additionalTriples);
          });
        },
        SEP: l.symbols.comma,
      });
      return {
        objects,
        additionalTriples: moreTriples.flat(1),
      };
    },
  };
}
export const objectList = objectListImpl('objectList', false);
export const objectListPath = objectListImpl('objectListPath', true);

interface IObject {
  object: Term;
  additionalTriples: Triple[];
}
/**
 * [[80]](https://www.w3.org/TR/sparql11-query/#rObject)
 * [[87]](https://www.w3.org/TR/sparql11-query/#rObjectPath)
 */
export const object: RuleDef<'object', IObject> = {
  name: 'object',
  impl: ({ SUBRULE }) => () => SUBRULE(graphNode),
};
export const objectPath: RuleDef<'objectPath', IObject> = {
  name: 'objectPath',
  impl: ({ SUBRULE }) => () => SUBRULE(graphNodePath),
};

/**
 * [[98]](https://www.w3.org/TR/sparql11-query/#rTriplesNode)
 * [[100]](https://www.w3.org/TR/sparql11-query/#rTriplesNodePath)
 */
export const triplesNode: RuleDef<'triplesNode', IObject> = {
  name: 'triplesNode',
  impl: ({ SUBRULE, OR }) => () => OR<IObject>([
    { ALT: () => SUBRULE(collection) },
    { ALT: () => SUBRULE(blankNodePropertyList) },
  ]),
};
export const triplesNodePath: RuleDef<'triplesNodePath', IObject> = {
  name: 'triplesNodePath',
  impl: ({ SUBRULE, OR }) => () => OR<IObject>([
    { ALT: () => SUBRULE(collectionPath) },
    { ALT: () => SUBRULE(blankNodePropertyListPath) },
  ]),
};

/**
 * [[99]](https://www.w3.org/TR/sparql11-query/#rBlankNodePropertyList)
 * [[101]](https://www.w3.org/TR/sparql11-query/#rBlankNodePropertyListPath)
 */
function blankNodePropertyListImpl<T extends string>(name: T, allowPaths: boolean): RuleDef<T, IObject> {
  return {
    name,
    impl: ({ ACTION, SUBRULE, CONSUME }) => () => {
      CONSUME(l.symbols.LSquare);
      const propList = SUBRULE(allowPaths ? propertyListPathNotEmpty : propertyListNotEmpty);
      CONSUME(l.symbols.RSquare);

      const subject = factory.blankNode();
      return ACTION(() => ({
        object: subject,
        additionalTriples: [
          ...propList.additionalTriples,
          ...propList.partialTriples.map(({ predicate, object }) => ({
            subject,
            predicate,
            object,
          })),
        ],
      }));
    },
  };
}
export const blankNodePropertyList = blankNodePropertyListImpl('blankNodePropertyList', false);
export const blankNodePropertyListPath = blankNodePropertyListImpl('blankNodePropertyListPath', true);

/**
 * [[102]](https://www.w3.org/TR/sparql11-query/#rCollection)
 * [[103]](https://www.w3.org/TR/sparql11-query/#rCollectionPath)
 */
function collectionImpl<T extends string>(name: T, allowPaths: boolean): RuleDef<T, IObject> {
  return {
    name,
    impl: ({ ACTION, AT_LEAST_ONE, SUBRULE, CONSUME }) => () => {
      // Construct a [cons list](https://en.wikipedia.org/wiki/Cons#Lists),
      // here called a [RDF collection](https://www.w3.org/TR/sparql11-query/#collections).
      const terms: IObject[] = [];
      CONSUME(l.symbols.LParen);
      AT_LEAST_ONE(() => {
        terms.push(SUBRULE(allowPaths ? graphNodePath : graphNode));
      });
      CONSUME(l.symbols.RParen);

      return ACTION(() => {
        const additionalTriples: Triple[] = terms.flatMap(x => x.additionalTriples);
        const listHead = factory.blankNode();
        let iterHead = listHead;
        for (const [ index, term ] of terms.entries()) {
          const linkTriple: Triple = {
            subject: iterHead,
            predicate: factory.namedNode(`${RDF}first`),
            object: term.object,
          };
          additionalTriples.push(linkTriple);

          // If not the last, create new iterHead, otherwise, close list
          if (index === terms.length - 1) {
            const nilTriple: Triple = {
              subject: iterHead,
              predicate: factory.namedNode(`${RDF}rest`),
              object: factory.namedNode(`${RDF}nil`),
            };
            additionalTriples.push(nilTriple);
          } else {
            const tail = factory.blankNode();
            const linkTriple: Triple = {
              subject: iterHead,
              predicate: factory.namedNode(`${RDF}rest`),
              object: tail,
            };
            iterHead = tail;
            additionalTriples.push(linkTriple);
          }
        }

        return {
          object: listHead,
          additionalTriples,
        };
      });
    },
  };
}
export const collection = collectionImpl('collection', false);
export const collectionPath = collectionImpl('collectionPath', true);

/**
 * [[103]](https://www.w3.org/TR/sparql11-query/#rGraphNode)
 * [[105]](https://www.w3.org/TR/sparql11-query/#rGraphNodePath)
 */
function graphNodeImpl<T extends string>(name: T, allowPaths: boolean): RuleDef<T, IObject> {
  return {
    name,
    impl: ({ SUBRULE, OR }) => () => OR<IObject>([
      {
        ALT: () => {
          const val = SUBRULE(varOrTerm);
          return {
            object: val,
            additionalTriples: [],
          };
        },
      },
      { ALT: () => SUBRULE(allowPaths ? triplesNodePath : triplesNode) },
    ]),
  };
}
export const graphNode = graphNodeImpl('graphNode', false);
export const graphNodePath = graphNodeImpl('graphNodePath', true);
