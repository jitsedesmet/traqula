import { createToken } from 'chevrotain';

export const named = createToken({ name: 'NamedGraph', pattern: /NAMED/ui, label: 'NAMED' });
export const default_ = createToken({ name: 'DefaultGraph', pattern: /DEFAULT/ui, label: 'DEFAULT' });
export const graph = createToken({ name: 'Graph', pattern: /GRAPH/ui, label: 'GRAPH' });
export const graphAll = createToken({ name: 'GraphAll', pattern: /ALL/ui, label: 'ALL' });

export const allGraphTokens = [
  named,
  default_,
  graph,
  graphAll,
];
