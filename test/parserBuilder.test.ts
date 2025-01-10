import { describe, it } from 'vitest';
import { Builder } from '../packages/core/lib/grammar-builder/parserBuilder';
import { path, pathAlternative, pathElt, pathMod } from '../packages/rules-sparql-1-1/lib/grammar/propertyPaths';

describe('parserBuilder', () => {
  describe('types', () => {
    it('builder constructor', () => {
      const builder1 = Builder.createBuilder(<const> [ path ]).addMany(pathAlternative, pathElt);
      const builder2 = Builder.createBuilder(<const> [ path, pathAlternative, pathElt ]);
      const builder3 = Builder.createBuilder(<const> [ path ])
        .addRule(pathAlternative)
        .addRule(pathMod);
      // ExpectTypeOf(builder1).toEqualTypeOf<Builder<[typeof path, typeof pathAlternative, typeof pathElt]>>();
      // expectTypeOf(builder2).toEqualTypeOf<Builder<[typeof path, typeof pathAlternative, typeof pathElt]>>();
      // expectTypeOf(builder3).toEqualTypeOf<Builder<[typeof path, typeof pathAlternative, typeof pathMod]>>();
      //
      // const builder4 = builder1.merge(builder3, <const> []);
      // expectTypeOf(builder4)
      //   .toEqualTypeOf<Builder<[typeof path, typeof pathAlternative, typeof pathElt, typeof pathMod]>>();
    });
  });
});
