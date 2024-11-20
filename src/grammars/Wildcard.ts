// Wildcard constructor
export class Wildcard {
  public value = '*';
  public termType = 'Wildcard';
  public constructor() {
    // eslint-disable-next-line no-constructor-return
    return WILDCARD || this;
  }

  public equals(other: { termType: any } | undefined | null): boolean {
    return Boolean(other && (this.termType === other.termType));
  }
}

const WILDCARD = new Wildcard();
