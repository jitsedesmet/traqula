// @ts-check
import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');
const minify = process.argv.includes('--minify');

const success = watch ? 'Watch build succeeded' : 'Build succeeded';

function getTime() {
  const date = new Date();
  return `[${`${padZeroes(date.getHours())}:${padZeroes(date.getMinutes())}:${padZeroes(date.getSeconds())}`}] `;
}

function padZeroes(i) {
  return i.toString().padStart(2, '0');
}

const plugins = [{
  name: 'watch-plugin',
  setup(build) {
    build.onEnd((result) => {
      if (result.errors.length === 0) {
        console.log(getTime() + success);
      }
    });
  },
}];

const srcCtx = await esbuild.context({
  entryPoints: [ 'src/index.ts' ],
  outdir: 'out',
  outExtension: {
    '.js': '.cjs',
  },
  bundle: true,
  target: 'ES2020',
  format: 'cjs',
  loader: { '.ts': 'ts' },
  platform: 'node',
  sourcemap: !minify,
  minify,
  plugins,
});

const specCtx = await esbuild.context({
  entryPoints: [ 'spec/parser.ts' ],
  outfile: 'out/parser.cjs',
  outExtension: {
    '.js': '.cjs',
  },
  bundle: true,
  target: 'ES2020',
  format: 'cjs',
  loader: { '.ts': 'ts' },
  platform: 'node',
  sourcemap: !minify,
  minify,
  plugins,
});

if (watch) {
  await srcCtx.watch();
  await specCtx.watch();
} else {
  await srcCtx.rebuild();
  srcCtx.dispose();
  await specCtx.rebuild();
  specCtx.dispose();
}
