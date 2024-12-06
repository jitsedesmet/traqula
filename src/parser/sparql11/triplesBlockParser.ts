import { Builder } from '../../grammar/parserBuilder.js';
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
} from '../../grammar/sparql11/propertyPaths.js';
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
} from '../../grammar/sparql11/tripleBlock.js';
import { objectListBuilder } from './objectListParser.js';

export const triplesBlockParserBuilder = Builder.createBuilder({ triplesBlock })
  .addRule(triplesSameSubjectPath)
  // VarOrTerm is included in the required ObjectList rule
  .addRule(propertyListPathNotEmpty)
  .addRule(triplesNodePath)
  .addRule(propertyListPath)
  // PropertyListNotEmpty
  .addRule(verbPath)
  .addRule(verbSimple)
  .addRule(objectListPath)
  .merge(objectListBuilder, {})
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
