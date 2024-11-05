import type {
  AtLeastOneSepMethodOpts,
  DSLMethodOpts,
  DSLMethodOptsWithErr,
  GrammarAction,
  IOrAlt,
  ManySepMethodOpts,
  OrMethodOpts,
} from '@chevrotain/types';
import type {
  ConsumeMethodOpts,
  CstNode,
  IToken,
  ParserMethod,
  TokenType,
  TokenVocabulary,
  CstParser,
} from 'chevrotain';
import { OpenParser } from './OpenParser';

interface CstDef {
  /**
   *
   * A Parsing DSL method use to consume a single Token.
   * In EBNF terms this is equivalent to a Terminal.
   *
   * A Token will be consumed, IFF the next token in the token vector matches `tokType`.
   * otherwise the parser may attempt to perform error recovery (if enabled).
   *
   * The index in the method name indicates the unique occurrence of a terminal consumption
   * inside a the top level rule. What this means is that if a terminal appears
   * more than once in a single rule, each appearance must have a **different** index.
   *
   * For example:
   * ```
   *   this.RULE("qualifiedName", () => {
   *   this.CONSUME1(Identifier);
   *     this.MANY(() => {
   *       this.CONSUME1(Dot);
   *       // here we use CONSUME2 because the terminal
   *       // 'Identifier' has already appeared previously in the
   *       // the rule 'parseQualifiedName'
   *       this.CONSUME2(Identifier);
   *     });
   *   })
   * ```
   *
   * - See more details on the [unique suffixes requirement](http://chevrotain.io/docs/FAQ.html#NUMERICAL_SUFFIXES).
   *
   * @param tokType - The Type of the token to be consumed.
   * @param options - optional properties to modify the behavior of CONSUME.
   */
  CONSUME: (tokType: TokenType, options?: ConsumeMethodOpts) => IToken;
  CONSUME1: (tokType: TokenType, options?: ConsumeMethodOpts) => IToken;
  CONSUME2: (tokType: TokenType, options?: ConsumeMethodOpts) => IToken;
  CONSUME3: (tokType: TokenType, options?: ConsumeMethodOpts) => IToken;
  CONSUME4: (tokType: TokenType, options?: ConsumeMethodOpts) => IToken;
  CONSUME5: (tokType: TokenType, options?: ConsumeMethodOpts) => IToken;
  CONSUME6: (tokType: TokenType, options?: ConsumeMethodOpts) => IToken;
  CONSUME7: (tokType: TokenType, options?: ConsumeMethodOpts) => IToken;
  CONSUME8: (tokType: TokenType, options?: ConsumeMethodOpts) => IToken;
  CONSUME9: (tokType: TokenType, options?: ConsumeMethodOpts) => IToken;
  /**
   * Parsing DSL Method that Indicates an Optional production.
   * in EBNF notation this is equivalent to: "[...]".
   *
   * Note that there are two syntax forms:
   * - Passing the grammar action directly:
   *   ```
   *     this.OPTION(() => {
   *       this.CONSUME(Digit)}
   *     );
   *   ```
   *
   * - using an "options" object:
   *   ```
   *     this.OPTION({
   *       GATE:predicateFunc,
   *       DEF: () => {
   *         this.CONSUME(Digit)
   *     }});
   *   ```
   *
   * The optional 'GATE' property in "options" object form can be used to add constraints
   * to invoking the grammar action.
   *
   * As in CONSUME the index in the method name indicates the occurrence
   * of the optional production in it's top rule.
   *
   * @param  actionORMethodDef - The grammar action to optionally invoke once
   *                             or an "OPTIONS" object describing the grammar action and optional properties.
   *
   * @returns The `GrammarAction` return value (OUT) if the optional syntax is encountered
   *          or `undefined` if not.
   */
  OPTION: <OUT>(
    actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>,
  ) => OUT | undefined;
  OPTION1: <OUT>(
    actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>,
  ) => OUT | undefined;
  OPTION2: <OUT>(
    actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>,
  ) => OUT | undefined;
  OPTION3: <OUT>(
    actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>,
  ) => OUT | undefined;
  OPTION4: <OUT>(
    actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>,
  ) => OUT | undefined;
  OPTION5: <OUT>(
    actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>,
  ) => OUT | undefined;
  OPTION6: <OUT>(
    actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>,
  ) => OUT | undefined;
  OPTION7: <OUT>(
    actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>,
  ) => OUT | undefined;
  OPTION8: <OUT>(
    actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>,
  ) => OUT | undefined;
  OPTION9: <OUT>(
    actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>,
  ) => OUT | undefined;
  /**
   * Parsing DSL method that indicates a choice between a set of alternatives must be made.
   * This is equivalent to an EBNF alternation (A | B | C | D ...), except
   * that the alternatives are ordered like in a PEG grammar.
   * This means that the **first** matching alternative is always chosen.
   *
   * There are several forms for the inner alternatives array:
   *
   * - Passing alternatives array directly:
   *   ```
   *     this.OR([
   *       { ALT:() => { this.CONSUME(One) }},
   *       { ALT:() => { this.CONSUME(Two) }},
   *       { ALT:() => { this.CONSUME(Three) }}
   *     ])
   *   ```
   *
   * - Passing alternative array directly with predicates (GATE):
   *   ```
   *     this.OR([
   *       { GATE: predicateFunc1, ALT:() => { this.CONSUME(One) }},
   *       { GATE: predicateFuncX, ALT:() => { this.CONSUME(Two) }},
   *       { GATE: predicateFuncX, ALT:() => { this.CONSUME(Three) }}
   *     ])
   *   ```
   *
   * - These syntax forms can also be mixed:
   *   ```
   *     this.OR([
   *       {
   *         GATE: predicateFunc1,
   *         ALT:() => { this.CONSUME(One) }
   *       },
   *       { ALT:() => { this.CONSUME(Two) }},
   *       { ALT:() => { this.CONSUME(Three) }}
   *     ])
   *   ```
   *
   * - Additionally an "options" object may be used:
   *   ```
   *     this.OR({
   *       DEF:[
   *         { ALT:() => { this.CONSUME(One) }},
   *         { ALT:() => { this.CONSUME(Two) }},
   *         { ALT:() => { this.CONSUME(Three) }}
   *       ],
   *       // OPTIONAL property
   *       ERR_MSG: "A Number"
   *     })
   *   ```
   *
   * The 'predicateFuncX' in the long form can be used to add constraints to choosing the alternative.
   *
   * As in CONSUME the index in the method name indicates the occurrence
   * of the alternation production in it's top rule.
   *
   * @param altsOrOpts - A set of alternatives or an "OPTIONS" object describing the alternatives
   * and optional properties.
   *
   * @returns The result of invoking the chosen alternative.
   */
  OR: (altsOrOpts: IOrAlt<any>[] | OrMethodOpts<any>) => any;
  OR1: (altsOrOpts: IOrAlt<any>[] | OrMethodOpts<any>) => any;
  OR2: (altsOrOpts: IOrAlt<any>[] | OrMethodOpts<any>) => any;
  OR3: (altsOrOpts: IOrAlt<any>[] | OrMethodOpts<any>) => any;
  OR4: (altsOrOpts: IOrAlt<any>[] | OrMethodOpts<any>) => any;
  OR5: (altsOrOpts: IOrAlt<any>[] | OrMethodOpts<any>) => any;
  OR6: (altsOrOpts: IOrAlt<any>[] | OrMethodOpts<any>) => any;
  OR7: (altsOrOpts: IOrAlt<any>[] | OrMethodOpts<any>) => any;
  OR8: (altsOrOpts: IOrAlt<any>[] | OrMethodOpts<any>) => any;
  OR9: (altsOrOpts: IOrAlt<any>[] | OrMethodOpts<any>) => any;
  /**
   * Parsing DSL method, that indicates a repetition of zero or more.
   * This is equivalent to EBNF repetition \{...\}.
   *
   * Note that there are two syntax forms:
   * - Passing the grammar action directly:
   *   ```
   *     this.MANY(() => {
   *       this.CONSUME(Comma)
   *       this.CONSUME(Digit)
   *      })
   *   ```
   *
   * - using an "options" object:
   *   ```
   *     this.MANY({
   *       GATE: predicateFunc,
   *       DEF: () => {
   *              this.CONSUME(Comma)
   *              this.CONSUME(Digit)
   *            }
   *     });
   *   ```
   *
   * The optional 'GATE' property in "options" object form can be used to add constraints
   * to invoking the grammar action.
   *
   * As in CONSUME the index in the method name indicates the occurrence
   * of the repetition production in it's top rule.
   *
   * @param actionORMethodDef - The grammar action to optionally invoke multiple times
   *                             or an "OPTIONS" object describing the grammar action and optional properties.
   *
   */
  MANY: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>,
  ) => void;
  MANY1: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>,
  ) => void;
  MANY2: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>,
  ) => void;
  MANY3: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>,
  ) => void;
  MANY4: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>,
  ) => void;
  MANY5: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>,
  ) => void;
  MANY6: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>,
  ) => void;
  MANY7: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>,
  ) => void;
  MANY8: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>,
  ) => void;
  MANY9: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>,
  ) => void;
  /**
   * Parsing DSL method, that indicates a repetition of zero or more with a separator
   * Token between the repetitions.
   *
   * Example:
   *
   * ```
   *     this.MANY_SEP({
   *         SEP:Comma,
   *         DEF: () => {
   *             this.CONSUME(Number};
   *             // ...
   *         })
   * ```
   *
   * Note that because this DSL method always requires more than one argument the options object is always required
   * and it is not possible to use a shorter form like in the MANY DSL method.
   *
   * Note that for the purposes of deciding on whether or not another iteration exists
   * Only a single Token is examined (The separator). Therefore if the grammar being implemented is
   * so "crazy" to require multiple tokens to identify an item separator please use the more basic DSL methods
   * to implement it.
   *
   * As in CONSUME the index in the method name indicates the occurrence
   * of the repetition production in it's top rule.
   *
   * @param options - An object defining the grammar of each iteration and the separator between iterations
   *
   */
  MANY_SEP: (options: ManySepMethodOpts<any>) => void;
  MANY_SEP1: (options: ManySepMethodOpts<any>) => void;
  MANY_SEP2: (options: ManySepMethodOpts<any>) => void;
  MANY_SEP3: (options: ManySepMethodOpts<any>) => void;
  MANY_SEP4: (options: ManySepMethodOpts<any>) => void;
  MANY_SEP5: (options: ManySepMethodOpts<any>) => void;
  MANY_SEP6: (options: ManySepMethodOpts<any>) => void;
  MANY_SEP7: (options: ManySepMethodOpts<any>) => void;
  MANY_SEP8: (options: ManySepMethodOpts<any>) => void;
  MANY_SEP9: (options: ManySepMethodOpts<any>) => void;
  /**
   * Convenience method, same as MANY but the repetition is of one or more.
   * failing to match at least one repetition will result in a parsing error and
   * cause a parsing error.
   *
   * @see MANY
   *
   * @param actionORMethodDef  - The grammar action to optionally invoke multiple times
   *                             or an "OPTIONS" object describing the grammar action and optional properties.
   *
   */
  AT_LEAST_ONE: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>,
  ) => void;
  AT_LEAST_ONE1: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>,
  ) => void;
  AT_LEAST_ONE2: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>,
  ) => void;
  AT_LEAST_ONE3: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>,
  ) => void;
  AT_LEAST_ONE4: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>,
  ) => void;
  AT_LEAST_ONE5: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>,
  ) => void;
  AT_LEAST_ONE6: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>,
  ) => void;
  AT_LEAST_ONE7: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>,
  ) => void;
  AT_LEAST_ONE8: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>,
  ) => void;
  AT_LEAST_ONE9: (
    actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>,
  ) => void;
  /**
   * Convenience method, same as MANY_SEP but the repetition is of one or more.
   * failing to match at least one repetition will result in a parsing error and
   * cause the parser to attempt error recovery.
   *
   * Note that an additional optional property ERR_MSG can be used to provide custom error messages.
   *
   * @see MANY_SEP
   *
   * @param options - An object defining the grammar of each iteration and the separator between iterations
   *
   * @return {ISeparatedIterationResult<OUT>}
   */
  AT_LEAST_ONE_SEP: (options: AtLeastOneSepMethodOpts<any>) => void;
  AT_LEAST_ONE_SEP1: (options: AtLeastOneSepMethodOpts<any>) => void;
  AT_LEAST_ONE_SEP2: (options: AtLeastOneSepMethodOpts<any>) => void;
  AT_LEAST_ONE_SEP3: (options: AtLeastOneSepMethodOpts<any>) => void;
  AT_LEAST_ONE_SEP4: (options: AtLeastOneSepMethodOpts<any>) => void;
  AT_LEAST_ONE_SEP5: (options: AtLeastOneSepMethodOpts<any>) => void;
  AT_LEAST_ONE_SEP6: (options: AtLeastOneSepMethodOpts<any>) => void;
  AT_LEAST_ONE_SEP7: (options: AtLeastOneSepMethodOpts<any>) => void;
  AT_LEAST_ONE_SEP8: (options: AtLeastOneSepMethodOpts<any>) => void;
  AT_LEAST_ONE_SEP9: (options: AtLeastOneSepMethodOpts<any>) => void;
  SUBRULE: (cstDef: RuleDef) => CstNode;
  SUBRULE1: (cstDef: RuleDef) => CstNode;
  SUBRULE2: (cstDef: RuleDef) => CstNode;
  SUBRULE3: (cstDef: RuleDef) => CstNode;
  SUBRULE4: (cstDef: RuleDef) => CstNode;
  SUBRULE5: (cstDef: RuleDef) => CstNode;
  SUBRULE6: (cstDef: RuleDef) => CstNode;
  SUBRULE7: (cstDef: RuleDef) => CstNode;
  SUBRULE8: (cstDef: RuleDef) => CstNode;
  SUBRULE9: (cstDef: RuleDef) => CstNode;
}

