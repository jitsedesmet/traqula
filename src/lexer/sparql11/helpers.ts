import type { ITokenConfig, TokenType } from '@chevrotain/types';
import { createToken as chevcT } from 'chevrotain';

export function createToken<U extends string>(config: ITokenConfig & { name: U }): TokenType & { name: U } {
  return <TokenType & { name: U }> chevcT(config);
}
