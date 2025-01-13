/**
 * This module will define patch rules that should be used in combination with the sparql11 grammar to create
 * a sparql12 grammar.
 * Rules in this module redefine the return type of core grammar rules.
 * It is therefore essential that the parser retypes the rules from the core grammar.
 */

import type { DirectionalLanguage } from '@rdfjs/types';
import type { NamedNode } from 'rdf-data-factory';
import * as l12 from './lexer';
import type { RuleDefReturn, RuleDef } from '@traqula/core';
import { funcExpr1, funcExpr3 } from '@traqula/rules-sparql-1-1';
import { gram as S11, lex as l11 } from '@traqula/rules-sparql-1-1';
import type * as T11 from '@traqula/rules-sparql-1-1';
import { CommonIRIs } from '@traqula/core';
import type {
  BaseQuadTerm,
  Expression,
  IGraphNode,
  Term,
  Triple,
  TripleCreatorS,
  TripleCreatorSP,
} from './sparql12Types';

export const canParseReifier = Symbol('canParseReifier');

function reifiedTripleBlockImpl<T extends string>(name: T, allowPath: boolean): RuleDef<T, Triple[]> {
  return <const> {
    name,
    impl: ({ ACTION, SUBRULE }) => () => {
      const triple = SUBRULE(reifiedTriple);
      const properties = SUBRULE(allowPath ? S11.propertyListPath : S11.propertyList);

      return ACTION(() => [
        ...triple.triples,
        ...properties.map(partial => partial({ subject: triple.node })),
      ]);
    },
  };
}
/**
 * [[56]](https://www.w3.org/TR/sparql12-query/#rReifiedTripleBlock) Used by triplesSameSubject
 */
export const reifiedTripleBlock = reifiedTripleBlockImpl('reifiedTripleBlock', false);
/**
 * [[57]](https://www.w3.org/TR/sparql12-query/#rReifiedTripleBlockPath) Used by TriplesSameSubjectPath
 */
export const reifiedTripleBlockPath = reifiedTripleBlockImpl('reifiedTripleBlockPath', true);

/**
 * OVERRIDING RULE: {@link S11.dataBlockValue}.
 * [[67]](https://www.w3.org/TR/sparql12-query/#rDataBlockValue)
 */
export const dataBlockValue:
RuleDef<'dataBlockValue', RuleDefReturn<typeof S11.dataBlockValue> | BaseQuadTerm> = <const> {
  name: 'dataBlockValue',
  impl: $ => () => $.OR2<RuleDefReturn<typeof S11.dataBlockValue> | BaseQuadTerm>([
    { ALT: () => S11.dataBlockValue.impl($)() },
    { ALT: () => $.SUBRULE(tripleTermData) },
  ]),
};

/**
 * [[68]](https://www.w3.org/TR/sparql12-query/#rReifier)
 */
export const reifier: RuleDef<'reifier', T11.VariableTerm | T11.IriTerm | T11.BlankTerm> = <const> {
  name: 'reifier',
  impl: ({ ACTION, CONSUME, SUBRULE, OPTION, context }) => () => {
    CONSUME(l12.tilde);
    const reifier = OPTION(() => SUBRULE(varOrReifierId));
    return ACTION(() => {
      if (!context.parseMode.has(canParseReifier)) {
        throw new Error('Reifiers are not allowed in this context');
      }
      return reifier ?? context.dataFactory.blankNode();
    });
  },
};

/**
 * [[68]](https://www.w3.org/TR/sparql12-query/#rVarOrReifierId)
 */
export const varOrReifierId: RuleDef<'varOrReifierId', T11.VariableTerm | T11.IriTerm | T11.BlankTerm> = <const> {
  name: 'varOrReifierId',
  impl: ({ SUBRULE, OR }) => () => OR<T11.VariableTerm | T11.IriTerm | T11.BlankTerm>([
    { ALT: () => SUBRULE(S11.var_) },
    { ALT: () => SUBRULE(S11.iri) },
    { ALT: () => SUBRULE(S11.blankNode) },
  ]),
};