export type RuleDef = {
  name: string;
  impl: (def: CstDef) => () => void;
};

export class Builder<T extends string> {
  public static createBuilder(): Builder<''> {
    return new Builder<''>();
  }

  private readonly rules: RuleDef[];

  private constructor() {
    this.rules = [];
  }

  public addRule<U extends string>(rule: RuleDef & { name: U }): Builder<T | U> {
    this.rules.push(rule);
    return <Builder<T | U>> this;
  }

  public consume(tokenVocabulary: TokenVocabulary): CstParser & Record<T, ParserMethod<unknown[], CstNode>> {
    const notParser = new OpenParser(tokenVocabulary);
    const parser = <OpenParser & Record<string, ParserMethod<unknown[], CstNode>>> <unknown> notParser;
    const selfRef: CstDef = {
      CONSUME: (tokenType, option) => parser.CONSUME(tokenType, option),
      CONSUME1: (tokenType, option) => parser.CONSUME1(tokenType, option),
      CONSUME2: (tokenType, option) => parser.CONSUME2(tokenType, option),
      CONSUME3: (tokenType, option) => parser.CONSUME3(tokenType, option),
      CONSUME4: (tokenType, option) => parser.CONSUME4(tokenType, option),
      CONSUME5: (tokenType, option) => parser.CONSUME5(tokenType, option),
      CONSUME6: (tokenType, option) => parser.CONSUME6(tokenType, option),
      CONSUME7: (tokenType, option) => parser.CONSUME7(tokenType, option),
      CONSUME8: (tokenType, option) => parser.CONSUME8(tokenType, option),
      CONSUME9: (tokenType, option) => parser.CONSUME9(tokenType, option),
      OPTION: actionORMethodDef => parser.OPTION(actionORMethodDef),
      OPTION1: actionORMethodDef => parser.OPTION1(actionORMethodDef),
      OPTION2: actionORMethodDef => parser.OPTION2(actionORMethodDef),
      OPTION3: actionORMethodDef => parser.OPTION3(actionORMethodDef),
      OPTION4: actionORMethodDef => parser.OPTION4(actionORMethodDef),
      OPTION5: actionORMethodDef => parser.OPTION5(actionORMethodDef),
      OPTION6: actionORMethodDef => parser.OPTION6(actionORMethodDef),
      OPTION7: actionORMethodDef => parser.OPTION7(actionORMethodDef),
      OPTION8: actionORMethodDef => parser.OPTION8(actionORMethodDef),
      OPTION9: actionORMethodDef => parser.OPTION9(actionORMethodDef),
      OR: altsOrOpts => parser.OR(altsOrOpts),
      OR1: altsOrOpts => parser.OR1(altsOrOpts),
      OR2: altsOrOpts => parser.OR2(altsOrOpts),
      OR3: altsOrOpts => parser.OR3(altsOrOpts),
      OR4: altsOrOpts => parser.OR4(altsOrOpts),
      OR5: altsOrOpts => parser.OR5(altsOrOpts),
      OR6: altsOrOpts => parser.OR6(altsOrOpts),
      OR7: altsOrOpts => parser.OR7(altsOrOpts),
      OR8: altsOrOpts => parser.OR8(altsOrOpts),
      OR9: altsOrOpts => parser.OR9(altsOrOpts),
      MANY: actionORMethodDef => parser.MANY(actionORMethodDef),
      MANY1: actionORMethodDef => parser.MANY1(actionORMethodDef),
      MANY2: actionORMethodDef => parser.MANY2(actionORMethodDef),
      MANY3: actionORMethodDef => parser.MANY3(actionORMethodDef),
      MANY4: actionORMethodDef => parser.MANY4(actionORMethodDef),
      MANY5: actionORMethodDef => parser.MANY5(actionORMethodDef),
      MANY6: actionORMethodDef => parser.MANY6(actionORMethodDef),
      MANY7: actionORMethodDef => parser.MANY7(actionORMethodDef),
      MANY8: actionORMethodDef => parser.MANY8(actionORMethodDef),
      MANY9: actionORMethodDef => parser.MANY9(actionORMethodDef),
      MANY_SEP: options => parser.MANY_SEP(options),
      MANY_SEP1: options => parser.MANY_SEP1(options),
      MANY_SEP2: options => parser.MANY_SEP2(options),
      MANY_SEP3: options => parser.MANY_SEP3(options),
      MANY_SEP4: options => parser.MANY_SEP4(options),
      MANY_SEP5: options => parser.MANY_SEP5(options),
      MANY_SEP6: options => parser.MANY_SEP6(options),
      MANY_SEP7: options => parser.MANY_SEP7(options),
      MANY_SEP8: options => parser.MANY_SEP8(options),
      MANY_SEP9: options => parser.MANY_SEP9(options),
      AT_LEAST_ONE: actionORMethodDef => parser.AT_LEAST_ONE(actionORMethodDef),
      AT_LEAST_ONE1: actionORMethodDef => parser.AT_LEAST_ONE1(actionORMethodDef),
      AT_LEAST_ONE2: actionORMethodDef => parser.AT_LEAST_ONE2(actionORMethodDef),
      AT_LEAST_ONE3: actionORMethodDef => parser.AT_LEAST_ONE3(actionORMethodDef),
      AT_LEAST_ONE4: actionORMethodDef => parser.AT_LEAST_ONE4(actionORMethodDef),
      AT_LEAST_ONE5: actionORMethodDef => parser.AT_LEAST_ONE5(actionORMethodDef),
      AT_LEAST_ONE6: actionORMethodDef => parser.AT_LEAST_ONE6(actionORMethodDef),
      AT_LEAST_ONE7: actionORMethodDef => parser.AT_LEAST_ONE7(actionORMethodDef),
      AT_LEAST_ONE8: actionORMethodDef => parser.AT_LEAST_ONE8(actionORMethodDef),
      AT_LEAST_ONE9: actionORMethodDef => parser.AT_LEAST_ONE9(actionORMethodDef),
      AT_LEAST_ONE_SEP: options => parser.AT_LEAST_ONE_SEP(options),
      AT_LEAST_ONE_SEP1: options => parser.AT_LEAST_ONE_SEP1(options),
      AT_LEAST_ONE_SEP2: options => parser.AT_LEAST_ONE_SEP2(options),
      AT_LEAST_ONE_SEP3: options => parser.AT_LEAST_ONE_SEP3(options),
      AT_LEAST_ONE_SEP4: options => parser.AT_LEAST_ONE_SEP4(options),
      AT_LEAST_ONE_SEP5: options => parser.AT_LEAST_ONE_SEP5(options),
      AT_LEAST_ONE_SEP6: options => parser.AT_LEAST_ONE_SEP6(options),
      AT_LEAST_ONE_SEP7: options => parser.AT_LEAST_ONE_SEP7(options),
      AT_LEAST_ONE_SEP8: options => parser.AT_LEAST_ONE_SEP8(options),
      AT_LEAST_ONE_SEP9: options => parser.AT_LEAST_ONE_SEP9(options),
      SUBRULE: (cstDef: RuleDef) => {
        try {
          return parser.SUBRULE(parser[cstDef.name]);
        } catch (error: unknown) {
          console.error(`Error with subrule: ${cstDef.name}`);
          throw error;
        }
      },
      SUBRULE1: (cstDef: RuleDef) => {
        try {
          return parser.SUBRULE1(parser[cstDef.name]);
        } catch (error: unknown) {
          console.error(`Error with subrule: ${cstDef.name}`);
          throw error;
        }
      },
      SUBRULE2: (cstDef: RuleDef) => {
        try {
          return parser.SUBRULE2(parser[cstDef.name]);
        } catch (error: unknown) {
          console.error(`Error with subrule: ${cstDef.name}`);
          throw error;
        }
      },
      SUBRULE3: (cstDef: RuleDef) => {
        try {
          return parser.SUBRULE3(parser[cstDef.name]);
        } catch (error: unknown) {
          console.error(`Error with subrule: ${cstDef.name}`);
          throw error;
        }
      },
      SUBRULE4: (cstDef: RuleDef) => {
        try {
          return parser.SUBRULE4(parser[cstDef.name]);
        } catch (error: unknown) {
          console.error(`Error with subrule: ${cstDef.name}`);
          throw error;
        }
      },
      SUBRULE5: (cstDef: RuleDef) => {
        try {
          return parser.SUBRULE5(parser[cstDef.name]);
        } catch (error: unknown) {
          console.error(`Error with subrule: ${cstDef.name}`);
          throw error;
        }
      },
      SUBRULE6: (cstDef: RuleDef) => {
        try {
          return parser.SUBRULE6(parser[cstDef.name]);
        } catch (error: unknown) {
          console.error(`Error with subrule: ${cstDef.name}`);
          throw error;
        }
      },
      SUBRULE7: (cstDef: RuleDef) => {
        try {
          return parser.SUBRULE7(parser[cstDef.name]);
        } catch (error: unknown) {
          console.error(`Error with subrule: ${cstDef.name}`);
          throw error;
        }
      },
      SUBRULE8: (cstDef: RuleDef) => {
        try {
          return parser.SUBRULE8(parser[cstDef.name]);
        } catch (error: unknown) {
          console.error(`Error with subrule: ${cstDef.name}`);
          throw error;
        }
      },
      SUBRULE9: (cstDef: RuleDef) => {
        try {
          return parser.SUBRULE9(parser[cstDef.name]);
        } catch (error: unknown) {
          console.error(`Error with subrule: ${cstDef.name}`);
          throw error;
        }
      },
    };

    for (const rule of this.rules) {
      parser[rule.name] = parser.RULE(rule.name, rule.impl(selfRef));
    }

    parser.performSelfAnalysis();

    return <CstParser & Record<T, any>> parser;
  }
}
