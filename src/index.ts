import { trySparql12 } from './grammar/sparql11/Sparql11Parser';

trySparql12();
// TrySparqlAdjust();

// Import * as fs from 'node:fs';
// import { createSyntaxDiagramsCode } from 'chevrotain';
// import { SparqlParser } from './grammar/grammar';
// import { ChevSparqlLexer } from './lexer';
//
// const lexer = ChevSparqlLexer;
// const parser = new SparqlParser();
//
// const lexResult = lexer.tokenize('SELECT * WHERE { ?s ?p ?o }');
// parser.input = lexResult.tokens;
// const cst = parser.queryUnit();
//
// const BaseSparqlVisitor = parser.getBaseCstVisitorConstructor();
//
// // Class SparqlVisitor extends BaseSparqlVisitor {
// //     public constructor() {
// //         super();
// //         this.validateVisitor()
// //     }
// //
// //     queryUnit(ctx) {
// //         return this.visit(ctx.query)
// //     }
// //
// //     query(ctx) {
// //         return this.visit(ctx.prologue)
// //     }
// //
// //     prologue(ctx) {
// //         return this.visit(ctx.baseDecl)
// //     }
// //
// //     baseDecl(ctx) {
// //         return ctx.BaseDecl[0].image
// //     }
// // }
// //
//
// console.log(parser.errors.join('\n'));
// const htmlText = createSyntaxDiagramsCode(parser.getSerializedGastProductions());
// fs.writeFileSync('./generated_diagrams.html', htmlText);
