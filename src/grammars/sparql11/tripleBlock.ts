import { DataFactory } from 'rdf-data-factory';
import * as l from '../../lexer/index';
import type { RuleDef } from '../buildExample';
import type { BgpPattern, IriTerm, PropertyPath, Term, Triple, VariableTerm } from '../sparqlJSTypes';
import { propertyListNotEmpty, var_, varOrTerm } from './general';
import { path } from './propertyPaths';

const factory = new DataFactory();
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

/**
 * [[55]](https://www.w3.org/TR/sparql11-query/#rTriplesBlock)
 */
export const triplesBlock: RuleDef<'triplesBlock', BgpPattern> = {
  name: 'triplesBlock',
  impl: ({ SUBRULE, CONSUME, OPTION1, OPTION2 }) => () => {
    const triples = SUBRULE(triplesSameSubjectPath);
    const pattern = OPTION1(() => {
      CONSUME(l.symbols.dot);
      return OPTION2(() => SUBRULE(triplesBlock));
    });
    return {
      type: 'bgp',
      triples: [ ...triples, ...(pattern?.triples ?? []) ],
    };
  },
};

/**
 * [[81]](https://www.w3.org/TR/sparql11-query/#rTriplesSameSubjectPath)
 */
export const triplesSameSubjectPath: RuleDef<'triplesSameSubjectPath', Triple[]> = {
  name: 'triplesSameSubjectPath',
  impl: ({ SUBRULE, OR }) => () => OR<Triple[]>([
    { ALT: () => {
      const subject = SUBRULE(varOrTerm);
      const { partialTriples, additionalTriples } = SUBRULE(propertyListPathNotEmpty);

      return [
        ...additionalTriples,
        ...partialTriples.map(({ predicate, object }) => ({
          subject,
          predicate,
          object,
        })),
      ];
    } },
    { ALT: () => {
      const { object: subject, additionalTriples: triples1 } = SUBRULE(triplesNode, { allowPaths: true });
      const { partialTriples, additionalTriples: triples2 } = SUBRULE(propertyListPath);
      return [
        ...triples1,
        ...triples2,
        ...partialTriples.map(({ predicate, object }) => ({
          subject,
          predicate,
          object,
        })),
      ];
    } },
  ]),
};

/**
 * [[82]](https://www.w3.org/TR/sparql11-query/#rPropertyListPath)
 */
export const propertyListPath: RuleDef<'propertyListPath', IPropertyListPathNotEmpty> = {
  name: 'propertyListPath',
  impl: ({ SUBRULE, OPTION }) => () => {
    const partials = OPTION(() => SUBRULE(propertyListPathNotEmpty));
    return partials ?? {
      additionalTriples: [],
      partialTriples: [],
    };
  },
};

/**
 * [[83]](https://www.w3.org/TR/sparql11-query/#rPropertyListPathNotEmpty)
 */
export interface IPropertyListPathNotEmpty {
  partialTriples: Pick<Triple, 'predicate' | 'object'>[];
  additionalTriples: Triple[];
}

export const propertyListPathNotEmpty: RuleDef<'propertyListPathNotEmpty', IPropertyListPathNotEmpty> = {
  name: 'propertyListPathNotEmpty',
  impl: ({ SUBRULE, CONSUME, MANY, SUBRULE1, SUBRULE2, OPTION, OR1, OR2 }) => () => {
    const tripleConstructor: { predicate: Triple['predicate']; objects: IObjectList }[] = [];

    const firstProperty = OR1<IriTerm | VariableTerm | PropertyPath>([
      { ALT: () => SUBRULE1(verbPath) },
      { ALT: () => SUBRULE1(verbSimple) },
    ]);
    const firstObjects = SUBRULE(objectList, { allowPaths: true });
    tripleConstructor.push({ predicate: firstProperty, objects: firstObjects });

    MANY(() => {
      CONSUME(l.symbols.semi);
      OPTION(() => {
        const predicate = OR2<IriTerm | VariableTerm | PropertyPath>([
          { ALT: () => SUBRULE2(verbPath) },
          { ALT: () => SUBRULE2(verbSimple) },
        ]);

        const objects = SUBRULE(objectList, { allowPaths: false });
        tripleConstructor.push({ predicate, objects });
      });
    });

    // Extract all partial triples
    const partialTriples: IPropertyListPathNotEmpty['partialTriples'] = [];
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
  },
};

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
export interface IObjectList {
  objects: Term[];
  additionalTriples: Triple[];
}

