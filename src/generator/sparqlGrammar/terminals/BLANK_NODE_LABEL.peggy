//  &PN_CHARS is needed since the star operator works in a greedy way,
// we need to look ahead to validate we can surely still match a PN_CHARS, before consuming (PN_CHARS / '.')
// -> Sounds like that's very inefficient...
BLANK_NODE_LABEL = $('_:'i $( PN_CHARS_U / [0-9]i ) $( ($( PN_CHARS / '.'i ) &PN_CHARS)* PN_CHARS )?)