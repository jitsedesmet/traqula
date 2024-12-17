import type { TokenType } from 'chevrotain';

export class LexerBuilder {
  private readonly tokens: TokenType[];
  public constructor(...startTokens: LexerBuilder[]) {
    this.tokens = startTokens.flatMap(builder => builder.tokens);
  }

  public add(...token: TokenType[]): LexerBuilder {
    this.tokens.push(...token);
    return this;
  }

  public mergeAfter(builder: LexerBuilder): LexerBuilder {
    this.tokens.push(...builder.tokens);
    return this;
  }

  public mergeBefore(builder: LexerBuilder): LexerBuilder {
    this.tokens.unshift(...builder.tokens);
    return this;
  }

  public addBefore(before: TokenType, ...token: TokenType[]): LexerBuilder {
    const index = this.tokens.indexOf(before);
    if (index === -1) {
      throw new Error('Token not found');
    }
    this.tokens.splice(index, 0, ...token);
    return this;
  }

  public moveBefore(before: TokenType, ...tokens: TokenType[]): LexerBuilder {
    const beforeIndex = this.tokens.indexOf(before);
    if (beforeIndex === -1) {
      throw new Error('BeforeToken not found');
    }
    for (const token of tokens) {
      const tokenIndex = this.tokens.indexOf(token);
      if (tokenIndex === -1) {
        throw new Error('Token not found');
      }
      this.tokens.splice(tokenIndex, 1);
      this.tokens.splice(beforeIndex, 0, token);
    }
    return this;
  }

  public addAfter(after: TokenType, ...token: TokenType[]): LexerBuilder {
    const index = this.tokens.indexOf(after);
    if (index === -1) {
      throw new Error('Token not found');
    }
    this.tokens.splice(index + 1, 0, ...token);
    return this;
  }

  public build(): TokenType[] {
    return this.tokens;
  }
}
