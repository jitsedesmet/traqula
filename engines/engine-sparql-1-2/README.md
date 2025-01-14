# TRAQULA parser engine for SPARQL 1.2

TRAQULA Sparql 1.2 is a SPARQL 1.2 query parser for TypeScript.
It is a grammar extension of [TRAQULA engine-sparql-1-1](https://github.com/comunica/traqula/tree/main/engines/engine-sparql-1-1)

## Installation

```bash
npm install @traqula/engine-sparql-1-1
```

or

```bash
yarn add @traqula/engine-sparql-1-1
```

## Import

Either through ESM import:

```javascript
import { Sparql12Parser } from '@traqula/engine-sparql-1-2';
```

_or_ CJS require:

```javascript
const Sparql12Parser = require('@traqula/engine-sparql-1-2').Sparql12Parser;
```

## Usage

This package contains a `Sparql12Parser` that is able to parse SPARQL 1.2 queries:

```typescript
const parser = new Sparql12Parser();
const abstractSyntaxTree = parser.parse('SELECT * { ?s ?p ?o }');
```

This parser is a simple grammar extension to the [engine-sparql-1-1](https://github.com/comunica/traqula/tree/main/engines/engine-sparql-1-1).
As such, most, if not all, documentation of that parser holds for this one too.