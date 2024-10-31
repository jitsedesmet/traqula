// Keeping optimization in mind: https://chevrotain.io/docs/guide/performance.html

import {CstParser, DSLMethodOpts, GrammarAction, TokenType} from "chevrotain";
import * as l from "../lexer/";
import {BuiltInCalls} from "../lexer/BuildinCalls";

function unCapitalize(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
}

function exprFunc1(func: TokenType) {
    return this.RULE(unCapitalize(func.name), () => {
        this.CONSUME(func);
        this.CONSUME(l.symbols.LParen);
        this.SUBRULE(this.expression);
        this.CONSUME(l.symbols.RParen);
    });
}
function exprFunc2 (func: TokenType){
    return this.RULE(unCapitalize(func.name), () => {
        this.CONSUME(func);
        this.CONSUME(l.symbols.LParen);
        this.SUBRULE1(this.expression);
        this.CONSUME(l.symbols.comma);
        this.SUBRULE2(this.expression);
        this.CONSUME(l.symbols.RParen);
    });
}
function varFunc1(func: TokenType){
    return this.RULE(unCapitalize(func.name), () => {
        this.CONSUME(func);
        this.CONSUME(l.symbols.LParen);
        this.SUBRULE(this.var);
        this.CONSUME(l.symbols.RParen);
    });
}
function exprOrNilFunc1(func: TokenType) {
    return this.RULE(unCapitalize(func.name), () => {
        this.CONSUME(func);
        this.OR([
            {ALT: () => {
                    this.CONSUME(l.symbols.LParen);
                    this.SUBRULE(this.expression);
                    this.CONSUME(l.symbols.RParen);
                }},
            {ALT: () => this.CONSUME(l.terminals.nil)}
        ]);
    });
}
function nilFunc1(func: TokenType) {
    return this.RULE(unCapitalize(func.name), () => {
        this.CONSUME(func);
        this.CONSUME(l.terminals.nil);
    });
}
function exprListFunc1(func: TokenType) {
    return this.RULE(unCapitalize(func.name), () => {
        this.CONSUME(func);
        this.SUBRULE(this.expressionList);
    });
}
function baseAggregateFunc(func: TokenType){
    return this.RULE(unCapitalize(func.name), () => {
        this.CONSUME(func);
        this.CONSUME(l.symbols.LParen);
        this.OPTION(() => { this.CONSUME(l.distinct) });
        this.OR([
            {ALT: () => this.CONSUME(l.symbols.star)},
            {ALT: () => this.SUBRULE(this.expression)},
        ]);
        this.CONSUME(l.symbols.RParen);
    });
}

export class SparqlParser extends CstParser {
    public constructor() {
        super(l.allTokens);

        this.performSelfAnalysis()
    }

    public queryUnit = this.RULE('queryUnit', () => {
        this.SUBRULE(this.query)
    });

    private query = this.RULE('query', () => {
        this.SUBRULE(this.prologue);
        this.OR([
            {ALT: () => this.SUBRULE(this.selectQuery)},
            {ALT: () => this.SUBRULE(this.constructQuery)},
            {ALT: () => this.SUBRULE(this.describeQuery)},
            {ALT: () => this.SUBRULE(this.askQuery)}
        ])
        this.SUBRULE(this.valuesClause);
    });

    private updateUnit = this.RULE('updateUnit', () => {
        this.SUBRULE(this.update);
    });

    private prologue = this.RULE('prologue', () => {
        this.MANY(() => {
            this.OR([
                {ALT: () => this.SUBRULE(this.baseDecl)},
                {ALT: () => this.SUBRULE(this.prefixDecl)}
            ]);
        });
    });

    private baseDecl = this.RULE('baseDecl', () => {
        this.CONSUME(l.baseDecl);
        this.CONSUME(l.terminals.iriRef);
    });

    private prefixDecl = this.RULE('prefixDecl', () => {
       this.CONSUME(l.prefixDecl);
       this.CONSUME(l.terminals.pNameNs);
       this.CONSUME(l.terminals.iriRef);
    });

    private selectQuery = this.RULE('selectQuery', () => {
        this.SUBRULE(this.selectClause);
        this.MANY(this.datasetClause);
        this.SUBRULE(this.whereClause);
        this.SUBRULE(this.solutionModifier);
    });

    private subSelect = this.RULE('subSelect', () => {
        this.SUBRULE(this.selectClause);
        this.SUBRULE(this.whereClause);
        this.SUBRULE(this.solutionModifier);
        this.SUBRULE(this.valuesClause);
    });

    private selectClause = this.RULE('selectClause', () => {
       this.CONSUME(l.select);
       this.OPTION(() => {
           this.OR1([
               {ALT: () => this.CONSUME(l.distinct)},
               {ALT: () => this.CONSUME(l.reduced)}
           ]);
       });
       this.OR2([
          {ALT: () => this.CONSUME(l.symbols.star)},
          {ALT: () => {
              this.AT_LEAST_ONE(() => {
                  this.OR3([
                        {ALT: () => this.SUBRULE1(this.var)},
                        {ALT: () => {
                            this.CONSUME(l.symbols.LParen);
                            this.SUBRULE(this.expression);
                            this.CONSUME(l.as);
                            this.SUBRULE2(this.var);
                            this.CONSUME(l.symbols.RParen);
                        }}
                  ])
              })
          }}
       ])
    });

    private constructQuery = this.RULE('constructQuery', () => {
       this.CONSUME(l.construct);
       this.OR([
          {ALT: () => {
              this.SUBRULE(this.constructTemplate);
              this.MANY1(() => {
                  this.SUBRULE1(this.datasetClause);
              });
              this.SUBRULE(this.whereClause);
              this.SUBRULE1(this.solutionModifier)
          }},
          {ALT: () => {
              this.MANY2(() => {
                  this.SUBRULE2(this.datasetClause);
              });
              this.CONSUME(l.where);
              this.CONSUME(l.symbols.LCurly);
              this.OPTION(() => {
                  this.SUBRULE(this.triplesTemplate);
              });
              this.CONSUME(l.symbols.RCurly);
              this.SUBRULE2(this.solutionModifier);
          }},
       ]);
    });

    private describeQuery = this.RULE('describeQuery', () => {
        this.CONSUME(l.describe);
        this.OR([
            {ALT: () => this.AT_LEAST_ONE(() => this.SUBRULE(this.varOrIri))},
            {ALT: () => this.CONSUME(l.symbols.star)}
        ])
        this.MANY(() => {
            this.SUBRULE(this.datasetClause);
        });
        this.OPTION(() => {
            this.SUBRULE(this.whereClause);
        });
        this.SUBRULE(this.solutionModifier);
    });

