#!/usr/bin/env node
// scaffold-chat.mjs — create RN stub files for every 'port' surface in web-parity-map.json.
// ONE-TIME. DRY-RUN BY DEFAULT (prints the tree); pass --write to create. Never overwrites.
// --milestone=N scaffolds just that phase.
//
//   node scripts/scaffold-chat.mjs                 # dry-run all
//   node scripts/scaffold-chat.mjs --milestone=1 --write
//
// Each stub follows CLAUDE.md (Name.tsx + index.ts + styles.ts), annotated with its web source
// + the design tokens that source uses (from token-usage.json if present).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { REPO_ROOT, RN, c, hasFlag } from './port/paths.mjs';

const WRITE = hasFlag('--write');
const mArg = process.argv.find((a) => a.startsWith('--milestone='));
const milestone = mArg ? Number(mArg.slice('--milestone='.length)) : null;

const manifest = JSON.parse(readFileSync(resolve(RN.portDir, 'web-parity-map.json'), 'utf8'));
const usagePath = resolve(RN.portDir, 'token-usage.json');
const tokenUsage = existsSync(usagePath) ? JSON.parse(readFileSync(usagePath, 'utf8')) : {};

let planned = 0, created = 0, skipped = 0;
const inScope = (u) => milestone == null || u.milestone === milestone;

// tokens whose usage file lives under a given web source path
function tokensFor(webSrc) {
  const names = new Set();
  for (const [file, toks] of Object.entries(tokenUsage)) if (file.startsWith(webSrc)) toks.forEach((t) => names.add(t));
  return [...names].sort();
}

function emit(absFile, content) {
  planned++;
  if (!WRITE) { console.log(`  ${c.dim('would create')} ${relative(REPO_ROOT, absFile)}`); return; }
  if (existsSync(absFile)) { skipped++; return; }
  mkdirSync(dirname(absFile), { recursive: true });
  writeFileSync(absFile, content, 'utf8');
  created++;
  console.log(`  ${c.green('✓')} ${relative(REPO_ROOT, absFile)}`);
}

const stylesStub = () => `import { StyleSheet } from 'react-native';
// import { useToken } from '../../../../core/design/theme/useToken';
// import { AmityColorToken } from '../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const styles = StyleSheet.create({ container: { flex: 1 } });
  return { styles };
};
`;
const barrel = (name) => `export { ${name} } from './${name}';\n`;
const compStub = (name, webSrc, tokens) => `// PORT STUB — ${name}
// Web source: ${webSrc}
// Tokens (bind via useToken(), never hex):
${tokens.length ? tokens.map((t) => `//   - AmityColorToken.${t}`).join('\n') : '//   (run extract-token-usage.mjs)'}
// TODO(port): div/span→View/Text · .module.css→styles.ts · react-aria→Pressable/gesture-handler
import { View } from 'react-native';
import { useStyles } from './styles';

type ${name}Props = { /* TODO(port): copy from web */ };

export function ${name}(_props: ${name}Props) {
  const { styles } = useStyles();
  return <View style={styles.container} />;
}
`;

function scaffoldFolder(name, rnRel, webSrc) {
  const dir = resolve(REPO_ROOT, rnRel);
  emit(join(dir, `${name}.tsx`), compStub(name, webSrc, tokensFor(webSrc)));
  emit(join(dir, 'styles.ts'), stylesStub());
  emit(join(dir, 'index.ts'), barrel(name));
}

console.log(c.bold(`\nScaffold from web-parity-map ${milestone ? `(M${milestone}) ` : ''}${WRITE ? '(WRITE)' : '(dry-run)'}\n`));

// enumerated 'port' units (design atoms/molecules/components/elements, chat elements, chat pages)
for (const [key, u] of Object.entries(manifest.units)) {
  if (u.status !== 'port' || !u.rn || !inScope(u)) continue;
  const [rootKey, unit] = [key.slice(0, key.lastIndexOf('/')), key.slice(key.lastIndexOf('/') + 1)];
  const webSrc = `${manifest.roots[rootKey]}/${unit}`;
  scaffoldFolder(basename(u.rn), u.rn, webSrc);
}
// curated feature-level components
for (const [name, u] of Object.entries(manifest.curated || {})) {
  if (!inScope(u)) continue;
  if (u.kind === 'hooks-only') {
    emit(resolve(REPO_ROOT, `${u.rn}.ts`), `// PORT STUB — ${name} (hooks-only)\n// Web source: ${u.web}\nexport {}; // TODO(port)\n`);
  } else {
    scaffoldFolder(name, u.rn, u.web);
  }
}
// chat feature barrels
emit(resolve(REPO_ROOT, 'src/social/features/chat/hooks/index.ts'), `// chat data hooks barrel\nexport {};\n`);
emit(resolve(REPO_ROOT, 'src/social/features/chat/index.ts'), `// chat feature barrel\nexport {};\n`);

console.log(
  `\n${c.bold('Planned')} ${planned} files` +
    (WRITE ? ` · created ${created} · skipped ${skipped}` : ` ${c.dim('(dry-run — pass --write)')}`) + '\n'
);
