import { allTokens } from '../../../lexer';
import { Builder } from '../../buildExample';
import {
  path,
  pathAlternative,
  pathElt,
  pathEltOrInverse,
  pathMod,
  pathNegatedPropertySet,
  pathOneInPropertySet,
  pathPrimary,
  pathSequence,
} from '../propertyPaths';
import {
  blankNodePropertyListPath,
  collectionPath,
  graphNodePath,
  objectListPath,
  objectPath,
  propertyListPath,
  propertyListPathNotEmpty,
  triplesBlock,
  triplesNodePath,
  triplesSameSubjectPath,
  verbPath,
  verbSimple,
} from '../tripleBlock';
import { objectListBuilder } from './objectListParser';

export const triplesBlockParserBuilder = Builder.createBuilder(false)
  .addRule(triplesBlock)
  .addRule(triplesSameSubjectPath)
  // VarOrTerm is included in the required ObjectList rule
  .addRule(propertyListPathNotEmpty)
  .addRule(triplesNodePath)
  .addRule(propertyListPath)
  // PropertyListNotEmpty
  .addRule(verbPath)
  .addRule(verbSimple)
  .addRule(objectListPath)
  .merge(objectListBuilder)
  // Verb path
  .addRule(path)
  .addRule(pathAlternative)
  .addRule(pathSequence)
  .addRule(pathEltOrInverse)
  .addRule(pathElt)
  .addRule(pathPrimary)
  .addRule(pathMod)
  .addRule(pathNegatedPropertySet)
  .addRule(pathOneInPropertySet)
// ObjectListPath
  .addRule(objectPath)
  .addRule(graphNodePath)
  .addRule(collectionPath)
  .addRule(blankNodePropertyListPath);

export const triplesBlockParser = triplesBlockParserBuilder.consume(allTokens);