    private askQuery = this.RULE('askQuery', () => {
        this.CONSUME(l.ask);
        this.MANY(() => {
            this.SUBRULE(this.datasetClause);
        });
        this.SUBRULE(this.whereClause);
        this.SUBRULE(this.solutionModifier);
    });

    private datasetClause = this.RULE('datasetClause', () => {
        this.CONSUME(l.from);
        this.OR([
            {ALT: () => this.SUBRULE(this.defaultGraphClause)},
            {ALT: () => this.SUBRULE(this.namedGraphClause)},
        ]);
    });

    private defaultGraphClause = this.RULE('defaultGraphClause', () => {
        this.SUBRULE(this.sourceSelector);
    });

    private namedGraphClause = this.RULE('namedGraphClause', () => {
        this.CONSUME(l.graph.named);
        this.SUBRULE(this.sourceSelector);
    });

    private sourceSelector = this.RULE('sourceSelector', () => {
        this.SUBRULE(this.iri);
    });

    private whereClause = this.RULE('whereClause', () => {
        this.OPTION(() => { this.CONSUME(l.where) });
        this.SUBRULE(this.groupGraphPattern);
    });

    private solutionModifier = this.RULE('solutionModifier', () => {
        this.OPTION1(() => { this.SUBRULE(this.groupClause) });
        this.OPTION2(() => { this.SUBRULE(this.havingClause) });
        this.OPTION3(() => { this.SUBRULE(this.orderClause) });
        this.OPTION4(() => { this.SUBRULE(this.limitOffsetClauses) });
    });

    private groupClause = this.RULE('groupClause', () => {
        this.CONSUME(l.groupBy);
        this.AT_LEAST_ONE(() => {
            this.SUBRULE(this.groupCondition);
        });
    });

    private groupCondition = this.RULE('groupCondition', () => {
       this.OR([
          {ALT: () => this.SUBRULE(this.builtInCall)},
          {ALT: () => this.SUBRULE(this.functionCall)},
          {ALT: () => {
              this.CONSUME(l.symbols.LParen);
              this.SUBRULE(this.expression);
              this.OPTION(() => {
                  this.CONSUME(l.as);
                  this.SUBRULE1(this.var);
              });
              this.CONSUME(l.symbols.RParen);
          }},
          {ALT: () => this.SUBRULE2(this.var)},
       ]);
    });

    private havingClause = this.RULE('havingClause', () => {
        this.CONSUME(l.having);
        this.AT_LEAST_ONE(() => {
            this.SUBRULE(this.havingCondition);
        });
    });

    private havingCondition = this.RULE('havingCondition', () => {
        this.SUBRULE(this.constraint);
    });

    private orderClause = this.RULE('orderClause', () => {
        this.CONSUME(l.order);
        this.AT_LEAST_ONE(() => {
            this.SUBRULE(this.orderCondition);
        });
    });

    private orderCondition = this.RULE('orderCondition', () => {
        this.OR1([
            {ALT: () => {
                this.OR2([
                    {ALT: () => this.CONSUME(l.orderAsc)},
                    {ALT: () => this.CONSUME(l.orderDesc)},
                ]);
                this.SUBRULE(this.brackettedExpression);
            }},
            {ALT: () => this.SUBRULE(this.constraint)},
            {ALT: () => this.SUBRULE(this.var)},
        ]);
    });

    private limitOffsetClauses = this.RULE('limitOffsetClauses', () => {
        this.OR([
            {ALT: () => {
                this.SUBRULE1(this.limitClause);
                this.OPTION1(() => {
                    this.SUBRULE1(this.offsetClause);
                });
            }},
            {ALT: () => {
                this.SUBRULE2(this.offsetClause);
                this.OPTION2(() => {
                    this.SUBRULE2(this.limitClause);
                });
            }},
        ]);
    });

    private limitClause = this.RULE('limitClause', () => {
        this.CONSUME(l.limit);
        this.SUBRULE(this.integer);
    });

    private offsetClause = this.RULE('offsetClause', () => {
        this.CONSUME(l.offset);
        this.SUBRULE(this.integer);
    });

    private valuesClause = this.RULE('valuesClause', () => {
       this.OPTION(() => {
          this.CONSUME(l.values);
          this.SUBRULE(this.dataBlock);
       });
    });

    private update = this.RULE('update', () => {
       this.SUBRULE(this.prologue);
       this.OPTION1(() => {
          this.SUBRULE(this.update1);
          this.OPTION2(() => {
            this.CONSUME(l.symbols.semi);
            this.SUBRULE(this.update);
          });
       });
    });

