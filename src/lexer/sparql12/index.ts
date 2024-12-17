/* eslint-disable require-unicode-regexp */
import { createToken } from '../utils';

export const tilde = createToken({ name: 'Tilde', pattern: '~', label: '~' });
export const annotationOpen = createToken({ name: 'AnnotationOpen', pattern: '{|', label: `Annotation Open: {|` });
export const annotationClose = createToken({ name: 'AnnotationClose', pattern: '|}', label: 'Annotation Close |}' });
export const reificationOpen = createToken({ name: 'ReificationOpen', pattern: '<<', label: 'Reification open <<' });
export const reificationClose = createToken({ name: 'ReificationClose', pattern: '>>', label: 'Reification close >>' });
export const tripleTermOpen = createToken({ name: 'TripleTermOpen', pattern: '<<(', label: 'Triple Term Open <<(' });
export const tripleTermClose = createToken({ name: 'TripleTermClose', pattern: ')>>', label: 'Triple Term Close )>>' });

export const builtinLangDir = createToken({ name: 'LANGDIR', pattern: /langdir/i, label: 'LANGDIR' });
export const builtinStrLangDir = createToken({ name: 'STRLANGDIR', pattern: /strlangdir/i, label: 'STRLANGDIR' });
export const builtinHasLang = createToken({ name: 'hasLANG', pattern: /haslang/i, label: 'hasLANG' });
export const builtinHasLangDir = createToken({ name: 'hasLANGDIR', pattern: /haslangdir/i, label: 'hasLANGDIR' });

export const builtinIsTRIPLE = createToken({ name: 'isTRIPLE', pattern: /istriple/i, label: 'isTRIPLE' });
export const builtinTRIPLE = createToken({ name: 'TRIPLE', pattern: /triple/i, label: 'TRIPLE' });
export const builtinSUBJECT = createToken({ name: 'SUBJECT', pattern: /subject/i, label: 'SUBJECT' });
export const builtinPREDICATE = createToken({ name: 'PREDICATE', pattern: /predicate/i, label: 'PREDICATE' });
export const builtinOBJECT = createToken({ name: 'OBJECT', pattern: /object/i, label: 'OBJECT' });

export const LANG_DIR = createToken({
  name: 'LANG_DIR',
  pattern: /@[A-Za-z]+(?:-[\dA-Za-z]+)*(?:--[A-Za-z]+)?/,
  label: 'LANG_DIR',
});
