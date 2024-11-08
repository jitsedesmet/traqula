PrefixedName = PNAME_LN / PNAME_NS
BlankNode = blank:BLANK_NODE_LABEL { return { type: "BlankMode", value: blank }; }
            / ANON 


// Terminals

//  &PN_CHARS is needed since the star operator works in a greedy way,
// we need to look ahead to validate we can surely still match a PN_CHARS, before consuming (PN_CHARS / '.')
// -> Sounds like that's very inefficient...
BLANK_NODE_LABEL = '_:'i $( PN_CHARS_U / [0-9]i ) $( ($( PN_CHARS / '.'i ) &PN_CHARS)* PN_CHARS )?
PN_CHARS_U = PN_CHARS_BASE / '_'i
PN_CHARS = PN_CHARS_U / [\-0-9\u00B7\u0300-\u036F\u203F-\u2040]i
PN_CHARS_BASE = [A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u10000-\uEFFFF]i
ANON = $('['i WS* ']'i)
WS = [\u0020\u0009\u000D\u000A]i
PNAME_LN = PNAME_NS PN_LOCAL
PNAME_NS = PN_PREFIX? ':'i
PN_LOCAL = (PN_CHARS_U / ':'i / [0-9]i / PLX) ((PN_CHARS / '.'i / ':'i / PLX)* (PN_CHARS / ':'i / PLX) )?
PLX = PERCENT / PN_LOCAL_ESC
PN_LOCAL_ESC = '\\'i [_~.\-!$&'()*+,;=\\/?#@%]i
PERCENT = '%'i HEX HEX
HEX = [0-9A-Fa-f]i
PN_PREFIX = PN_CHARS_BASE ((PN_CHARS / '.'i)* PN_CHARS)?