import type * as RdfJs from '@rdfjs/types';
import type { BlankNode } from 'rdf-data-factory';
import type { CommonIRIs } from '@traqula/core';

export type GraphTerm = IriTerm | BlankTerm | LiteralTerm;
export type Term = GraphTerm | VariableTerm;
export type VerbA = IriTerm<CommonIRIs.TYPE>;

export interface Wildcard {
  readonly termType: 'Wildcard';
  readonly value: '*';
  equals: (other: RdfJs.Term | null | undefined) => boolean;
}

export type Triple = {
  subject: Term;
  predicate: IriTerm | VariableTerm | PropertyPath;
  object: Term;
};

export type TripleCreatorS = (part: Pick<Triple, 'subject'>) => Triple;
export type TripleCreatorSP = (part: Pick<Triple, 'subject' | 'predicate'>) => Triple;

export interface IGraphNode {
  node: ITriplesNode['node'] | Term;
  triples: Triple[];
}

export interface ITriplesNode {
  node: IriTerm | BlankNode;
  triples: Triple[];
}

export type Pattern =
  | BgpPattern
  | BlockPattern
  | FilterPattern
  | BindPattern
  | ValuesPattern
  | Omit<SelectQuery, 'prefixes'>;

export type Expression =
  | OperationExpression
  | FunctionCallExpression
  | AggregateExpression
  // Used in `IN` operator
  | Expression[]
  | IriTerm
  | VariableTerm
  | LiteralTerm;

export interface FunctionCallExpression extends BaseExpression {
  type: 'functionCall';
  function: IriTerm;
  args: Expression[];
}

/**
 * Basic Graph Pattern
 */
export interface BgpPattern {
  type: 'bgp';
  triples: Triple[];
}

export interface GraphQuads {
  type: 'graph';
  name: IriTerm | VariableTerm;
  triples: Triple[];
}

// Copied types
export interface SparqlParser {
  parse: (query: string) => SparqlQuery;
  _resetBlanks: () => void;
}

export type VariableTerm = RdfJs.Variable;
export type IriTerm<IRI extends string = string> = RdfJs.NamedNode<IRI>;
export type LiteralTerm = RdfJs.Literal;
export type BlankTerm = RdfJs.BlankNode;

export type PropertyPath = NegatedPropertySet | {
  type: 'path';
  pathType: '|' | '/' | '^' | '+' | '*' | '?';
  items: (IriTerm | PropertyPath)[];
};

export type SparqlQuery = Query | Update | Pick<Update, 'base' | 'prefixes'>;

export type Query = SelectQuery | ConstructQuery | AskQuery | DescribeQuery;

