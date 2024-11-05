import type {
  AtLeastOneSepMethodOpts,
  DSLMethodOpts,
  DSLMethodOptsWithErr,
  GrammarAction,
  IOrAlt,
  IRuleConfig,
  ManySepMethodOpts,
  OrMethodOpts,
  ParserMethod,
  SubruleMethodOpts,
} from '@chevrotain/types';
import { CstParser } from 'chevrotain';
import type { ConsumeMethodOpts, IToken, TokenType, CstNode } from 'chevrotain';

export class OpenParser extends CstParser {
  /**
   * Creates a Grammar Rule
   *
   * Note that any parameters of your implementation must be optional as it will
   * be called without parameters during the grammar recording phase.
   */
  public override RULE<F extends () => void>(name: string, implementation: F, config?: IRuleConfig<CstNode>):
  ParserMethod<Parameters<F>, CstNode> {
    return super.RULE(name, implementation, config);
  }

  public override performSelfAnalysis(): void {
    return super.performSelfAnalysis();
  }

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
  public override CONSUME(tokType: TokenType, options?: ConsumeMethodOpts): IToken {
    return super.CONSUME(tokType, options);
  }

  public override CONSUME1(tokType: TokenType, options?: ConsumeMethodOpts): IToken {
    return super.CONSUME1(tokType, options);
  }

  public override CONSUME2(tokType: TokenType, options?: ConsumeMethodOpts): IToken {
    return super.CONSUME2(tokType, options);
  }

  public override CONSUME3(tokType: TokenType, options?: ConsumeMethodOpts): IToken {
    return super.CONSUME3(tokType, options);
  }

  public override CONSUME4(tokType: TokenType, options?: ConsumeMethodOpts): IToken {
    return super.CONSUME4(tokType, options);
  }

  public override CONSUME5(tokType: TokenType, options?: ConsumeMethodOpts): IToken {
    return super.CONSUME5(tokType, options);
  }

  public override CONSUME6(tokType: TokenType, options?: ConsumeMethodOpts): IToken {
    return super.CONSUME6(tokType, options);
  }

  public override CONSUME7(tokType: TokenType, options?: ConsumeMethodOpts): IToken {
    return super.CONSUME7(tokType, options);
  }

  public override CONSUME8(tokType: TokenType, options?: ConsumeMethodOpts): IToken {
    return super.CONSUME8(tokType, options);
  }

  public override CONSUME9(tokType: TokenType, options?: ConsumeMethodOpts): IToken {
    return super.CONSUME9(tokType, options);
  }

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
  public override OPTION<OUT>(actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>): OUT | undefined {
    return super.OPTION(actionORMethodDef);
  }

  public override OPTION1<OUT>(actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>): OUT | undefined {
    return super.OPTION1(actionORMethodDef);
  }

  public override OPTION2<OUT>(actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>): OUT | undefined {
    return super.OPTION2(actionORMethodDef);
  }

  public override OPTION3<OUT>(actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>): OUT | undefined {
    return super.OPTION3(actionORMethodDef);
  }

  public override OPTION4<OUT>(actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>): OUT | undefined {
    return super.OPTION4(actionORMethodDef);
  }

  public override OPTION5<OUT>(actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>): OUT | undefined {
    return super.OPTION5(actionORMethodDef);
  }

  public override OPTION6<OUT>(actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>): OUT | undefined {
    return super.OPTION6(actionORMethodDef);
  }

  public override OPTION7<OUT>(actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>): OUT | undefined {
    return super.OPTION7(actionORMethodDef);
  }

  public override OPTION8<OUT>(actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>): OUT | undefined {
    return super.OPTION8(actionORMethodDef);
  }

