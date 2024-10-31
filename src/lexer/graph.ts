import {createToken} from "chevrotain";

export const named = createToken({name: 'NamedGraph', pattern: 'NAMED'})
export const default_ = createToken({name: 'DefaultGraph', pattern: 'DEFAULT'})
export const graph = createToken({name: 'Graph', pattern: 'GRAPH'})
export const graphAll = createToken({name: 'GraphAll', pattern: 'ALL'})

export const allGraphTokens = [
    named,
    default_,
    graph,
    graphAll
]