function triplesSameSubjectImpl<T extends string>(name: T, allowPaths: boolean): RuleDef<T, Triple[]> {
  return <const> {
    name,
    impl: $ => () => $.OR2([
      { ALT: () => allowPaths ? S11.triplesSameSubjectPath.impl($)() : S11.triplesSameSubject.impl($)() },
      { ALT: () => $.SUBRULE(allowPaths ? reifiedTripleBlockPath : reifiedTripleBlock) },
    ]),
  };
}
/**
 * OVERRIDING RULE {@link S11.triplesSameSubject}
 * [[79]](https://www.w3.org/TR/sparql12-query/#rTriplesSameSubject)
 */
export const triplesSameSubject = triplesSameSubjectImpl('triplesSameSubject', false);
/**
 * OVERRIDING RULE {@link S11.triplesSameSubjectPath}
 * [[85]](https://www.w3.org/TR/sparql12-query/#rTriplesSameSubjectPath)
 */
export const triplesSameSubjectPath = triplesSameSubjectImpl('triplesSameSubjectPath', true);

function objectImpl<T extends string>(name: T, allowPaths: boolean): RuleDef<T, TripleCreatorSP[]> {
  return <const>{
    name,
    impl: ({ ACTION, SUBRULE, context }) => () => {
      const objectVal = SUBRULE(allowPaths ? graphNodePath : graphNode);
      const annotationVal = SUBRULE(allowPaths ? annotationPath : annotation);

      return ACTION(() => {
        const result: TripleCreatorSP[] = [
          // You parse the object
          ({ subject, predicate }) => ({ subject, predicate, object: objectVal.node }),
          // You might get some additional triples from parsing the object (like when it's a collection)
          ...objectVal.triples.map(triple => () => triple),
        ];
        for (const annotation of annotationVal) {
          result.push(({ subject, predicate }) => <Triple> context.dataFactory.quad(
            annotation.node,
            context.dataFactory.namedNode(CommonIRIs.REIFIES),
            context.dataFactory.quad(
              subject,
              <Exclude<typeof predicate, T11.PropertyPath>>predicate,
              objectVal.node,
            ),
          ));
          result.push(...annotation.triples.map(triple => () => triple));
        }
        return result;
      });
    },
  };
}
/**
 * OVERRIDING RULE: {@link S11.object}.
 * [[84]](https://www.w3.org/TR/sparql12-query/#rObject) Used by ObjectList
 */
export const object = objectImpl('object', false);
/**
 * OVERRIDING RULE: {@link S11.objectPath}.
 * [[91]](https://www.w3.org/TR/sparql12-query/#rTriplesSameSubjectPath) Used by ObjectListPath
 */
export const objectPath = objectImpl('objectPath', true);

function annotationImpl<T extends string>(name: T, allowPaths: boolean): RuleDef<T, IGraphNode[]> {
  return <const> {
    name,
    impl: ({ ACTION, SUBRULE, OR, MANY, context }) => () => {
      const annotations: IGraphNode[] = [];
      let currentReifier: T11.BlankTerm | T11.VariableTerm | T11.IriTerm | undefined;

      function flush(): void {
        if (currentReifier) {
          annotations.push({ node: currentReifier, triples: []});
          currentReifier = undefined;
        }
      }

      MANY(() => {
        OR([
          { ALT: () => {
            const node = SUBRULE(reifier);
            ACTION(() => flush());
            currentReifier = node;
          } },
          { ALT: () => {
            const block = SUBRULE(allowPaths ? annotationBlockPath : annotationBlock);

            ACTION(() => {
              const node = currentReifier ?? context.dataFactory.blankNode();
              annotations.push({
                node,
                triples: block.map(partial => partial({ subject: node })),
              });
              currentReifier = undefined;
            });
          } },
        ]);
      });
      return ACTION(() => {
        flush();
        return annotations;
      });
    },
  };
}
/**
 * [[107]](https://www.w3.org/TR/sparql12-query/#rAnnotationPath)
 */
