import type { Term } from '@rdfjs/types';
import { BlankNode, DefaultGraph, NamedNode, Quad, Variable } from 'rdf-data-factory';
import { Wildcard } from 'sparqljs';
import { expect } from 'vitest';

expect.extend({
  toEqualParsedQuery(received, expected) {
    const { isNot } = this;
    return {
      // Do not alter your "pass" based on isNot. Vitest does it for you
      pass: objectsEqual(received, expected),
      message: () => `${received} is${isNot ? ' not' : ''} foo`,
    };
  },
});

// Test function which checks if object are equal
function objectsEqual(received: unknown, expected: unknown): boolean {
  if (isPrimitive(received) || received === undefined) {
    return received === expected;
  }

  if (isTerm(received) && isTerm(expected)) {
    return received.equals(expected);
  }
  if (!isTerm(received) && !isTerm(expected)) {
    if (Array.isArray(received)) {
      if (!Array.isArray(expected)) {
        return false;
      }
      if (received.length !== expected.length) {
        return false;
      }
      for (const [ i, element ] of received.entries()) {
        if (!objectsEqual(element, expected[i])) {
          return false;
        }
      }
    } else {
      // Received == object
      if (isPrimitive(expected) || Array.isArray(expected)) {
        return false;
      }
      const keys_first = Object.keys(received);

      for (const key of keys_first) {
        if (!objectsEqual(received[key], expected[key])) {
          return false;
        }
      }

      // We do this to make sure that we are not missing keys in the received object
      const keys_second = Object.keys(expected);
      for (const key of keys_second) {
        if (!objectsEqual(received[key], expected[key])) {
          return false;
        }
      }
    }
    return true;
  }
  return false;
}

// If true, the value is a term. With ts annotation
function isTerm(value: unknown): value is Term {
  return value instanceof DefaultGraph ||
    value instanceof NamedNode ||
    value instanceof BlankNode ||
    value instanceof Variable ||
    value instanceof Wildcard ||
    value instanceof Quad;
}

function isPrimitive(value: unknown): boolean {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}
