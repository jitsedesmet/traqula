import { allTokens } from '../../../lexer';
import { Builder } from '../../buildExample';

export const subSelectParserBuilder = Builder.createBuilder(false);

export const subSelectParser = subSelectParserBuilder.consume(allTokens);
