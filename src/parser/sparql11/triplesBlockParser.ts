import { Builder } from '../../grammar/parserBuilder';
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
} from '../../grammar/sparql11/propertyPaths';
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
} from '../../grammar/sparql11/tripleBlock';
import { objectListBuilder, type ObjectListBuilderArgs } from './objectListParser';

export type TriplesBlockBuilderArgs = '' |
  'triplesBlock' |
  'triplesSameSubjectPath' |
  'propertyListPathNotEmpty' |
  'triplesNodePath' |
  'propertyListPath' |
  'verbPath' |
  'verbSimple' |
  'objectListPath' |
  ObjectListBuilderArgs |
  'path' |
  'pathAlternative' |
  'pathSequence' |
  'pathEltOrInverse' |
  'pathElt' |
  'pathPrimary' |
  'pathMod' |
  'pathNegatedPropertySet' |
  'pathOneInPropertySet' |
  'objectPath' |
  'graphNodePath' |
  'collectionPath' |
  'blankNodePropertyListPath';

export const triplesBlockParserBuilder: Builder<TriplesBlockBuilderArgs> = Builder.createBuilder(false)
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