export const annotationPath = annotationImpl('annotationPath', true);
/**
 * [[109]](https://www.w3.org/TR/sparql12-query/#rAnnotation)
 */
export const annotation = annotationImpl('annotation', false);

function annotationBlockImpl<T extends string>(name: T, allowPaths: boolean): RuleDef<T, TripleCreatorS[]> {
  return <const> {
    name,
    impl: ({ ACTION, SUBRULE, CONSUME, context }) => () => {
      CONSUME(l12.annotationOpen);
      const res = <TripleCreatorS[]> SUBRULE(allowPaths ? S11.propertyListPathNotEmpty : S11.propertyListNotEmpty);
      CONSUME(l12.annotationClose);

      return ACTION(() => {
        if (!context.parseMode.has(canParseReifier)) {
          throw new Error('Reifiers are not allowed in this context');
        }
        return res;
      });
    },
  };
}
/**
 * [[108]](https://www.w3.org/TR/sparql12-query/#rAnnotationBlockPath)
 */
export const annotationBlockPath = annotationBlockImpl('annotationBlockPath', true);
/**
 * [[110]](https://www.w3.org/TR/sparql12-query/#rAnnotationBlock)
 */
export const annotationBlock = annotationBlockImpl('annotationBlock', false);

/**
 * OVERRIDING RULE: {@link S11.graphNode}.
 * [[111]](https://www.w3.org/TR/sparql12-query/#rGraphNode)
 */
export const graphNode: RuleDef<'graphNode', IGraphNode> = <const> {
  name: 'graphNode',
  impl: $ => () => $.OR2 <IGraphNode>([
    { ALT: () => S11.graphNode.impl($)() },
    { ALT: () => $.SUBRULE(reifiedTriple) },
  ]),
};
/**
 * OVERRIDING RULE: {@link S11.graphNodePath}.
 * [[112]](https://www.w3.org/TR/sparql12-query/#rGraphNodePath)
 */
export const graphNodePath: RuleDef<'graphNodePath', IGraphNode> = <const> {
  name: 'graphNodePath',
  impl: $ => () => $.OR2<IGraphNode>([
    { ALT: () => S11.graphNodePath.impl($)() },
    { ALT: () => $.SUBRULE(reifiedTriple) },
  ]),
};

/**
 * OVERRIDING RULE: {@link S11.varOrTerm}.
 * [[113]](https://www.w3.org/TR/sparql12-query/#rVarOrTerm)
 */
