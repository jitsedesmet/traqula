import type {
  AtLeastOneSepMethodOpts,
  DSLMethodOpts,
  DSLMethodOptsWithErr,
  GrammarAction,
  IOrAlt,
  ManySepMethodOpts,
  OrMethodOpts,
} from '@chevrotain/types';
import {
  type ConsumeMethodOpts,
  type CstNode,
  type IToken,
  type ParserMethod,
  type TokenType,
  type TokenVocabulary,
  EmbeddedActionsParser,
} from 'chevrotain';

type SubRuleFunc = <T extends string, U = unknown, ARGS extends any[] = []>(
  cstDef: RuleDef<T, U, ARGS>,
  ...argument: ARGS
) => U;
type BacktrackFunc = <T extends string, U = unknown, ARGS extends any[] = []>(
  cstDef: RuleDef<T, U, ARGS>,
  ...argument: ARGS
) => () => boolean;

export interface ImplArgs extends CstDef {
  cache: WeakMap<RuleDef, unknown>;
  prefixes: Record<string, string>;
}

export interface CstDef {
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
  OR: <T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>) => T;
  OR1: <T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>) => T;
  OR2: <T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>) => T;
  OR3: <T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>) => T;
  OR4: <T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>) => T;
  OR5: <T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>) => T;
  OR6: <T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>) => T;
  OR7: <T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>) => T;
  OR8: <T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>) => T;
  OR9: <T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>) => T;
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
  ACTION: <T>(impl: () => T) => T;
  BACKTRACK: BacktrackFunc;
  SUBRULE: SubRuleFunc;
  SUBRULE1: SubRuleFunc;
  SUBRULE2: SubRuleFunc;
  SUBRULE3: SubRuleFunc;
  SUBRULE4: SubRuleFunc;
  SUBRULE5: SubRuleFunc;
  SUBRULE6: SubRuleFunc;
  SUBRULE7: SubRuleFunc;
  SUBRULE8: SubRuleFunc;
  SUBRULE9: SubRuleFunc;
}

export type ArrayElementsUndefinable<ArrayType extends any[]> =
  ArrayType extends [infer First, ...infer Rest] ? [First | undefined, ...ArrayElementsUndefinable<Rest>] : [];

export type RuleDef<
  NameType extends string = string,
  ReturnType = unknown,
  ParamType extends unknown[] = [],
> = {
  name: NameType;
  impl: (def: ImplArgs) => (...args: ArrayElementsUndefinable<ParamType>) => ReturnType;
};

export type RuleDefReturn<T> = T extends RuleDef<any, infer Ret, any> ? Ret : never;

type RuleDefExcluding<T extends RuleDef, U extends string> = T['name'] extends U ? never : T;

export class Builder<T extends string > {
  public static createBuilder(productionBuild: boolean): Builder<''> {
    return new Builder<''>(productionBuild);
  }

  private rules: Record<T, RuleDef<T, unknown, unknown[]>>;

  private constructor(private readonly productionBuild: boolean) {
    this.rules = <Record<T, RuleDef<T>>> {};
  }

  public patchRule<U extends T>(ruleName: U, patch: RuleDef['impl']): Builder<T> {
    this.rules[ruleName] = {
      name: ruleName,
      impl: patch,
    };
    return this;
  }

  public addRuleRedundant<U extends string>(rule: RuleDef<U, any, any>, terminals: TokenType[] = []): Builder<T | U> {
    const rules = <Record<string, RuleDef>> this.rules;
    if (rules[rule.name] !== undefined && rules[rule.name] !== rule) {
      throw new Error(`Rule ${rule.name} already exists in the builder`);
    }
    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-expect-error TS2536
    this.rules[rule.name] = rule;
    return <Builder<T | U>> this;
  }

  public addRule<U extends string>(
    rule: RuleDefExcluding<RuleDef<U, any, any>, T>,
    terminals: TokenType[] = [],
  ): Builder<T | U> {
    return this.addRuleRedundant(rule, terminals);
  }

  public deleteRule<U extends T>(ruleName: U): Builder<Exclude<T, U>> {
    delete this.rules[ruleName];
    return <Builder<Exclude<T, U>>><unknown> this;
  }