export const objectList: RuleDef<'objectList', IObjectList, [BlankNodePropertyListArgs]> = {
  name: 'objectList',
  impl: ({ SUBRULE1, AT_LEAST_ONE_SEP }) => (...args) => {
    const objects: Term[] = [];
    const moreTriples: Triple[][] = [];
    AT_LEAST_ONE_SEP({
      DEF: () => {
        const { object: objectVal, additionalTriples } = SUBRULE1(object, ...args);
        objects.push(objectVal);
        moreTriples.push(additionalTriples);
      },
      SEP: l.symbols.comma,
    });
    return {
      objects,
      additionalTriples: moreTriples.flat(1),
    };
  },
};

/**
 * [[80]](https://www.w3.org/TR/sparql11-query/#rObject)
 * [[87]](https://www.w3.org/TR/sparql11-query/#rObjectPath)
 */
interface IObject {
  object: Term;
  additionalTriples: Triple[];
}
export const object: RuleDef<'object', IObject, [BlankNodePropertyListArgs]> = {
  name: 'object',
  impl: ({ SUBRULE }) => (...args) => SUBRULE(graphNode, ...args),
};

/**
 * [[98]](https://www.w3.org/TR/sparql11-query/#rTriplesNode)
 * [[100]](https://www.w3.org/TR/sparql11-query/#rTriplesNodePath)
 */
export const triplesNode: RuleDef<'triplesNode', IObject, [BlankNodePropertyListArgs]> = {
  name: 'triplesNode',
  impl: ({ SUBRULE, OR }) => (...args) => OR<IObject>([
    { ALT: () => SUBRULE(collection, ...args) },
    { ALT: () => SUBRULE(blankNodePropertyList, ...args) },
  ]),
};

/**
 * [[103]](https://www.w3.org/TR/sparql11-query/#rGraphNode)
 * [[101]](https://www.w3.org/TR/sparql11-query/#rBlankNodePropertyListPath)
 */
export interface BlankNodePropertyListArgs {
  allowPaths: boolean;
}

export const blankNodePropertyList: RuleDef<'blankNodePropertyList', IObject, [BlankNodePropertyListArgs]> = {
  name: 'blankNodePropertyList',
  impl: ({ SUBRULE, CONSUME }) => (arg) => {
    CONSUME(l.symbols.LSquare);
    const { additionalTriples, partialTriples } = SUBRULE(
      arg.allowPaths ? propertyListPathNotEmpty : propertyListNotEmpty,
    );
    CONSUME(l.symbols.RSquare);

    const subject = factory.blankNode();
    return {
      object: subject,
      additionalTriples: [
        ...additionalTriples,
        ...partialTriples.map(({ predicate, object }) => ({
          subject,
          predicate,
          object,
        })),
      ],
    };
  },
};

/**
 * [[102]](https://www.w3.org/TR/sparql11-query/#rCollection)
 * [[103]](https://www.w3.org/TR/sparql11-query/#rCollectionPath)
 */
export const collection: RuleDef<'collection', IObject, [BlankNodePropertyListArgs]> = {
  name: 'collection',
  impl: ({ AT_LEAST_ONE, SUBRULE, CONSUME }) => (...args) => {
    // Construct a [cons list](https://en.wikipedia.org/wiki/Cons#Lists),
    // here called a [RDF collection](https://www.w3.org/TR/sparql11-query/#collections).
    const terms: IObject[] = [];
    CONSUME(l.symbols.LParen);
    AT_LEAST_ONE(() => {
      terms.push(SUBRULE(graphNode, ...args));
    });
    CONSUME(l.symbols.RParen);

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
  },
};

/**
 * [[103]](https://www.w3.org/TR/sparql11-query/#rGraphNode)
 * [[105]](https://www.w3.org/TR/sparql11-query/#rGraphNodePath)
 */
export const graphNode: RuleDef<'graphNode', IObject, [BlankNodePropertyListArgs]> = {
  name: 'graphNode',
  impl: ({ SUBRULE, OR }) => (...args) => OR<IObject>([
    { ALT: () => {
      const val = SUBRULE(varOrTerm);
      return {
        object: val,
        additionalTriples: [],
      };
    } },
    { ALT: () => SUBRULE(triplesNode, ...args) },
  ]),
};
