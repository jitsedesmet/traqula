import { Builder } from '../../grammar/builder/parserBuilder';
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

export const triplesBlockParserBuilder = Builder.createBuilder(<const> [
  triplesBlock,
  triplesSameSubjectPath,
  // VarOrTerm is included in the required ObjectList rule
  propertyListPathNotEmpty,
  triplesNodePath,
  propertyListPath,
  // PropertyListNotEmpty
  verbPath,
  verbSimple,
  objectListPath,
])
  .merge(objectListBuilder, <const> [])
  // Verb path
  .addMany(
    path,
    pathAlternative,
    pathSequence,
    pathEltOrInverse,
    pathElt,
    pathPrimary,
    pathMod,
    pathNegatedPropertySet,
    pathOneInPropertySet,
    // ObjectListPath
    objectPath,
    graphNodePath,
    collectionPath,
    blankNodePropertyListPath,
  );
