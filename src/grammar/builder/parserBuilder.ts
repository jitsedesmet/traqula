/* eslint-disable ts/ban-ts-comment */
import type { ILexerConfig, IParserConfig } from '@chevrotain/types';
import type { TokenType, TokenVocabulary } from 'chevrotain';
import { EmbeddedActionsParser, Lexer } from 'chevrotain';
import { DataFactory } from 'rdf-data-factory';
import type {
  CheckOverlap,
  RuleDefMap,
  ParserFromRules,
  RuleListToObject,
  RuleNamesFromList,
  ParseMethodsFromRules,
} from './builderTypes.js';
import type { CstDef, ImplArgs, RuleDef } from './ruleDefTypes.js';

function listToRuleDefMap<T extends readonly RuleDef[]>(rules: T): RuleListToObject<T> {
  const newRules: Record<string, RuleDef> = {};
  for (const rule of rules) {
    newRules[rule.name] = rule;
  }
  return <RuleListToObject<T>>newRules;
}

export class Builder<Names extends string, RuleDefs extends RuleDefMap<Names>> {
  public static createBuilder<
    Rules extends readonly RuleDef[] = RuleDef[],
    Names extends string = RuleNamesFromList<Rules>,
    // @ts-expect-error TS2344
    RuleDefs extends RuleDefMap<Names> = RuleDefsToRecord<Rules>,
// eslint-disable-next-line antfu/consistent-list-newline
>(start: Rules | Builder<Names, RuleDefs>): Builder<Names, RuleDefs> {
    if (start instanceof Builder) {
      return new Builder({ ...start.rules });
    }
    // @ts-expect-error TS2344
    return new Builder(listToRuleDefMap(start));
  }

  private rules: RuleDefs;

  private constructor(startRules: RuleDefs) {
    this.rules = startRules;
  }

  public patchRule<U extends Names, RET, ARGS extends unknown[]>(patch: RuleDef<U, RET, ARGS>):
  // @ts-expect-error TS2344
  Builder<Names, {[Key in Names]: Key extends U ? RuleDef<Key, RET, ARGS> : RuleDefs[Key] }> {
    // @ts-expect-error TS2322
    this.rules[patch.name] = patch;
    // @ts-expect-error TS2344
    return <Builder<Names, Omit<RuleDefs, U> & Record<U, RuleDef<U, RET, ARGS>>>> this;
  }

  public addRuleRedundant<U extends string, RET, ARGS extends undefined[]>(rule: RuleDef<U, RET, ARGS>):
  // @ts-expect-error TS2344
  Builder<Names | U, {[K in Names | U]: K extends U ? RuleDef<K, RET, ARGS> : RuleDefs[K] }> {
    const rules = <Record<string, RuleDef>> this.rules;
    if (rules[rule.name] !== undefined && rules[rule.name] !== rule) {
      throw new Error(`Rule ${rule.name} already exists in the builder`);
    }
    // @ts-expect-error TS2536
    this.rules[rule.name] = rule;
    // @ts-expect-error TS2536
    return <Builder<Names | U, RuleDefs | Record<U, RuleDef<U, RET, ARGS>>>> <unknown> this;
  }

  public addRule<U extends string, RET, ARGS extends unknown[]>(
    rule: CheckOverlap<U, Names, RuleDef<U, RET, ARGS>>,
    // @ts-expect-error TS2536
  ): Builder<Names | U, {[K in Names | U]: K extends U ? RuleDef<K, RET, ARGS> : RuleDefs[K] }> {
    return this.addRuleRedundant(rule);
  }

  public addMany<U extends RuleDef[]>(
    ...rules: CheckOverlap<RuleNamesFromList<U>, Names, U>
    // @ts-expect-error TS2536
  ): Builder<Names | RuleNamesFromList<U>, RuleDefs & RuleListToObject<U>> {
    this.rules = { ...this.rules, ...listToRuleDefMap(rules) };
    // @ts-expect-error TS2536
    return <Builder<Names | RuleNamesFromList<U>, RuleDefs & RuleListToObject<U>>> <unknown> this;
  }

  public deleteRule<U extends Names>(ruleName: U):
  // @ts-expect-error TS2536
  Builder<Exclude<Names, U>, Omit<RuleDefs, U>> {
    delete this.rules[ruleName];
    // @ts-expect-error TS2536
    return <Builder<Exclude<Names, U>, Omit<RuleDefs, U>>> <unknown> this;
  }

