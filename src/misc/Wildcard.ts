import type { Wildcard as IWildcard } from '../grammar/sparqlJSTypes';

// Wildcard constructor
export class Wildcard implements IWildcard {
  public value = <const> '*';
  public termType = <const> 'Wildcard';
  public constructor() {
    // eslint-disable-next-line no-constructor-return
    return WILDCARD || this;
  }

  public equals(other: { termType: any } | undefined | null): boolean {
    return Boolean(other && (this.termType === other.termType));
  }
}

const WILDCARD = new Wildcard();