export const varOrTerm: RuleDef<'varOrTerm', Term> = <const> {
  name: 'varOrTerm',
  impl: ({ SUBRULE, OR, CONSUME, context }) => () => OR<Term>([
    { ALT: () => SUBRULE(S11.var_) },
    { ALT: () => SUBRULE(S11.iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(S11.numericLiteral) },
    { ALT: () => SUBRULE(S11.booleanLiteral) },
    { ALT: () => SUBRULE(S11.blankNode) },
    { ALT: () => {
      CONSUME(l11.terminals.nil);
      return context.dataFactory.namedNode(CommonIRIs.NIL);
    } },
    { ALT: () => SUBRULE(tripleTerm) },
  ]),
};

/**
 * [[114]](https://www.w3.org/TR/sparql12-query/#rReifiedTriple)
 */
export const reifiedTriple:
RuleDef<'reifiedTriple', IGraphNode & { node: T11.BlankTerm | T11.VariableTerm | T11.IriTerm }> = <const> {
  name: 'reifiedTriple',
  impl: ({ ACTION, CONSUME, SUBRULE, OPTION, context }) => () => {
    CONSUME(l12.reificationOpen);
    const subject = SUBRULE(reifiedTripleSubject);
    const predicate = SUBRULE(S11.verb);
    const object = SUBRULE(reifiedTripleObject);
    const reifierVal = OPTION(() => SUBRULE(reifier));
    CONSUME(l12.reificationClose);

    return ACTION(() => {
      const reifier = reifierVal ?? context.dataFactory.blankNode();
      const tripleTerm = context.dataFactory.quad(subject.node, predicate, object.node);
      return {
        node: reifier,
        triples: [
          ...subject.triples,
          <Triple> context.dataFactory.quad(reifier, context.dataFactory.namedNode(CommonIRIs.REIFIES), tripleTerm),
          ...object.triples,
        ],
      };
    });
  },
};

/**
 * [[115]](https://www.w3.org/TR/sparql12-query/#rReifiedTripleSubject)
 */
export const reifiedTripleSubject:
RuleDef<'reifiedTripleSubject', IGraphNode> =
  <const> {
    name: 'reifiedTripleSubject',
    impl: ({ OR, SUBRULE }) => () => OR<IGraphNode>([
      { ALT: () => ({ node: SUBRULE(S11.var_), triples: []}) },
      { ALT: () => ({ node: SUBRULE(S11.iri), triples: []}) },
      { ALT: () => ({ node: SUBRULE(rdfLiteral), triples: []}) },
      { ALT: () => ({ node: SUBRULE(S11.numericLiteral), triples: []}) },
      { ALT: () => ({ node: SUBRULE(S11.booleanLiteral), triples: []}) },
      { ALT: () => ({ node: SUBRULE(S11.blankNode), triples: []}) },
      { ALT: () => SUBRULE(reifiedTriple) },
    ]),
  };

/**
 * [[116]](https://www.w3.org/TR/sparql12-query/#rReifiedTripleObject)
 */
export const reifiedTripleObject:
RuleDef<'reifiedTripleObject', RuleDefReturn<typeof reifiedTripleSubject>> =
  <const> {
    name: 'reifiedTripleObject',
    impl: $ => () => $.OR2([
      { ALT: () => reifiedTripleSubject.impl($)() },
      { ALT: () => ({ node: $.SUBRULE(tripleTerm), triples: []}) },
    ]),
  };

/**
 * [[117]](https://www.w3.org/TR/sparql12-query/#rTripleTerm)
 */
export const tripleTerm: RuleDef<'tripleTerm', BaseQuadTerm> = <const> {
  name: 'tripleTerm',
  impl: ({ CONSUME, SUBRULE, context }) => () => {
    CONSUME(l12.tripleTermOpen);
    const subject = SUBRULE(tripleTermSubject);
    const predicate = SUBRULE(S11.verb);
    const object = SUBRULE(tripleTermObject);
    CONSUME(l12.tripleTermClose);
    return context.dataFactory.quad(subject, predicate, object);
  },
};

/**
 * [[118]](https://www.w3.org/TR/sparql12-query/#rTripleTermSubject)
 */
export const tripleTermSubject:
RuleDef<'tripleTermSubject', T11.VariableTerm | T11.IriTerm | T11.LiteralTerm | T11.BlankTerm> = <const> {
  name: 'tripleTermSubject',
  impl: ({ SUBRULE, OR }) => () => OR<T11.VariableTerm | T11.IriTerm | T11.LiteralTerm | T11.BlankTerm>([
    { ALT: () => SUBRULE(S11.var_) },
    { ALT: () => SUBRULE(S11.iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(S11.numericLiteral) },
    { ALT: () => SUBRULE(S11.booleanLiteral) },
    { ALT: () => SUBRULE(S11.blankNode) },
  ]),
};

/**
 * [[119]](https://www.w3.org/TR/sparql12-query/#rTripleTermObject)
 */
export const tripleTermObject:
RuleDef<'tripleTermObject', RuleDefReturn<typeof tripleTermSubject> | BaseQuadTerm> = <const> {
  name: 'tripleTermObject',
  impl: $ => () => $.OR2<T11.VariableTerm | T11.IriTerm | T11.LiteralTerm | T11.BlankTerm | BaseQuadTerm>([
    { ALT: () => tripleTermSubject.impl($)() },
    { ALT: () => $.SUBRULE(tripleTerm) },
  ]),
};

/**
 * [[120]](https://www.w3.org/TR/sparql12-query/#rTripleTermData)
 */
export const tripleTermData: RuleDef<'tripleTermData', BaseQuadTerm> = <const> {
  name: 'tripleTermData',
  impl: ({ ACTION, CONSUME, OR, SUBRULE, context }) => () => {
    CONSUME(l12.tripleTermOpen);
    const subject = SUBRULE(tripleTermDataSubject);
    const predicate = OR([
      { ALT: () => SUBRULE(S11.iri) },
      { ALT: () => {
        CONSUME(l11.a);
        return ACTION(() => context.dataFactory.namedNode(CommonIRIs.TYPE));
      } },
    ]);
    const object = SUBRULE(tripleTermDataObject);
    CONSUME(l12.tripleTermClose);

    return ACTION(() => context.dataFactory.quad(subject, predicate, object));
  },
};

/**
 * [[121]](https://www.w3.org/TR/sparql12-query/#rTripleTermDataSubject)
 */
export const tripleTermDataSubject: RuleDef<'tripleTermDataSubject', T11.IriTerm | T11.LiteralTerm> = <const> {
  name: 'tripleTermDataSubject',
  impl: ({ OR, SUBRULE }) => () => OR<T11.IriTerm | T11.LiteralTerm>([
    { ALT: () => SUBRULE(S11.iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(S11.numericLiteral) },
    { ALT: () => SUBRULE(S11.booleanLiteral) },
  ]),
};

/**
 * [[122]](https://www.w3.org/TR/sparql12-query/#rTripleTermDataObject)
 */
export const tripleTermDataObject:
RuleDef<'tripleTermDataObject', RuleDefReturn<typeof tripleTermDataSubject> | BaseQuadTerm> = <const> {
  name: 'tripleTermDataObject',
  impl: $ => () => $.OR2<T11.IriTerm | T11.LiteralTerm | BaseQuadTerm>([
    { ALT: () => tripleTermDataSubject.impl($)() },
    { ALT: () => $.SUBRULE(tripleTermData) },
  ]),
};

/**
 * OVERRIDING RULE: {@link S11.primaryExpression}.
 * [[134]](https://www.w3.org/TR/sparql12-query/#rPrimaryExpression)
 */
export const primaryExpression: RuleDef<'primaryExpression', Expression> = <const> {
  name: 'primaryExpression',
  impl: $ => () => $.OR2<Expression>([
    { ALT: () => S11.primaryExpression.impl($)() },
    { ALT: () => $.SUBRULE(exprTripleTerm) },
  ]),
};

/**
 * [[135]](https://www.w3.org/TR/sparql12-query/#rExprTripleTerm)
 */
export const exprTripleTerm: RuleDef<'exprTripleTerm', BaseQuadTerm> = <const> {
  name: 'exprTripleTerm',
  impl: ({ ACTION, CONSUME, SUBRULE, context }) => () => {
    CONSUME(l12.tripleTermOpen);
    const subject = SUBRULE(exprTripleTermSubject);
    const predicate = SUBRULE(S11.verb);
    const object = SUBRULE(exprTripleTermObject);
    CONSUME(l12.tripleTermClose);

    return ACTION(() => context.dataFactory.quad(subject, predicate, object));
  },
};

/**
 * [[136]](https://www.w3.org/TR/sparql12-query/#rExprTripleTermSubject)
 */
export const exprTripleTermSubject:
RuleDef<'exprTripleTermSubject', T11.IriTerm | T11.VariableTerm | T11.LiteralTerm> = <const> {
  name: 'exprTripleTermSubject',
  impl: ({ OR, SUBRULE }) => () =>
    OR<T11.IriTerm | T11.VariableTerm | T11.LiteralTerm>([
      { ALT: () => SUBRULE(S11.iri) },
      { ALT: () => SUBRULE(rdfLiteral) },
      { ALT: () => SUBRULE(S11.numericLiteral) },
      { ALT: () => SUBRULE(S11.booleanLiteral) },
      { ALT: () => SUBRULE(S11.var_) },
    ]),
};

/**
 * [[137]](https://www.w3.org/TR/sparql12-query/#rExprTripleTermObject)
 */
export const exprTripleTermObject:
RuleDef<'exprTripleTermObject', RuleDefReturn<typeof exprTripleTermSubject> | BaseQuadTerm> = <const> {
  name: 'exprTripleTermObject',
  impl: $ => () =>
    $.OR2<T11.IriTerm | T11.VariableTerm | T11.LiteralTerm | BaseQuadTerm>([
      { ALT: () => exprTripleTermSubject.impl($)() },
      { ALT: () => $.SUBRULE(exprTripleTerm) },
    ]),
};

export const builtinLangDir = funcExpr1(l12.builtinLangDir);
export const builtinLangStrDir = funcExpr3(l12.builtinStrLangDir);
export const builtinHasLang = funcExpr1(l12.builtinHasLang);
export const builtinHasLangDir = funcExpr1(l12.builtinHasLangDir);
export const builtinIsTriple = funcExpr1(l12.builtinIsTRIPLE);
export const builtinTriple = funcExpr3(l12.builtinTRIPLE);
export const builtinSubject = funcExpr1(l12.builtinSUBJECT);
export const builtinPredicate = funcExpr1(l12.builtinPREDICATE);
export const builtinObject = funcExpr1(l12.builtinOBJECT);

/**
 * OVERRIDING RULE: {@link S11.builtInCall}.
 * [[139]](https://www.w3.org/TR/sparql12-query/#rBuiltInCall)
 */
export const builtInCall: typeof S11.builtInCall = <const> {
  name: 'builtInCall',
  impl: $ => () => $.OR2<T11.Expression>([
    { ALT: () => S11.builtInCall.impl($)() },
    { ALT: () => $.SUBRULE(builtinLangDir) },
    { ALT: () => $.SUBRULE(builtinLangStrDir) },
    { ALT: () => $.SUBRULE(builtinHasLang) },
    { ALT: () => $.SUBRULE(builtinHasLangDir) },
    { ALT: () => $.SUBRULE(builtinIsTriple) },
    { ALT: () => $.SUBRULE(builtinTriple) },
    { ALT: () => $.SUBRULE(builtinSubject) },
    { ALT: () => $.SUBRULE(builtinPredicate) },
    { ALT: () => $.SUBRULE(builtinObject) },
  ]),
};

function isLangDir(dir: string): dir is 'ltr' | 'rtl' {
  return dir === 'ltr' || dir === 'rtl';
}

/**
 * OVERRIDING RULE: {@link S11.rdfLiteral}.
 * No retyping is needed since the return type is the same
 * [[147]](https://www.w3.org/TR/sparql12-query/#rRDFLiteral)
 */
export const rdfLiteral: typeof S11.rdfLiteral = <const> {
  name: 'rdfLiteral',
  impl: ({ ACTION, SUBRULE, OPTION, CONSUME, OR, context }) => () => {
    const value = SUBRULE(S11.string);
    const langOrDataType = OPTION(() => OR<string | NamedNode | DirectionalLanguage>([
      { ALT: () => {
        const langTag = CONSUME(l12.LANG_DIR).image.slice(1);

        return ACTION(() => {
          const dirSplit = langTag.split('--');
          if (dirSplit.length > 1) {
            const [ language, direction ] = dirSplit;
            if (!isLangDir(direction)) {
              throw new Error(`language direction "${direction}" of literal "${value}@${langTag}" is not is required range 'ltr' | 'rtl'.`);
            }
            return {
              language,
              direction,
            };
          }
          return langTag;
        });
      } },
      { ALT: () => {
        CONSUME(l11.symbols.hathat);
        return SUBRULE(S11.iri);
      } },
    ]));
    return context.dataFactory.literal(value, langOrDataType);
  },
};