  public merge<OtherNames extends string, OtherRules extends RuleDefMap<OtherNames>, OW extends RuleDef[]>(
    builder: Builder<OtherNames, OtherRules>,
    overridingRules: OW,
  ):
    Builder<
      Names | OtherNames | RuleNamesFromList<OW>,
      // @ts-expect-error TS2344
      {[K in Names | OtherNames | RuleNamesFromList<OW>]: K extends Names | OtherNames ? (
        K extends Names ? RuleDefs[K] : (K extends OtherNames ? OtherRules[K] : never)
      ) : (K extends keyof RuleListToObject<OW> ? RuleListToObject<OW>[K] : never) }
    > {
    // Assume the other grammar is bigger than yours. So start from that one and add this one
    const otherRules: Record<string, RuleDef> = { ...builder.rules };
    const myRules: Record<string, RuleDef> = this.rules;

    for (const rule of Object.values(myRules)) {
      if (otherRules[rule.name] === undefined) {
        otherRules[rule.name] = rule;
      } else {
        const existingRule = otherRules[rule.name];
        // If same rule, no issue, move on. Else
        if (existingRule !== rule) {
          const override = overridingRules.find(x => x.name === rule.name);
          // If override specified, take override, else, inform user that there is a conflict
          if (override) {
            otherRules[rule.name] = override;
          } else {
            throw new Error(`Rule with name "${rule.name}" already exists in the builder, specify an override to resolve conflict`);
          }
        }
      }
    }

    // @ts-expect-error TS2322
    this.rules = otherRules;
    // @ts-expect-error TS2322
    return this;
  }

  public consumeToParser({ tokenVocabulary, parserConfig = {}, lexerConfig = {}}: {
    tokenVocabulary: TokenType[];
    parserConfig?: IParserConfig;
    lexerConfig?: ILexerConfig;
  }, context: Partial<ImplArgs['context']> = {}): ParserFromRules<Names, RuleDefs> {
    const lexer: Lexer = new Lexer(tokenVocabulary, {
      positionTracking: 'onlyStart',
      recoveryEnabled: false,
      skipValidations: true,
      ensureOptimizations: true,
      ...lexerConfig,
    });
    const parser = this.consume({ tokenVocabulary, config: parserConfig }, context);
    const selfSufficientParser: Partial<ParserFromRules<Names, RuleDefs>> = {};
    // eslint-disable-next-line ts/no-unnecessary-type-assertion
    for (const rule of <RuleDef<Names>[]> Object.values(this.rules)) {
      // @ts-expect-error TS7053
      selfSufficientParser[rule.name] = (input: string, ...args: unknown[]) => {
        const lexResult = lexer.tokenize(input);
        parser.reset();
        parser.input = lexResult.tokens;
        const result = parser[rule.name](...args);
        if (parser.errors.length > 0) {
          throw new Error(`Parse error on line ${parser.errors[0].token.startLine}`);
        }
        return result;
      };
    }
    return <ParserFromRules<Names, RuleDefs>> selfSufficientParser;
  }

  public consume({ tokenVocabulary, config = {}}: {
    tokenVocabulary: TokenVocabulary;
    config?: IParserConfig;
  }, context: Partial<ImplArgs['context']> = {}): EmbeddedActionsParser & ParseMethodsFromRules<Names, RuleDefs> {
    const rules = this.rules;
    class MyParser extends EmbeddedActionsParser {
      private readonly initialParseContext: ImplArgs['context'];
      private readonly runningContext: ImplArgs['context'];

      public constructor() {
        super(tokenVocabulary, {
          // RecoveryEnabled: true,
          maxLookahead: 1,
          // SkipValidations: true,
          ...config,
        });

        const selfRef = this.getSelfRef();
        this.initialParseContext = {
          dataFactory: new DataFactory({ blankNodePrefix: 'g_' }),
          baseIRI: undefined,
          ...context,
          prefixes: context.prefixes ? { ...context.prefixes } : {},
        };
        this.runningContext = { ...this.initialParseContext };

        const implArgs: ImplArgs = {
          ...selfRef,
          cache: new WeakMap(),
          context: this.runningContext,
        };

        for (const rule of Object.values(<Record<string, RuleDef>>rules)) {
          // @ts-expect-error TS7053
          this[rule.name] = this.RULE(rule.name, rule.impl(implArgs));
        }
        this.performSelfAnalysis();
      }

      public override reset(): void {
        super.reset();
        Object.assign(this.runningContext, this.initialParseContext);
        this.runningContext.prefixes = { ...this.initialParseContext.prefixes };
      }

      private getSelfRef(): CstDef {
        return {
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
      }
    }
    return <EmbeddedActionsParser & ParseMethodsFromRules<Names, RuleDefs>><unknown> new MyParser();
  }
}
