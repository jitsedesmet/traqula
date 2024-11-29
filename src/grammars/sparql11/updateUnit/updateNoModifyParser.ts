import { allTokens } from '../../../lexer';
import { Builder } from '../../buildExample';

import {
  baseDecl,
  graphTerm,
  prefixDecl,
  prologue,
  triplesTemplate,
  var_,
  varOrIri,
  varOrTerm,
  verb,
} from '../general';
import {
  blankNode,
  booleanLiteral,
  iri,
  numericLiteral,
  numericLiteralNegative,
  numericLiteralPositive,
  numericLiteralUnsigned,
  prefixedName,
  rdfLiteral,
  string,
} from '../literals';
import {
  blankNodePropertyList,
  collection,
  graphNode,
  object,
  objectList,
  propertyList,
  propertyListNotEmpty,
  triplesNode,
  triplesSameSubject,
} from '../tripleBlock';
import {
  add,
  clear,
  copy,
  create,
  deleteData,
  deleteWhere,
  drop,
  graphOrDefault,
  graphRef,
  graphRefAll,
  insertData,
  load,
  move,
  quadData,
  quadPattern,
  quads,
  quadsNotTriples,
  update,
  update1,
  updateUnit,
} from './updateUnit';

export const updateNoModifyParserBuilder = Builder.createBuilder(false)
  .addRule(updateUnit)
  .addRule(update)
  .addRule(prologue)
  .addRule(update1)
  .patchRule('update1', ({ SUBRULE, OR }) => () => OR([
    { ALT: () => SUBRULE(load) },
    { ALT: () => SUBRULE(clear) },
    { ALT: () => SUBRULE(drop) },
    { ALT: () => SUBRULE(add) },
    { ALT: () => SUBRULE(move) },
    { ALT: () => SUBRULE(copy) },
    { ALT: () => SUBRULE(create) },
    { ALT: () => SUBRULE(insertData) },
    { ALT: () => SUBRULE(deleteData) },
    { ALT: () => SUBRULE(deleteWhere) },
  ]))
  .addRule(baseDecl)
  .addRule(prefixDecl)
  .addRule(load)
  .addRule(clear)
  .addRule(drop)
  .addRule(add)
  .addRule(move)
  .addRule(copy)
  .addRule(create)
  .addRule(insertData)
  .addRule(deleteData)
  .addRule(deleteWhere)
  .addRule(iri)
  .addRule(prefixedName)
  .addRule(graphRef)
  .addRule(graphRefAll)
  .addRule(graphOrDefault)
  .addRule(quadData)
  .addRule(quads)
  .addRule(triplesTemplate)
  .addRule(quadsNotTriples)
  .addRule(varOrIri)
  .addRule(triplesSameSubject)
  .addRule(varOrTerm)
  .addRule(propertyListNotEmpty)
  .addRule(triplesNode)
  .addRule(propertyList)
  .addRule(var_)
  .addRule(graphTerm)
  .addRule(rdfLiteral)
  .addRule(string)
  .addRule(numericLiteral)
  .addRule(numericLiteralUnsigned)
  .addRule(numericLiteralPositive)
  .addRule(numericLiteralNegative)
  .addRule(booleanLiteral)
  .addRule(blankNode)
  .addRule(verb)
  .addRule(objectList)
  .addRule(object)
  .addRule(collection)
  .addRule(blankNodePropertyList)
  .addRule(graphNode)
  .addRule(quadPattern);

export const updateNoModifyParser = updateNoModifyParserBuilder.consume(allTokens);
