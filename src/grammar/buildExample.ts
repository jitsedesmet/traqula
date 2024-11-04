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
    const parser = new OpenParser(tokenVocabulary);
    const populatedParser = <OpenParser & Record<string, ParserMethod<unknown[], CstNode>>> <unknown> parser;
    const selfRef: CstDef = {
      CONSUME: parser.CONSUME.bind(parser),
      CONSUME1: parser.CONSUME1.bind(parser),
      CONSUME2: parser.CONSUME2.bind(parser),
      CONSUME3: parser.CONSUME3.bind(parser),
      CONSUME4: parser.CONSUME4.bind(parser),
      CONSUME5: parser.CONSUME5.bind(parser),
      CONSUME6: parser.CONSUME6.bind(parser),
      CONSUME7: parser.CONSUME7.bind(parser),
      CONSUME8: parser.CONSUME8.bind(parser),
      CONSUME9: parser.CONSUME9.bind(parser),
      OPTION: parser.OPTION.bind(parser),
      OPTION1: parser.OPTION1.bind(parser),
      OPTION2: parser.OPTION2.bind(parser),
      OPTION3: parser.OPTION3.bind(parser),
      OPTION4: parser.OPTION4.bind(parser),
      OPTION5: parser.OPTION5.bind(parser),
      OPTION6: parser.OPTION6.bind(parser),
      OPTION7: parser.OPTION7.bind(parser),
      OPTION8: parser.OPTION8.bind(parser),
      OPTION9: parser.OPTION9.bind(parser),
      OR: parser.OR.bind(parser),
      OR1: parser.OR1.bind(parser),
      OR2: parser.OR2.bind(parser),
      OR3: parser.OR3.bind(parser),
      OR4: parser.OR4.bind(parser),
      OR5: parser.OR5.bind(parser),
      OR6: parser.OR6.bind(parser),
      OR7: parser.OR7.bind(parser),
      OR8: parser.OR8.bind(parser),
      OR9: parser.OR9.bind(parser),
      MANY: parser.MANY.bind(parser),
      MANY1: parser.MANY1.bind(parser),
      MANY2: parser.MANY2.bind(parser),
      MANY3: parser.MANY3.bind(parser),
      MANY4: parser.MANY4.bind(parser),
      MANY5: parser.MANY5.bind(parser),
      MANY6: parser.MANY6.bind(parser),
      MANY7: parser.MANY7.bind(parser),
      MANY8: parser.MANY8.bind(parser),
      MANY9: parser.MANY9.bind(parser),
      MANY_SEP: parser.MANY_SEP.bind(parser),
      MANY_SEP1: parser.MANY_SEP1.bind(parser),
      MANY_SEP2: parser.MANY_SEP2.bind(parser),
      MANY_SEP3: parser.MANY_SEP3.bind(parser),
      MANY_SEP4: parser.MANY_SEP4.bind(parser),
      MANY_SEP5: parser.MANY_SEP5.bind(parser),
      MANY_SEP6: parser.MANY_SEP6.bind(parser),
      MANY_SEP7: parser.MANY_SEP7.bind(parser),
      MANY_SEP8: parser.MANY_SEP8.bind(parser),
      MANY_SEP9: parser.MANY_SEP9.bind(parser),
      AT_LEAST_ONE: parser.AT_LEAST_ONE.bind(parser),
      AT_LEAST_ONE1: parser.AT_LEAST_ONE1.bind(parser),
      AT_LEAST_ONE2: parser.AT_LEAST_ONE2.bind(parser),
      AT_LEAST_ONE3: parser.AT_LEAST_ONE3.bind(parser),
      AT_LEAST_ONE4: parser.AT_LEAST_ONE4.bind(parser),
      AT_LEAST_ONE5: parser.AT_LEAST_ONE5.bind(parser),
      AT_LEAST_ONE6: parser.AT_LEAST_ONE6.bind(parser),
      AT_LEAST_ONE7: parser.AT_LEAST_ONE7.bind(parser),
      AT_LEAST_ONE8: parser.AT_LEAST_ONE8.bind(parser),
      AT_LEAST_ONE9: parser.AT_LEAST_ONE9.bind(parser),
      AT_LEAST_ONE_SEP: parser.AT_LEAST_ONE_SEP.bind(parser),
      AT_LEAST_ONE_SEP1: parser.AT_LEAST_ONE_SEP1.bind(parser),
      AT_LEAST_ONE_SEP2: parser.AT_LEAST_ONE_SEP2.bind(parser),
      AT_LEAST_ONE_SEP3: parser.AT_LEAST_ONE_SEP3.bind(parser),
      AT_LEAST_ONE_SEP4: parser.AT_LEAST_ONE_SEP4.bind(parser),
      AT_LEAST_ONE_SEP5: parser.AT_LEAST_ONE_SEP5.bind(parser),
      AT_LEAST_ONE_SEP6: parser.AT_LEAST_ONE_SEP6.bind(parser),
      AT_LEAST_ONE_SEP7: parser.AT_LEAST_ONE_SEP7.bind(parser),
      AT_LEAST_ONE_SEP8: parser.AT_LEAST_ONE_SEP8.bind(parser),
      AT_LEAST_ONE_SEP9: parser.AT_LEAST_ONE_SEP9.bind(parser),
      SUBRULE: (cstDef: RuleDef) => parser.SUBRULE.bind(parser)(populatedParser[cstDef.name]),
      SUBRULE1: (cstDef: RuleDef) => parser.SUBRULE1.bind(parser)(populatedParser[cstDef.name]),
      SUBRULE2: (cstDef: RuleDef) => parser.SUBRULE2.bind(parser)(populatedParser[cstDef.name]),
      SUBRULE3: (cstDef: RuleDef) => parser.SUBRULE3.bind(parser)(populatedParser[cstDef.name]),
      SUBRULE4: (cstDef: RuleDef) => parser.SUBRULE4.bind(parser)(populatedParser[cstDef.name]),
      SUBRULE5: (cstDef: RuleDef) => parser.SUBRULE5.bind(parser)(populatedParser[cstDef.name]),
      SUBRULE6: (cstDef: RuleDef) => parser.SUBRULE6.bind(parser)(populatedParser[cstDef.name]),
      SUBRULE7: (cstDef: RuleDef) => parser.SUBRULE7.bind(parser)(populatedParser[cstDef.name]),
      SUBRULE8: (cstDef: RuleDef) => parser.SUBRULE8.bind(parser)(populatedParser[cstDef.name]),
      SUBRULE9: (cstDef: RuleDef) => parser.SUBRULE9.bind(parser)(populatedParser[cstDef.name]),
    };

    for (const rule of this.rules) {
      populatedParser[rule.name] = populatedParser.RULE(rule.name, rule.impl.bind(this)(selfRef));
    }

    return <CstParser & Record<T, any>> populatedParser;
  }
}