  public override OPTION9<OUT>(actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>): OUT | undefined {
    return super.OPTION9(actionORMethodDef);
  }

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
  public override OR<T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>): T {
    return super.OR(altsOrOpts);
  }

  public override OR1<T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>): T {
    return super.OR1(altsOrOpts);
  }

  public override OR2<T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>): T {
    return super.OR2(altsOrOpts);
  }

  public override OR3<T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>): T {
    return super.OR3(altsOrOpts);
  }

  public override OR4<T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>): T {
    return super.OR4(altsOrOpts);
  }

  public override OR5<T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>): T {
    return super.OR5(altsOrOpts);
  }

  public override OR6<T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>): T {
    return super.OR6(altsOrOpts);
  }

  public override OR7<T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>): T {
    return super.OR7(altsOrOpts);
  }

  public override OR8<T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>): T {
    return super.OR8(altsOrOpts);
  }

  public override OR9<T>(altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>): T {
    return super.OR9(altsOrOpts);
  }

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
  public override MANY(actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>): void {
    return super.MANY(actionORMethodDef);
  }

  public override MANY1(actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>): void {
    return super.MANY1(actionORMethodDef);
  }

  public override MANY2(actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>): void {
    return super.MANY2(actionORMethodDef);
  }

  public override MANY3(actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>): void {
    return super.MANY3(actionORMethodDef);
  }

  public override MANY4(actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>): void {
    return super.MANY4(actionORMethodDef);
  }

  public override MANY5(actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>): void {
    return super.MANY5(actionORMethodDef);
  }

  public override MANY6(actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>): void {
    return super.MANY6(actionORMethodDef);
  }

  public override MANY7(actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>): void {
    return super.MANY7(actionORMethodDef);
  }

  public override MANY8(actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>): void {
    return super.MANY8(actionORMethodDef);
  }

  public override MANY9(actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>): void {
    return super.MANY9(actionORMethodDef);
  }

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
  public override MANY_SEP(options: ManySepMethodOpts<any>): void {
    return super.MANY_SEP(options);
  }

  public override MANY_SEP1(options: ManySepMethodOpts<any>): void {
    return super.MANY_SEP1(options);
  }

  public override MANY_SEP2(options: ManySepMethodOpts<any>): void {
    return super.MANY_SEP2(options);
  }

  public override MANY_SEP3(options: ManySepMethodOpts<any>): void {
    return super.MANY_SEP3(options);
  }

  public override MANY_SEP4(options: ManySepMethodOpts<any>): void {
    return super.MANY_SEP4(options);
  }

  public override MANY_SEP5(options: ManySepMethodOpts<any>): void {
    return super.MANY_SEP5(options);
  }

  public override MANY_SEP6(options: ManySepMethodOpts<any>): void {
    return super.MANY_SEP6(options);
  }

  public override MANY_SEP7(options: ManySepMethodOpts<any>): void {
    return super.MANY_SEP7(options);
  }

  public override MANY_SEP8(options: ManySepMethodOpts<any>): void {
    return super.MANY_SEP8(options);
  }

  public override MANY_SEP9(options: ManySepMethodOpts<any>): void {
    return super.MANY_SEP9(options);
  }

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
  public override AT_LEAST_ONE(actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>): void {
    return super.AT_LEAST_ONE(actionORMethodDef);
  }

  public override AT_LEAST_ONE1(actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>): void {
    return super.AT_LEAST_ONE1(actionORMethodDef);
  }

  public override AT_LEAST_ONE2(actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>): void {
    return super.AT_LEAST_ONE2(actionORMethodDef);
  }

  public override AT_LEAST_ONE3(actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>): void {
    return super.AT_LEAST_ONE3(actionORMethodDef);
  }

  public override AT_LEAST_ONE4(actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>): void {
    return super.AT_LEAST_ONE4(actionORMethodDef);
  }

  public override AT_LEAST_ONE5(actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>): void {
    return super.AT_LEAST_ONE5(actionORMethodDef);
  }

  public override AT_LEAST_ONE6(actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>): void {
    return super.AT_LEAST_ONE6(actionORMethodDef);
  }

  public override AT_LEAST_ONE7(actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>): void {
    return super.AT_LEAST_ONE7(actionORMethodDef);
  }

  public override AT_LEAST_ONE8(actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>): void {
    return super.AT_LEAST_ONE8(actionORMethodDef);
  }

  public override AT_LEAST_ONE9(actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>): void {
    return super.AT_LEAST_ONE9(actionORMethodDef);
  }

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
  public override AT_LEAST_ONE_SEP(options: AtLeastOneSepMethodOpts<any>): void {
    return super.AT_LEAST_ONE_SEP(options);
  }

  public override AT_LEAST_ONE_SEP1(options: AtLeastOneSepMethodOpts<any>): void {
    return super.AT_LEAST_ONE_SEP1(options);
  }

  public override AT_LEAST_ONE_SEP2(options: AtLeastOneSepMethodOpts<any>): void {
    return super.AT_LEAST_ONE_SEP2(options);
  }

  public override AT_LEAST_ONE_SEP3(options: AtLeastOneSepMethodOpts<any>): void {
    return super.AT_LEAST_ONE_SEP3(options);
  }

  public override AT_LEAST_ONE_SEP4(options: AtLeastOneSepMethodOpts<any>): void {
    return super.AT_LEAST_ONE_SEP4(options);
  }

  public override AT_LEAST_ONE_SEP5(options: AtLeastOneSepMethodOpts<any>): void {
    return super.AT_LEAST_ONE_SEP5(options);
  }

  public override AT_LEAST_ONE_SEP6(options: AtLeastOneSepMethodOpts<any>): void {
    return super.AT_LEAST_ONE_SEP6(options);
  }

  public override AT_LEAST_ONE_SEP7(options: AtLeastOneSepMethodOpts<any>): void {
    return super.AT_LEAST_ONE_SEP7(options);
  }

  public override AT_LEAST_ONE_SEP8(options: AtLeastOneSepMethodOpts<any>): void {
    return super.AT_LEAST_ONE_SEP8(options);
  }

  public override AT_LEAST_ONE_SEP9(options: AtLeastOneSepMethodOpts<any>): void {
    return super.AT_LEAST_ONE_SEP9(options);
  }

  public override SUBRULE<ARGS extends unknown[]>(
    ruleToCall: ParserMethod<ARGS, CstNode>,
    options?: SubruleMethodOpts<ARGS>,
  ): CstNode {
    return super.SUBRULE(ruleToCall, options);
  }

  public override SUBRULE1<ARGS extends unknown[]>(
    ruleToCall: ParserMethod<ARGS, CstNode>,
    options?: SubruleMethodOpts<ARGS>,
  ): CstNode {
    return super.SUBRULE1(ruleToCall, options);
  }

  public override SUBRULE2<ARGS extends unknown[]>(
    ruleToCall: ParserMethod<ARGS, CstNode>,
    options?: SubruleMethodOpts<ARGS>,
  ): CstNode {
    return super.SUBRULE2(ruleToCall, options);
  }

  public override SUBRULE3<ARGS extends unknown[]>(
    ruleToCall: ParserMethod<ARGS, CstNode>,
    options?: SubruleMethodOpts<ARGS>,
  ): CstNode {
    return super.SUBRULE3(ruleToCall, options);
  }

  public override SUBRULE4<ARGS extends unknown[]>(
    ruleToCall: ParserMethod<ARGS, CstNode>,
    options?: SubruleMethodOpts<ARGS>,
  ): CstNode {
    return super.SUBRULE4(ruleToCall, options);
  }

  public override SUBRULE5<ARGS extends unknown[]>(
    ruleToCall: ParserMethod<ARGS, CstNode>,
    options?: SubruleMethodOpts<ARGS>,
  ): CstNode {
    return super.SUBRULE5(ruleToCall, options);
  }

  public override SUBRULE6<ARGS extends unknown[]>(
    ruleToCall: ParserMethod<ARGS, CstNode>,
    options?: SubruleMethodOpts<ARGS>,
  ): CstNode {
    return super.SUBRULE6(ruleToCall, options);
  }

  public override SUBRULE7<ARGS extends unknown[]>(
    ruleToCall: ParserMethod<ARGS, CstNode>,
    options?: SubruleMethodOpts<ARGS>,
  ): CstNode {
    return super.SUBRULE7(ruleToCall, options);
  }

  public override SUBRULE8<ARGS extends unknown[]>(
    ruleToCall: ParserMethod<ARGS, CstNode>,
    options?: SubruleMethodOpts<ARGS>,
  ): CstNode {
    return super.SUBRULE8(ruleToCall, options);
  }

  public override SUBRULE9<ARGS extends unknown[]>(
    ruleToCall: ParserMethod<ARGS, CstNode>,
    options?: SubruleMethodOpts<ARGS>,
  ): CstNode {
    return super.SUBRULE9(ruleToCall, options);
  }
}