  public merge<U extends string>(builder: Builder<U>, overridingRules: RuleDef[] = []): Builder<T | U> {
    const rules: Record<string, RuleDef> = { ...builder.rules };

    for (const iter of Object.values(this.rules)) {
      const rule = <RuleDef> iter;
      if (rules[rule.name] === undefined) {
        rules[rule.name] = rule;
      } else {
        const existingRule = rules[rule.name];
        // If same rule, no issue, move on
        if (existingRule !== rule) {
          const override = overridingRules.find(r => r.name === rule.name);
          // If override specified, take override, else, inform user that there is a conflict
          if (override) {
            rules[rule.name] = override;
          } else {
            throw new Error(`Rule ${rule.name} already exists in the builder, specify an override to resolve conflict`);
          }
        }
      }
    }
    const res = new Builder<T | U>(this.productionBuild);
    res.rules = <Record<T | U, RuleDef<T | U, unknown, unknown[]>>> rules;
    return res;
  }

  public consume(tokenVocabulary: TokenVocabulary):
    EmbeddedActionsParser & Record<T, ParserMethod<unknown[], CstNode>> {
    const rules = this.rules;
    class MyParser extends EmbeddedActionsParser {
      public constructor() {
        super(tokenVocabulary, {
          // RecoveryEnabled: true,
          // TODO: enable these and test correctness again!
          // Spec states we have an LL(1) grammar.
          maxLookahead: 1,
          // SkipValidations: true,
        });
        const selfRef: CstDef = {
          CONSUME: (tokenType, option) => this.CONSUME(tokenType, option),
          CONSUME1: (tokenType, option) => this.CONSUME1(tokenType, option),
          CONSUME2: (tokenType, option) => this.CONSUME2(tokenType, option),
          CONSUME3: (tokenType, option) => this.CONSUME3(tokenType, option),
          CONSUME4: (tokenType, option) => this.CONSUME4(tokenType, option),
          CONSUME5: (tokenType, option) => this.CONSUME5(tokenType, option),
          CONSUME6: (tokenType, option) => this.CONSUME6(tokenType, option),
          CONSUME7: (tokenType, option) => this.CONSUME7(tokenType, option),
          CONSUME8: (tokenType, option) => this.CONSUME8(tokenType, option),
          CONSUME9: (tokenType, option) => this.CONSUME9(tokenType, option),
          OPTION: actionORMethodDef => this.OPTION(actionORMethodDef),
          OPTION1: actionORMethodDef => this.OPTION1(actionORMethodDef),
          OPTION2: actionORMethodDef => this.OPTION2(actionORMethodDef),
          OPTION3: actionORMethodDef => this.OPTION3(actionORMethodDef),
          OPTION4: actionORMethodDef => this.OPTION4(actionORMethodDef),
          OPTION5: actionORMethodDef => this.OPTION5(actionORMethodDef),
          OPTION6: actionORMethodDef => this.OPTION6(actionORMethodDef),
          OPTION7: actionORMethodDef => this.OPTION7(actionORMethodDef),
          OPTION8: actionORMethodDef => this.OPTION8(actionORMethodDef),
          OPTION9: actionORMethodDef => this.OPTION9(actionORMethodDef),
          OR: altsOrOpts => this.OR(altsOrOpts),
          OR1: altsOrOpts => this.OR1(altsOrOpts),
          OR2: altsOrOpts => this.OR2(altsOrOpts),
          OR3: altsOrOpts => this.OR3(altsOrOpts),
          OR4: altsOrOpts => this.OR4(altsOrOpts),
          OR5: altsOrOpts => this.OR5(altsOrOpts),
          OR6: altsOrOpts => this.OR6(altsOrOpts),
          OR7: altsOrOpts => this.OR7(altsOrOpts),
          OR8: altsOrOpts => this.OR8(altsOrOpts),
          OR9: altsOrOpts => this.OR9(altsOrOpts),
          MANY: actionORMethodDef => this.MANY(actionORMethodDef),
          MANY1: actionORMethodDef => this.MANY1(actionORMethodDef),
          MANY2: actionORMethodDef => this.MANY2(actionORMethodDef),
          MANY3: actionORMethodDef => this.MANY3(actionORMethodDef),
          MANY4: actionORMethodDef => this.MANY4(actionORMethodDef),
          MANY5: actionORMethodDef => this.MANY5(actionORMethodDef),
          MANY6: actionORMethodDef => this.MANY6(actionORMethodDef),
          MANY7: actionORMethodDef => this.MANY7(actionORMethodDef),
          MANY8: actionORMethodDef => this.MANY8(actionORMethodDef),
          MANY9: actionORMethodDef => this.MANY9(actionORMethodDef),
          MANY_SEP: options => this.MANY_SEP(options),
          MANY_SEP1: options => this.MANY_SEP1(options),
          MANY_SEP2: options => this.MANY_SEP2(options),
          MANY_SEP3: options => this.MANY_SEP3(options),
          MANY_SEP4: options => this.MANY_SEP4(options),
          MANY_SEP5: options => this.MANY_SEP5(options),
          MANY_SEP6: options => this.MANY_SEP6(options),
          MANY_SEP7: options => this.MANY_SEP7(options),
          MANY_SEP8: options => this.MANY_SEP8(options),
          MANY_SEP9: options => this.MANY_SEP9(options),
          AT_LEAST_ONE: actionORMethodDef => this.AT_LEAST_ONE(actionORMethodDef),
          AT_LEAST_ONE1: actionORMethodDef => this.AT_LEAST_ONE1(actionORMethodDef),
          AT_LEAST_ONE2: actionORMethodDef => this.AT_LEAST_ONE2(actionORMethodDef),
          AT_LEAST_ONE3: actionORMethodDef => this.AT_LEAST_ONE3(actionORMethodDef),
          AT_LEAST_ONE4: actionORMethodDef => this.AT_LEAST_ONE4(actionORMethodDef),
          AT_LEAST_ONE5: actionORMethodDef => this.AT_LEAST_ONE5(actionORMethodDef),
          AT_LEAST_ONE6: actionORMethodDef => this.AT_LEAST_ONE6(actionORMethodDef),
          AT_LEAST_ONE7: actionORMethodDef => this.AT_LEAST_ONE7(actionORMethodDef),
          AT_LEAST_ONE8: actionORMethodDef => this.AT_LEAST_ONE8(actionORMethodDef),
          AT_LEAST_ONE9: actionORMethodDef => this.AT_LEAST_ONE9(actionORMethodDef),
          AT_LEAST_ONE_SEP: options => this.AT_LEAST_ONE_SEP(options),
          AT_LEAST_ONE_SEP1: options => this.AT_LEAST_ONE_SEP1(options),
          AT_LEAST_ONE_SEP2: options => this.AT_LEAST_ONE_SEP2(options),
          AT_LEAST_ONE_SEP3: options => this.AT_LEAST_ONE_SEP3(options),
          AT_LEAST_ONE_SEP4: options => this.AT_LEAST_ONE_SEP4(options),
          AT_LEAST_ONE_SEP5: options => this.AT_LEAST_ONE_SEP5(options),
          AT_LEAST_ONE_SEP6: options => this.AT_LEAST_ONE_SEP6(options),
          AT_LEAST_ONE_SEP7: options => this.AT_LEAST_ONE_SEP7(options),
          AT_LEAST_ONE_SEP8: options => this.AT_LEAST_ONE_SEP8(options),
          AT_LEAST_ONE_SEP9: options => this.AT_LEAST_ONE_SEP9(options),
          ACTION: func => this.ACTION(func),
          BACKTRACK: (cstDef, ...args) => {
            try {
              // eslint-disable-next-line ts/ban-ts-comment
              // @ts-expect-error TS7053
              // eslint-disable-next-line ts/no-unsafe-argument
              return this.BACKTRACK(this[cstDef.name], { ARGS: args });
            } catch (error: unknown) {
              // eslint-disable-next-line no-console
              console.error(`Error with subrule: ${cstDef.name}`);
              throw error;
            }
          },
          SUBRULE: (cstDef, ...args) => {
            try {
              // eslint-disable-next-line ts/ban-ts-comment
              // @ts-expect-error TS7053
              // eslint-disable-next-line ts/no-unsafe-argument
              return this.SUBRULE(this[cstDef.name], { ARGS: args });
            } catch (error: unknown) {
              // eslint-disable-next-line no-console
              console.error(`Error with subrule: ${cstDef.name}`);
              throw error;
            }
          },
          SUBRULE1: (cstDef, ...args) => {
            try {
              // eslint-disable-next-line ts/ban-ts-comment
              // @ts-expect-error TS7053
              // eslint-disable-next-line ts/no-unsafe-argument
              return this.SUBRULE1(this[cstDef.name], { ARGS: args });
            } catch (error: unknown) {
              // eslint-disable-next-line no-console
              console.error(`Error with subrule: ${cstDef.name}`);
              throw error;
            }
          },
          SUBRULE2: (cstDef, ...args) => {
            try {
              // eslint-disable-next-line ts/ban-ts-comment
              // @ts-expect-error TS7053
              // eslint-disable-next-line ts/no-unsafe-argument
              return this.SUBRULE2(this[cstDef.name], { ARGS: args });
            } catch (error: unknown) {
              // eslint-disable-next-line no-console
              console.error(`Error with subrule: ${cstDef.name}`);
              throw error;
            }
          },
          SUBRULE3: (cstDef, ...args) => {
            try {
              // eslint-disable-next-line ts/ban-ts-comment
              // @ts-expect-error TS7053
              // eslint-disable-next-line ts/no-unsafe-argument
              return this.SUBRULE3(this[cstDef.name], { ARGS: args });
            } catch (error: unknown) {
              // eslint-disable-next-line no-console
              console.error(`Error with subrule: ${cstDef.name}`);
              throw error;
            }
          },
          SUBRULE4: (cstDef, ...args) => {
            try {
              // eslint-disable-next-line ts/ban-ts-comment
              // @ts-expect-error TS7053
              // eslint-disable-next-line ts/no-unsafe-argument
              return this.SUBRULE4(this[cstDef.name], { ARGS: args });
            } catch (error: unknown) {
              // eslint-disable-next-line no-console
              console.error(`Error with subrule: ${cstDef.name}`);
              throw error;
            }
          },
          SUBRULE5: (cstDef, ...args) => {
            try {
              // eslint-disable-next-line ts/ban-ts-comment
              // @ts-expect-error TS7053
              // eslint-disable-next-line ts/no-unsafe-argument
              return this.SUBRULE5(this[cstDef.name], { ARGS: args });
            } catch (error: unknown) {
              // eslint-disable-next-line no-console
              console.error(`Error with subrule: ${cstDef.name}`);
              throw error;
            }
          },
          SUBRULE6: (cstDef, ...args) => {
            try {
              // eslint-disable-next-line ts/ban-ts-comment
              // @ts-expect-error TS7053
              // eslint-disable-next-line ts/no-unsafe-argument
              return this.SUBRULE6(this[cstDef.name], { ARGS: args });
            } catch (error: unknown) {
              // eslint-disable-next-line no-console
              console.error(`Error with subrule: ${cstDef.name}`);
              throw error;
            }
          },
          SUBRULE7: (cstDef, ...args) => {
            try {
              // eslint-disable-next-line ts/ban-ts-comment
              // @ts-expect-error TS7053
              // eslint-disable-next-line ts/no-unsafe-argument
              return this.SUBRULE7(this[cstDef.name], { ARGS: args });
            } catch (error: unknown) {
              // eslint-disable-next-line no-console
              console.error(`Error with subrule: ${cstDef.name}`);
              throw error;
            }
          },
          SUBRULE8: (cstDef, ...args) => {
            try {
              // eslint-disable-next-line ts/ban-ts-comment
              // @ts-expect-error TS7053
              // eslint-disable-next-line ts/no-unsafe-argument
              return this.SUBRULE8(this[cstDef.name], { ARGS: args });
            } catch (error: unknown) {
              // eslint-disable-next-line no-console
              console.error(`Error with subrule: ${cstDef.name}`);
              throw error;
            }
          },
          SUBRULE9: (cstDef, ...args) => {
            try {
              // eslint-disable-next-line ts/ban-ts-comment
              // @ts-expect-error TS7053
              // eslint-disable-next-line ts/no-unsafe-argument
              return this.SUBRULE9(this[cstDef.name], { ARGS: args });
            } catch (error: unknown) {
              // eslint-disable-next-line no-console
              console.error(`Error with subrule: ${cstDef.name}`);
              throw error;
            }
          },
        };
        const implArgs: ImplArgs = {
          ...selfRef,
          cache: new WeakMap(),
          prefixes: {},
        };

        for (const rule of Object.values(rules)) {
          // eslint-disable-next-line ts/ban-ts-comment
          // @ts-expect-error TS7053
          // eslint-disable-next-line ts/no-unsafe-argument
          this[rule.name] = this.RULE(rule.name, rule.impl(implArgs));
        }

        this.performSelfAnalysis();
      }
    }
    const parser = <EmbeddedActionsParser & Record<string, ParserMethod<unknown[], CstNode>>> <unknown> new MyParser();

    return parser;
  }
}