    private update1 = this.RULE('update1', () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.load)},
            {ALT: () => this.SUBRULE(this.clear)},
            {ALT: () => this.SUBRULE(this.drop)},
            {ALT: () => this.SUBRULE(this.add)},
            {ALT: () => this.SUBRULE(this.move)},
            {ALT: () => this.SUBRULE(this.copy)},
            {ALT: () => this.SUBRULE(this.create)},
            {ALT: () => this.SUBRULE(this.insertData)},
            {ALT: () => this.SUBRULE(this.deleteData)},
            {ALT: () => this.SUBRULE(this.deleteWhere)},
            {ALT: () => this.SUBRULE(this.modify)}
        ]);
    });

    private load = this.RULE('load', () => {
        this.CONSUME(l.load);
        this.OPTION1(() => this.CONSUME(l.silent));
        this.SUBRULE(this.iri);
        this.OPTION2(() => {
            this.CONSUME(l.loadInto);
            this.SUBRULE(this.graphRef);
        });
    });

    private clear = this.RULE('clear', () => {
        this.CONSUME(l.clear);
        this.OPTION(() => this.CONSUME(l.silent));
        this.SUBRULE(this.graphRefAll);
    });

    private drop = this.RULE('drop', () => {
        this.CONSUME(l.drop);
        this.OPTION(() => this.CONSUME(l.silent));
        this.SUBRULE(this.graphRefAll);
    });

    private create = this.RULE('create', () => {
        this.CONSUME(l.create);
        this.OPTION(() => this.CONSUME(l.silent));
        this.SUBRULE(this.graphRef);
    });

    private add = this.RULE('add', () => {
        this.CONSUME(l.add);
        this.OPTION(() => this.CONSUME(l.silent));
        this.SUBRULE1(this.graphOrDefault);
        this.CONSUME(l.to);
        this.SUBRULE2(this.graphOrDefault);
    });

    private move = this.RULE('move', () => {
        this.CONSUME(l.move);
        this.OPTION(() => this.CONSUME(l.silent));
        this.SUBRULE1(this.graphOrDefault);
        this.CONSUME(l.to);
        this.SUBRULE2(this.graphOrDefault);
    });

    private copy = this.RULE('copy', () => {
        this.CONSUME(l.copy);
        this.OPTION(() => this.CONSUME(l.silent));
        this.SUBRULE1(this.graphOrDefault);
        this.CONSUME(l.to);
        this.SUBRULE2(this.graphOrDefault);
    });

    private insertData = this.RULE('insertData', () => {
        this.CONSUME(l.insertData);
        this.SUBRULE(this.quadData);
    });

    private deleteData = this.RULE('deleteData', () => {
        this.CONSUME(l.deleteData);
        this.SUBRULE(this.quadData);
    });

    private deleteWhere = this.RULE('deleteWhere', () => {
        this.CONSUME(l.deleteWhere);
        this.SUBRULE(this.quadPattern);
    });

    private modify = this.RULE('modify', () => {
        this.OPTION1(() => {
            this.CONSUME(l.modifyWith);
            this.SUBRULE(this.iri);
        });
        this.OR([
            {ALT: () => {
                this.SUBRULE(this.deleteClause)
                this.OPTION2(() => this.SUBRULE1(this.insertClause))
            }},
            {ALT: () => this.SUBRULE2(this.insertClause)}
        ]);
        this.MANY(() => this.SUBRULE(this.usingClause));
        this.CONSUME(l.where);
        this.SUBRULE(this.groupGraphPattern);
    });

    private deleteClause = this.RULE('deleteClause', () => {
        this.CONSUME(l.deleteClause);
        this.SUBRULE(this.quadPattern);
    });

    private insertClause = this.RULE('insertClause', () => {
        this.CONSUME(l.insertClause);
        this.SUBRULE(this.quadPattern);
    });

    private usingClause = this.RULE('usingClause', () => {
        this.CONSUME(l.usingClause);
        this.OR([
            {ALT: () => this.SUBRULE1(this.iri)},
            {ALT: () => {
                this.CONSUME(l.graph.named);
                this.SUBRULE2(this.iri);
            }},
        ]);
    });

    private graphOrDefault = this.RULE('graphOrDefault', () => {
        this.OR([
            {ALT: () => this.CONSUME(l.graph.default_)},
            {ALT: () => {
                this.OPTION(() => this.CONSUME(l.graph.graph));
                this.SUBRULE(this.iri);
            }},
        ]);
    });

    private graphRef = this.RULE('graphRef', () => {
        this.CONSUME(l.graph.graph);
        this.SUBRULE(this.iri);
    });

    private graphRefAll = this.RULE('graphRefAll', () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.graphRef)},
            {ALT: () => this.CONSUME(l.graph.default_)},
            {ALT: () => this.CONSUME(l.graph.named)},
            {ALT: () => this.CONSUME(l.graph.graphAll)},
        ]);
    });

    private quadPattern = this.RULE('quadPattern', () => {
        this.CONSUME(l.symbols.LCurly);
        this.SUBRULE(this.quads);
        this.CONSUME(l.symbols.RCurly);
    });

    private quadData = this.RULE('quadData', () => {
        this.CONSUME(l.symbols.LCurly);
        this.SUBRULE(this.quads);
        this.CONSUME(l.symbols.RCurly);
    });

    private quads = this.RULE('quads', () => {
        this.OPTION1(() => { this.SUBRULE1(this.triplesTemplate) });
        this.MANY(() => {
            this.SUBRULE(this.quadsNotTriples);
            this.OPTION2(() => { this.CONSUME(l.symbols.dot) });
            this.OPTION3(() => { this.SUBRULE2(this.triplesTemplate) });
        });
    });

    private quadsNotTriples = this.RULE('quadsNotTriples', () => {
        this.CONSUME(l.graph.graph);
        this.SUBRULE(this.varOrIri);
        this.CONSUME(l.symbols.LCurly);
        this.OPTION(() => { this.SUBRULE(this.triplesTemplate) });
        this.CONSUME(l.symbols.RCurly);
    });

    private triplesTemplate = this.RULE('triplesTemplate', () => {
        this.SUBRULE(this.triplesSameSubject);
        this.OPTION1(() => {
            this.CONSUME(l.symbols.dot);
            this.OPTION2(() => { this.SUBRULE(this.triplesTemplate) });
        });
    });

    private groupGraphPattern = this.RULE('groupGraphPattern', () => {
        this.CONSUME(l.symbols.LCurly);
        this.OR([
            {ALT: () => this.SUBRULE(this.subSelect)},
            {ALT: () => this.SUBRULE(this.groupGraphPatternSub)},
        ])
        this.CONSUME(l.symbols.RCurly);
    });

    private groupGraphPatternSub = this.RULE('groupGraphPatternSub', () => {
       this.OPTION1(() => { this.SUBRULE1(this.triplesBlock) });
       this.MANY(() => {
          this.SUBRULE(this.graphPatternNotTriples);
          this.OPTION2(() => { this.CONSUME(l.symbols.dot) });
          this.OPTION3(() => { this.SUBRULE2(this.triplesBlock) });
       });
    });

    private triplesBlock = this.RULE('triplesBlock', () => {
        this.SUBRULE(this.triplesSameSubjectPath);
        this.OPTION1(() => {
            this.CONSUME(l.symbols.dot);
            this.OPTION2(() => { this.SUBRULE(this.triplesBlock) });
        });
    });

    private graphPatternNotTriples = this.RULE('graphPatternNotTriples', () => {
       this.OR([
           {ALT: () => this.SUBRULE(this.groupOrUnionGraphPattern)},
           {ALT: () => this.SUBRULE(this.optionalGraphPattern)},
           {ALT: () => this.SUBRULE(this.minusGraphPattern)},
           {ALT: () => this.SUBRULE(this.graphGraphPattern)},
           {ALT: () => this.SUBRULE(this.serviceGraphPattern)},
           {ALT: () => this.SUBRULE(this.filter)},
           {ALT: () => this.SUBRULE(this.bind)},
           {ALT: () => this.SUBRULE(this.inlineData)},
       ]);
    });

    private optionalGraphPattern = this.RULE('optionalGraphPattern', () => {
       this.CONSUME(l.optional);
       this.SUBRULE(this.groupGraphPattern);
    });

    private graphGraphPattern = this.RULE('graphGraphPattern', () => {
         this.CONSUME(l.graph.graph);
         this.SUBRULE(this.varOrIri);
         this.SUBRULE(this.groupGraphPattern);
    });

    private serviceGraphPattern = this.RULE('serviceGraphPattern', () => {
        this.CONSUME(l.service);
        this.OPTION(() => { this.CONSUME(l.silent) });
        this.SUBRULE(this.varOrIri);
        this.SUBRULE(this.groupGraphPattern);
    });

    private bind = this.RULE('bind', () => {
        this.CONSUME(l.bind);
        this.CONSUME(l.symbols.LParen);
        this.SUBRULE(this.expression);
        this.CONSUME(l.as);
        this.SUBRULE(this.var);
        this.CONSUME(l.symbols.RParen);
    });

    private inlineData = this.RULE('inlineData', () => {
        this.CONSUME(l.values);
        this.SUBRULE(this.dataBlock);
    });

    private dataBlock = this.RULE('dataBlock', () => {
        this.OR([
            {ALT: () => { this.SUBRULE(this.inlineDataOneVar) }},
            {ALT: () => { this.SUBRULE(this.inlineDataFull) }},
        ])
    });

    private inlineDataOneVar = this.RULE('inlineDataOneVar', () => {
        this.SUBRULE(this.var);
        this.CONSUME(l.symbols.LCurly);
        this.MANY(() => { this.SUBRULE(this.dataBlockValue) });
        this.CONSUME(l.symbols.RCurly);
    });

    private inlineDataFull = this.RULE('inlineDataFull', () => {
       this.OR1([
          {ALT: () => { this.CONSUME1(l.terminals.nil) }},
          {ALT: () => {
            this.CONSUME1(l.symbols.LParen);
            this.MANY1(() => { this.SUBRULE(this.var) });
            this.CONSUME1(l.symbols.RParen);
          }},
       ]);
       this.CONSUME(l.symbols.LCurly);
       this.MANY2(() => {
           this.OR2([
                {ALT: () => {
                    this.CONSUME2(l.symbols.LParen);
                    this.MANY3(() => { this.SUBRULE(this.dataBlockValue) });
                    this.CONSUME2(l.symbols.RParen);
                }},
                {ALT: () => { this.CONSUME2(l.terminals.nil) }}
           ]);
       });
       this.CONSUME(l.symbols.RCurly);
    });

    private dataBlockValue = this.RULE('dataBlockValue', () => {
        this.OR([
            {ALT: () => { this.SUBRULE(this.iri) }},
            {ALT: () => { this.SUBRULE(this.rdfLiteral) }},
            {ALT: () => { this.SUBRULE(this.numericLiteral) }},
            {ALT: () => { this.SUBRULE(this.booleanLiteral) }},
            {ALT: () => { this.CONSUME(l.undef) }},
        ]);
    });

    private minusGraphPattern = this.RULE('minusGraphPattern', () => {
        this.CONSUME(l.minus);
        this.SUBRULE(this.groupGraphPattern);
    });

    private groupOrUnionGraphPattern = this.RULE('groupOrUnionGraphPattern', () => {
        this.SUBRULE1(this.groupGraphPattern)
        this.MANY(() => {
           this.CONSUME(l.union);
           this.SUBRULE2(this.groupGraphPattern);
        });
    });

    private filter = this.RULE('filter', () => {
        this.CONSUME(l.filter);
        this.SUBRULE(this.constraint);
    });

    private constraint = this.RULE('constraint', () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.brackettedExpression)},
            {ALT: () => this.SUBRULE(this.builtInCall)},
            {ALT: () => this.SUBRULE(this.functionCall)},
        ]);
    });

    private functionCall = this.RULE('functionCall', () => {
        this.SUBRULE(this.iri);
        this.SUBRULE(this.argList)
    });

    private argList = this.RULE('argList', () => {
        this.OR([
            {ALT: () => this.CONSUME(l.terminals.nil)},
            {ALT: () => {
                this.CONSUME(l.symbols.LParen);
                this.OPTION(() => { this.CONSUME(l.distinct) });
                this.SUBRULE1(this.expression);
                this.MANY(() => {
                    this.CONSUME(l.symbols.comma);
                    this.SUBRULE2(this.expression);
                });
                this.CONSUME(l.symbols.RParen);
            }},
        ])
    });

    private expressionList = this.RULE('expressionList', () => {
        this.OR([
            {ALT: () => this.CONSUME(l.terminals.nil)},
            {ALT: () => {
                this.CONSUME(l.symbols.LParen);
                this.SUBRULE1(this.expression);
                this.MANY(() => {
                    this.CONSUME(l.symbols.comma);
                    this.SUBRULE2(this.expression);
                });
                this.CONSUME(l.symbols.RParen);
            }},
        ])
    });

    private constructTemplate = this.RULE('constructTemplate', () => {
        this.CONSUME(l.symbols.LCurly);
        this.OPTION(() => { this.SUBRULE(this.constructTriples) });
        this.CONSUME(l.symbols.RCurly);
    });

    private constructTriples = this.RULE('constructTriples', () => {
        this.SUBRULE(this.triplesSameSubject);
        this.OPTION1(() => {
            this.CONSUME(l.symbols.dot);
            this.OPTION2(() => { this.SUBRULE(this.constructTriples) });
        });
    });

    private triplesSameSubject = this.RULE('triplesSameSubject', () => {
        this.OR([
            {ALT: () => {
                this.SUBRULE(this.varOrTerm);
                this.SUBRULE(this.propertyListNotEmpty);
            }},
            {ALT: () => {
                this.SUBRULE(this.triplesNode);
                this.SUBRULE(this.propertyList);
            }},
        ])
    });

    private propertyList = this.RULE('propertyList', () => {
        this.OPTION(() => { this.SUBRULE(this.propertyListNotEmpty) })
    });

    private propertyListNotEmpty = this.RULE('propertyListNotEmpty', () => {
        this.SUBRULE1(this.verb);
        this.SUBRULE1(this.objectList);
        this.MANY(() => {
            this.CONSUME(l.symbols.semi);
            this.OPTION(() => {
                this.SUBRULE2(this.verb);
                this.SUBRULE2(this.objectList);
            })
        });
    });

    private verb = this.RULE('verb', () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.varOrIri)},
            {ALT: () => this.CONSUME(l.a)},
        ])
    });

    private objectList = this.RULE('objectList', () => {
        this.SUBRULE1(this.object);
        this.MANY(() => {
            this.CONSUME(l.symbols.comma);
            this.SUBRULE2(this.object);
        });
    });

    private object = this.RULE('object', () => {
        this.SUBRULE(this.graphNode);
    });

    private triplesSameSubjectPath = this.RULE('triplesSameSubjectPath', () => {
        this.OR([
            {ALT: () => {
                this.SUBRULE(this.varOrTerm);
                this.SUBRULE(this.propertyListPathNotEmpty);
            }},
            {ALT: () => {
                this.SUBRULE(this.triplesNodePath);
                this.SUBRULE(this.propertyListPath);
            }},
        ])
    });

    private propertyListPath = this.RULE('propertyListPath', () => {
        this.OPTION(() => { this.SUBRULE(this.propertyListPathNotEmpty) })
    });

    private propertyListPathNotEmpty = this.RULE('propertyListPathNotEmpty', () => {
        this.OR1([
            {ALT: () => { this.SUBRULE1(this.verbPath) }},
            {ALT: () => { this.SUBRULE1(this.verbSimple) }},
        ]);
        this.SUBRULE(this.objectListPath);
        this.MANY(() => {
            this.CONSUME(l.symbols.semi);
            this.OPTION(() => {
               this.OR2([
                 {ALT: () => this.SUBRULE2(this.verbPath)},
                 {ALT: () => this.SUBRULE2(this.verbSimple)}
               ]);
                this.SUBRULE(this.objectList);
            });
        });
    });

    private verbPath = this.RULE('verbPath', () => {
        this.SUBRULE(this.path);
    });

    private verbSimple = this.RULE('verbSimple', () => {
        this.SUBRULE(this.var);
    });

    private objectListPath = this.RULE('objectListPath', () => {
        this.SUBRULE1(this.objectPath);
        this.MANY(() => {
            this.CONSUME(l.symbols.comma);
            this.SUBRULE2(this.objectPath);
        });
    });

    private objectPath = this.RULE('objectPath', () => {
        this.SUBRULE(this.graphNodePath)
    });

    private path = this.RULE('path', () => {
        this.SUBRULE(this.pathAlternative);
    });

    private pathAlternative = this.RULE('pathAlternative', () => {
        this.SUBRULE1(this.pathSequence);
        this.MANY(() => {
            this.CONSUME(l.symbols.pipe);
            this.SUBRULE2(this.pathSequence);
        });
    });

    private pathSequence = this.RULE('pathSequence', () => {
        this.SUBRULE1(this.pathEltOrInverse);
        this.MANY(() => {
            this.CONSUME(l.symbols.slash);
            this.SUBRULE2(this.pathEltOrInverse);
        });
    });

    private pathElt = this.RULE('pathElt', () => {
        this.SUBRULE(this.pathPrimary);
        this.OPTION(() => { this.SUBRULE(this.pathMod) });
    });

    private pathEltOrInverse = this.RULE('pathEltOrInverse', () => {
        this.OR([
            {ALT: () => { this.SUBRULE1(this.pathElt) }},
            {ALT: () => {
                this.CONSUME(l.symbols.hat);
                this.SUBRULE2(this.pathElt)
            }},
        ]);
    });

    private pathMod = this.RULE('pathMod', () => {
        this.OR([
            {ALT: () => this.CONSUME(l.symbols.question)},
            {ALT: () => this.CONSUME(l.symbols.star)},
            {ALT: () => this.CONSUME(l.symbols.plus)},
        ]);
    });

    private pathPrimary = this.RULE('pathPrimary', () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.iri)},
            {ALT: () => this.CONSUME(l.a)},
            {ALT: () => {
                this.CONSUME(l.symbols.exclamation)
                this.SUBRULE(this.pathNegatedPropertySet)
            }},
            {ALT: () => {
                this.CONSUME(l.symbols.LParen);
                this.SUBRULE(this.path);
                this.CONSUME(l.symbols.RParen);
            }},
        ])
    });

    private pathNegatedPropertySet = this.RULE('pathNegatedPropertySet', () => {
        this.OR([
            {ALT: () => { this.SUBRULE1(this.pathOneInPropertySet) }},
            {ALT: () => {
                this.CONSUME(l.symbols.LParen);
                this.OPTION(() => {
                    this.SUBRULE2(this.pathOneInPropertySet);
                    this.MANY(() => {
                       this.CONSUME(l.symbols.pipe);
                       this.SUBRULE3(this.pathOneInPropertySet);
                    });
                })
                this.CONSUME(l.symbols.RParen);
            }},
        ]);
    });

    private pathOneInPropertySet = this.RULE('pathOneInPropertySet', () => {
        this.OR1([
            {ALT: () => this.SUBRULE1(this.iri)},
            {ALT: () => this.CONSUME1(l.a)},
            {ALT: () => {
                this.CONSUME(l.symbols.hat);
                this.OR2([
                    {ALT: () => this.SUBRULE2(this.iri)},
                    {ALT: () => this.CONSUME2(l.a)},
                ]);
            }},
        ])
    });

    private integer = this.RULE('integer', () => {
        this.CONSUME(l.terminals.integer);
    });

    private triplesNode = this.RULE('triplesNode', () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.collection)},
            {ALT: () => this.SUBRULE(this.blankNodePropertyList)},
        ]);
    });

    private blankNodePropertyList = this.RULE('blankNodePropertyList', () => {
        this.CONSUME(l.symbols.LSquare);
        this.SUBRULE(this.propertyListNotEmpty);
        this.CONSUME(l.symbols.RSquare);
    });

    private triplesNodePath = this.RULE('triplesNodePath', () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.collectionPath)},
            {ALT: () => this.SUBRULE(this.blankNodePropertyListPath)},
        ]);
    });

    private blankNodePropertyListPath = this.RULE('blankNodePropertyListPath', () => {
        this.CONSUME(l.symbols.LSquare);
        this.SUBRULE(this.propertyListPathNotEmpty);
        this.CONSUME(l.symbols.RSquare);
    });

    private collection = this.RULE('collection', () => {
        this.CONSUME(l.symbols.LParen);
        this.AT_LEAST_ONE(() => { this.SUBRULE(this.graphNode) });
        this.CONSUME(l.symbols.RParen);
    });

    private collectionPath = this.RULE('collectionPath', () => {
        this.CONSUME(l.symbols.LParen);
        this.AT_LEAST_ONE(() => { this.SUBRULE(this.graphNodePath) });
        this.CONSUME(l.symbols.RParen);
    });

    private graphNode = this.RULE('graphNode', () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.varOrTerm)},
            {ALT: () => this.SUBRULE(this.triplesNode)},
        ]);
    });

    private graphNodePath = this.RULE('graphNodePath', () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.varOrTerm)},
            {ALT: () => this.SUBRULE(this.triplesNodePath)},
        ]);
    });

    private varOrTerm = this.RULE('varOrTerm', () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.var)},
            {ALT: () => this.SUBRULE(this.graphTerm)},
        ]);
    });

    private varOrIri = this.RULE('varOrIri', () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.var)},
            {ALT: () => this.SUBRULE(this.iri)},
        ]);
    });

    private var = this.RULE('var', () => {
        this.OR([
            {ALT: () => this.CONSUME(l.terminals.var1)},
            {ALT: () => this.CONSUME(l.terminals.var2)},
        ]);
    });

    private graphTerm = this.RULE('graphTerm', () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.iri)},
            {ALT: () => this.SUBRULE(this.rdfLiteral)},
            {ALT: () => this.SUBRULE(this.numericLiteral)},
            {ALT: () => this.SUBRULE(this.booleanLiteral)},
            {ALT: () => this.SUBRULE(this.blankNode)},
            {ALT: () => this.CONSUME(l.terminals.nil)},
        ]);
    });

    private expression = this.RULE('expression', () => {
        this.SUBRULE(this.conditionalOrExpression);
    });

    private conditionalOrExpression = this.RULE('conditionalOrExpression', () => {
        this.SUBRULE1(this.conditionalAndExpression);
        this.MANY(() => {
            this.CONSUME(l.symbols.logicOr);
            this.SUBRULE2(this.conditionalAndExpression);
        });
    });

    private conditionalAndExpression = this.RULE('conditionalAndExpression', () => {
        this.SUBRULE1(this.valueLogical);
        this.MANY(() => {
            this.CONSUME(l.symbols.logicAnd);
            this.SUBRULE2(this.valueLogical);
        });
    });

    private valueLogical = this.RULE('valueLogical', () => {
        this.SUBRULE(this.relationalExpression);
    });

    private relationalExpression = this.RULE('relationalExpression', () => {
        this.SUBRULE1(this.numericExpression);
        this.OPTION(() => {
            this.OR([
                {ALT: () => {
                    this.CONSUME(l.symbols.equal);
                    this.SUBRULE2(this.numericExpression);
                }},
                {ALT: () => {
                    this.CONSUME(l.symbols.notEqual);
                    this.SUBRULE3(this.numericExpression);
                }},
                {ALT: () => {
                    this.CONSUME(l.symbols.lessThan);
                    this.SUBRULE4(this.numericExpression);
                }},
                {ALT: () => {
                    this.CONSUME(l.symbols.greaterThan);
                    this.SUBRULE5(this.numericExpression);
                }},
                {ALT: () => {
                    this.CONSUME(l.symbols.lessThanEqual);
                    this.SUBRULE6(this.numericExpression);
                }},
                {ALT: () => {
                    this.CONSUME(l.symbols.greaterThanEqual);
                    this.SUBRULE7(this.numericExpression);
                }},
                {ALT: () => {
                    this.CONSUME(l.in_);
                    this.SUBRULE1(this.expressionList);
                }},
                {ALT: () => {
                    this.CONSUME(l.notIn);
                    this.SUBRULE2(this.expressionList);
                }},
            ]);
        });
    });

    private numericExpression = this.RULE('numericExpression', () => {
        this.SUBRULE(this.additiveExpression);
    });

    private additiveExpression = this.RULE('additiveExpression', () => {
        this.SUBRULE1(this.multiplicativeExpression);
        this.MANY1(() => {
            this.OR1([
                {ALT: () => {
                    this.CONSUME(l.symbols.plus);
                    this.SUBRULE2(this.multiplicativeExpression);
                }},
                {ALT: () => {
                    this.CONSUME(l.symbols.minus_);
                    this.SUBRULE3(this.multiplicativeExpression);
                }},
                {ALT: () => {
                    this.OR2([
                        {ALT: () => this.SUBRULE(this.numericLiteralPositive)},
                        {ALT: () => this.SUBRULE(this.numericLiteralNegative)},
                    ]);
                    this.MANY2(() => {
                        this.OR3([
                            {ALT: () => {
                                this.CONSUME(l.symbols.star);
                                this.SUBRULE1(this.unaryExpression);
                            }},
                            {ALT: () => {
                                this.CONSUME(l.symbols.slash);
                                this.SUBRULE2(this.unaryExpression);
                            }},
                        ])
                    });
                }},
            ]);
        });
    });

    private multiplicativeExpression = this.RULE('multiplicativeExpression', () => {
        this.SUBRULE1(this.unaryExpression);
        this.MANY(() => {
            this.OR([
                {ALT: () => {
                    this.CONSUME(l.symbols.star);
                    this.SUBRULE2(this.unaryExpression);
                }},
                {ALT: () => {
                    this.CONSUME(l.symbols.slash);
                    this.SUBRULE3(this.unaryExpression);
                }},
            ]);
        });
    });

    private unaryExpression = this.RULE('unaryExpression', () => {
        this.OR([
            {ALT: () => {
                this.CONSUME(l.symbols.exclamation);
                this.SUBRULE1(this.primaryExpression);
            }},
            {ALT: () => {
                this.CONSUME(l.symbols.plus);
                this.SUBRULE2(this.primaryExpression);
            }},
            {ALT: () => {
                this.CONSUME(l.symbols.minus_);
                this.SUBRULE3(this.primaryExpression);
            }},
            {ALT: () => this.primaryExpression},
        ])
    });

    private primaryExpression = this.RULE('primaryExpression', () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.brackettedExpression)},
            {ALT: () => this.SUBRULE(this.builtInCall)},
            {ALT: () => this.SUBRULE(this.iriOrFunction)},
            {ALT: () => this.SUBRULE(this.rdfLiteral)},
            {ALT: () => this.SUBRULE(this.numericLiteral)},
            {ALT: () => this.SUBRULE(this.booleanLiteral)},
            {ALT: () => this.SUBRULE(this.var)},
        ]);
    });

    private brackettedExpression = this.RULE('brackettedExpression', () => {
        this.CONSUME(l.symbols.LParen);
        this.SUBRULE(this.expression);
        this.CONSUME(l.symbols.RParen);
    });


    private [l.buildIn.BuiltInCalls.Str] = exprFunc1.bind(this)(l.buildIn.str);
    private [l.buildIn.BuiltInCalls.Lang] = exprFunc1.bind(this)(l.buildIn.lang);
    private [l.buildIn.BuiltInCalls.Langmatches] = exprFunc2.bind(this)(l.buildIn.langmatches);
    private [l.buildIn.BuiltInCalls.Datatype] = exprFunc1.bind(this)(l.buildIn.datatype);
    private [l.buildIn.BuiltInCalls.Bound] = varFunc1.bind(this)(l.buildIn.bound);
    private [l.buildIn.BuiltInCalls.Iri] = exprFunc1.bind(this)(l.buildIn.iri);
    private [l.buildIn.BuiltInCalls.Uri] = exprFunc1.bind(this)(l.buildIn.uri);
    private [l.buildIn.BuiltInCalls.Bnode] = exprOrNilFunc1.bind(this)(l.buildIn.bnode);
    private [l.buildIn.BuiltInCalls.Rand] = nilFunc1.bind(this)(l.buildIn.rand);
    private [l.buildIn.BuiltInCalls.Abs] = exprFunc1.bind(this)(l.buildIn.abs);
    private [l.buildIn.BuiltInCalls.Ceil] = exprFunc1.bind(this)(l.buildIn.ceil);
    private [l.buildIn.BuiltInCalls.Floor] = exprFunc1.bind(this)(l.buildIn.floor);
    private [l.buildIn.BuiltInCalls.Round] = exprFunc1.bind(this)(l.buildIn.round);
    private [l.buildIn.BuiltInCalls.Concat] = exprListFunc1.bind(this)(l.buildIn.concat);
    private [l.buildIn.BuiltInCalls.Strlen] = exprFunc1.bind(this)(l.buildIn.strlen);
    private [l.buildIn.BuiltInCalls.Ucase] = exprFunc1.bind(this)(l.buildIn.ucase);
    private [l.buildIn.BuiltInCalls.Lcase] = exprFunc1.bind(this)(l.buildIn.lcase);
    private [l.buildIn.BuiltInCalls.Encode_for_uri] = exprFunc1.bind(this)(l.buildIn.encode_for_uri);
    private [l.buildIn.BuiltInCalls.Contains] = exprFunc2.bind(this)(l.buildIn.contains);
    private [l.buildIn.BuiltInCalls.Strstarts] = exprFunc2.bind(this)(l.buildIn.strstarts);
    private [l.buildIn.BuiltInCalls.Strends] = exprFunc2.bind(this)(l.buildIn.strends);
    private [l.buildIn.BuiltInCalls.Strbefore] = exprFunc2.bind(this)(l.buildIn.strbefore);
    private [l.buildIn.BuiltInCalls.Strafter] = exprFunc2.bind(this)(l.buildIn.strafter);
    private [l.buildIn.BuiltInCalls.Year] = exprFunc1.bind(this)(l.buildIn.year);
    private [l.buildIn.BuiltInCalls.Month] = exprFunc1.bind(this)(l.buildIn.month);
    private [l.buildIn.BuiltInCalls.Day] = exprFunc1.bind(this)(l.buildIn.day);
    private [l.buildIn.BuiltInCalls.Hours] = exprFunc1.bind(this)(l.buildIn.hours);
    private [l.buildIn.BuiltInCalls.Minutes] = exprFunc1.bind(this)(l.buildIn.minutes);
    private [l.buildIn.BuiltInCalls.Seconds] = exprFunc1.bind(this)(l.buildIn.seconds);
    private [l.buildIn.BuiltInCalls.Timezone] = exprFunc1.bind(this)(l.buildIn.timezone);
    private [l.buildIn.BuiltInCalls.Tz] = exprFunc1.bind(this)(l.buildIn.tz);
    private [l.buildIn.BuiltInCalls.Now] = nilFunc1.bind(this)(l.buildIn.now);
    private [l.buildIn.BuiltInCalls.Uuid] = nilFunc1.bind(this)(l.buildIn.uuid);
    private [l.buildIn.BuiltInCalls.Struuid] = nilFunc1.bind(this)(l.buildIn.struuid);
    private [l.buildIn.BuiltInCalls.Md5] = exprFunc1.bind(this)(l.buildIn.md5);
    private [l.buildIn.BuiltInCalls.Sha1] = exprFunc1.bind(this)(l.buildIn.sha1);
    private [l.buildIn.BuiltInCalls.Sha256] = exprFunc1.bind(this)(l.buildIn.sha256);
    private [l.buildIn.BuiltInCalls.Sha384] = exprFunc1.bind(this)(l.buildIn.sha384);
    private [l.buildIn.BuiltInCalls.Sha512] = exprFunc1.bind(this)(l.buildIn.sha512);
    private [l.buildIn.BuiltInCalls.Coalesce] = exprListFunc1.bind(this)(l.buildIn.coalesce);
    private [l.buildIn.BuiltInCalls.If] = exprFunc2.bind(this)(l.buildIn.if_);
    private [l.buildIn.BuiltInCalls.Strlang] = exprFunc2.bind(this)(l.buildIn.strlang);
    private [l.buildIn.BuiltInCalls.Strdt] = exprFunc2.bind(this)(l.buildIn.strdt);
    private [l.buildIn.BuiltInCalls.Sameterm] = exprFunc2.bind(this)(l.buildIn.sameterm);
    private [l.buildIn.BuiltInCalls.Isiri] = exprFunc1.bind(this)(l.buildIn.isiri);
    private [l.buildIn.BuiltInCalls.Isuri] = exprFunc1.bind(this)(l.buildIn.isuri);
    private [l.buildIn.BuiltInCalls.Isblank] = exprFunc1.bind(this)(l.buildIn.isblank);
    private [l.buildIn.BuiltInCalls.Isliteral] = exprFunc1.bind(this)(l.buildIn.isliteral);
    private [l.buildIn.BuiltInCalls.Isnumeric] = exprFunc1.bind(this)(l.buildIn.isnumeric);

    private builtInCall = this.RULE('builtInCall', () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.aggregate)},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Str])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Lang])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Langmatches])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Datatype])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Bound])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Iri])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Uri])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Bnode])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Rand])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Abs])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Ceil])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Floor])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Round])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Concat])},
            {ALT: () => this.SUBRULE(this.substringExpression)},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Strlen])},
            {ALT: () => this.SUBRULE(this.strReplaceExpression)},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Ucase])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Lcase])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Encode_for_uri])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Contains])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Strstarts])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Strends])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Strbefore])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Strafter])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Year])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Month])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Day])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Hours])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Minutes])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Seconds])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Timezone])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Tz])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Now])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Uuid])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Struuid])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Md5])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Sha1])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Sha256])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Sha384])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Sha512])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Coalesce])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.If])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Strlang])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Strdt])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Sameterm])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Isiri])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Isuri])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Isblank])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Isliteral])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Isnumeric])},
            {ALT: () => this.SUBRULE(this.regexExpression)},
            {ALT: () => this.SUBRULE(this.existsFunc)},
            {ALT: () => this.SUBRULE(this.notExistsFunc)},
        ]);
    });

    private regexExpression = this.RULE('regexExpression', () => {
        this.CONSUME(l.buildIn.regex);
        this.CONSUME(l.symbols.LParen);
        this.SUBRULE1(this.expression);
        this.CONSUME1(l.symbols.comma);
        this.SUBRULE2(this.expression);
        this.OPTION(() => {
            this.CONSUME2(l.symbols.comma);
            this.SUBRULE3(this.expression);
        });
        this.CONSUME(l.symbols.RParen);
    });

    private substringExpression = this.RULE('substringExpression', () => {
        this.CONSUME(l.buildIn.substr);
        this.CONSUME(l.symbols.LParen);
        this.SUBRULE1(this.expression);
        this.CONSUME1(l.symbols.comma);
        this.SUBRULE2(this.expression);
        this.OPTION(() => {
            this.CONSUME2(l.symbols.comma);
            this.SUBRULE3(this.expression);
        });
        this.CONSUME(l.symbols.RParen);
    });

    private strReplaceExpression = this.RULE('strReplaceExpression', () => {
        this.CONSUME(l.buildIn.replace);
        this.CONSUME(l.symbols.LParen);
        this.SUBRULE1(this.expression);
        this.CONSUME1(l.symbols.comma);
        this.SUBRULE2(this.expression);
        this.CONSUME2(l.symbols.comma);
        this.SUBRULE3(this.expression);
        this.OPTION(() => {
            this.CONSUME3(l.symbols.comma);
            this.SUBRULE4(this.expression);
        });
        this.CONSUME(l.symbols.RParen);
    });

    private existsFunc = this.RULE('existsFunc', () => {
        this.CONSUME(l.buildIn.exists);
        this.SUBRULE(this.groupGraphPattern);
    });

    private notExistsFunc = this.RULE('notExistsFunc', () => {
        this.CONSUME(l.buildIn.notexists);
        this.SUBRULE(this.groupGraphPattern);
    });

    private [l.buildIn.BuiltInCalls.Count] = baseAggregateFunc.bind(this)(l.buildIn.count);
    private [l.buildIn.BuiltInCalls.Sum] = baseAggregateFunc.bind(this)(l.buildIn.sum);
    private [l.buildIn.BuiltInCalls.Min] = baseAggregateFunc.bind(this)(l.buildIn.min);
    private [l.buildIn.BuiltInCalls.Max] = baseAggregateFunc.bind(this)(l.buildIn.max);
    private [l.buildIn.BuiltInCalls.Avg] = baseAggregateFunc.bind(this)(l.buildIn.avg);
    private [l.buildIn.BuiltInCalls.Sample] = baseAggregateFunc.bind(this)(l.buildIn.sample);
    private [l.buildIn.BuiltInCalls.Group_concat] = this.RULE(unCapitalize(l.buildIn.groupConcat.name), () => {
        this.CONSUME(l.buildIn.groupConcat);
        this.CONSUME(l.symbols.LParen);
        this.OPTION1(() => { this.CONSUME(l.distinct) });
        this.SUBRULE(this.expression);
        this.OPTION2(() => {
            this.CONSUME(l.symbols.semi);
            this.CONSUME(l.buildIn.separator);
            this.CONSUME(l.symbols.equal);
            this.SUBRULE(this.string);
        });
        this.CONSUME(l.symbols.RParen);
    });

    private aggregate = this.RULE('aggregate', () => {

        this.OR([
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Count])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Sum])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Min])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Max])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Avg])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Sample])},
            {ALT: () => this.SUBRULE(this[l.buildIn.BuiltInCalls.Group_concat])},
        ]);
    });

    private iriOrFunction = this.RULE('iriOrFunction', () => {
        this.SUBRULE(this.iri);
        this.OPTION(() => { this.SUBRULE(this.argList) });
    });

    private rdfLiteral = this.RULE('rdfLiteral', () => {
        this.SUBRULE(this.string);
        this.OPTION(() => {
            this.OR([
                {ALT: () => this.CONSUME(l.terminals.langTag)},
                {ALT: () => {
                    this.CONSUME(l.symbols.hathat);
                    this.SUBRULE(this.iri);
                }},
            ])
        })
    });

    private numericLiteral = this.RULE('numericLiteral', () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.numericLiteralUnsigned)},
            {ALT: () => this.SUBRULE(this.numericLiteralPositive)},
            {ALT: () => this.SUBRULE(this.numericLiteralNegative)},
        ]);
    });

    private numericLiteralUnsigned = this.RULE('numericLiteralUnsigned', () => {
        this.OR([
            {ALT: () => this.CONSUME(l.terminals.integer)},
            {ALT: () => this.CONSUME(l.terminals.decimal)},
            {ALT: () => this.CONSUME(l.terminals.double)},
        ]);
    });

    private numericLiteralPositive = this.RULE('numericLiteralPositive', () => {
        this.OR([
            {ALT: () => this.CONSUME(l.terminals.interferePositive)},
            {ALT: () => this.CONSUME(l.terminals.decimalPositive)},
            {ALT: () => this.CONSUME(l.terminals.doublePositive)},
        ]);
    });

    private numericLiteralNegative = this.RULE('numericLiteralNegative', () => {
        this.OR([
            {ALT: () => this.CONSUME(l.terminals.interfereNegative)},
            {ALT: () => this.CONSUME(l.terminals.decimalNegative)},
            {ALT: () => this.CONSUME(l.terminals.doubleNegative)},
        ]);
    });

    private booleanLiteral = this.RULE('booleanLiteral', () => {
        this.OR([
            {ALT: () => this.CONSUME(l.true_)},
            {ALT: () => this.CONSUME(l.false_)},
        ]);
    });

    private string = this.RULE('string', () => {
        this.OR([
            {ALT: () => this.CONSUME(l.terminals.stringLiteral1)},
            {ALT: () => this.CONSUME(l.terminals.stringLiteral2)},
            {ALT: () => this.CONSUME(l.terminals.stringLiteralLong1)},
            {ALT: () => this.CONSUME(l.terminals.stringLiteralLong2)},
        ]);
    });

    private iri = this.RULE('iri', () => {
        this.OR([
            {ALT: () => this.CONSUME(l.terminals.iriRef)},
            {ALT: () => this.SUBRULE(this.prefixedName)},
        ])
    });

    private prefixedName = this.RULE('prefixedName', () => {
        this.OR([
            {ALT: () => this.CONSUME(l.terminals.pNameLn)},
            {ALT: () => this.CONSUME(l.terminals.pNameNs)},
        ]);
    });

    private blankNode = this.RULE('blankNode', () => {
        this.OR([
            {ALT: () => this.CONSUME(l.terminals.blankNodeLabel)},
            {ALT: () => this.CONSUME(l.terminals.anon)},
        ])
    });
}