export interface SelectQuery extends BaseQuery {
  queryType: 'SELECT';
  variables: Variable[] | [Wildcard];
  distinct?: true | undefined;
  reduced?: true | undefined;
  group?: Grouping[] | undefined;
  having?: Expression[] | undefined;
  order?: Ordering[] | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export interface Grouping {
  expression: Expression;
  variable?: VariableTerm;
}

export interface Ordering {
  expression: Expression;
  descending?: true | undefined;
}

export interface ConstructQuery extends BaseQuery {
  queryType: 'CONSTRUCT';
  template?: Triple[] | undefined;
}

export interface AskQuery extends BaseQuery {
  queryType: 'ASK';
}

export interface DescribeQuery extends BaseQuery {
  queryType: 'DESCRIBE';
  variables: (VariableTerm | IriTerm)[] | [Wildcard];
}

export interface Update {
  type: 'update';
  base?: string | undefined;
  prefixes: Record<string, string>;
  updates: UpdateOperation[];
}

export type UpdateOperation = InsertDeleteOperation | ManagementOperation;

export type InsertDeleteOperation =
  | {
    updateType: 'insert';
    graph?: GraphOrDefault;
    insert: Quads[];
  }
  | {
    updateType: 'delete';
    graph?: GraphOrDefault;
    delete: Quads[];
  }
  | {
    updateType: 'insertdelete';
    graph?: IriTerm;
    insert: Quads[];
    delete: Quads[];
    using?: {
      default: IriTerm[];
      named: IriTerm[];
    };
    where: Pattern[];
  }
  | {
    updateType: 'deletewhere';
    graph?: GraphOrDefault;
    delete: Quads[];
  };

export type Quads = BgpPattern | GraphQuads;

export type ManagementOperation =
  | CopyMoveAddOperation
  | LoadOperation
  | CreateOperation
  | ClearDropOperation;

export interface CopyMoveAddOperation {
  type: 'copy' | 'move' | 'add';
  silent: boolean;
  source: GraphOrDefault;
  destination: GraphOrDefault;
}

export interface LoadOperation {
  type: 'load';
  silent: boolean;
  source: IriTerm;
  destination?: IriTerm;
}

export interface CreateOperation {
  type: 'create';
  silent: boolean;
  graph: GraphOrDefault;
}

export interface ClearDropOperation {
  type: 'clear' | 'drop';
  silent: boolean;
  graph: GraphReference;
}

export interface GraphOrDefault {
  type?: 'graph';
  name?: IriTerm | undefined;
  default?: true | undefined;
}

export interface GraphReference extends GraphOrDefault {
  named?: true | undefined;
  all?: true | undefined;
}

/**
 * Examples: '?var', '*',
 *   SELECT (?a as ?b) ... ==> { expression: '?a', variable: '?b' }
 */
export type Variable = VariableExpression | VariableTerm;

export interface VariableExpression {
  expression: Expression;
  variable: VariableTerm;
}

export interface BaseQuery {
  type: 'query';
  base?: string | undefined;
  prefixes: Record<string, string>;
  from?:
    | {
      default: IriTerm[];
      named: IriTerm[];
    }
    | undefined;
  where?: Pattern[] | undefined;
  values?: ValuePatternRow[] | undefined;
}

export type IriTermOrElt = IriTerm | {
  type: 'path';
  pathType: '^';
  items: [IriTerm];
};

export interface NegatedPropertySet {
  type: 'path';
  pathType: '!';
  items: IriTermOrElt[] | [{
    type: 'path';
    pathType: '|';
    items: (IriTermOrElt)[];
  }];
}

export interface GroupPattern {
  type: 'group';
  patterns: Pattern[];
}

export interface GraphPattern {
  type: 'graph';
  name: IriTerm | VariableTerm;
  patterns: Pattern[];
}

export interface MinusPattern {
  type: 'minus';
  patterns: Pattern[];
}

export interface ServicePattern {
  type: 'service';
  name: IriTerm | VariableTerm;
  silent: boolean;
  patterns: Pattern[];
}

export type BlockPattern =
  | OptionalPattern
  | UnionPattern
  | GroupPattern
  | GraphPattern
  | MinusPattern
  | ServicePattern;

export interface OptionalPattern {
  type: 'optional';
  patterns: Pattern[];
}

export interface UnionPattern {
  type: 'union';
  patterns: Pattern[];
}

export type ValuePatternRow = Record<string, IriTerm | BlankTerm | LiteralTerm | undefined>;

export interface FilterPattern {
  type: 'filter';
  expression: Expression;
}

export interface BindPattern {
  type: 'bind';
  expression: Expression;
  variable: VariableTerm;
}

export interface ValuesPattern {
  type: 'values';
  values: ValuePatternRow[];
}

export interface BaseExpression {
  type: string;
  distinct?: boolean | undefined;
}

export interface OperationExpression extends BaseExpression {
  type: 'operation';
  operator: string;
  args: (Expression | Pattern)[];
}

export interface AggregateExpression extends BaseExpression {
  type: 'aggregate';
  expression: Expression | Wildcard;
  aggregation: string;
  separator?: string | undefined;
}
