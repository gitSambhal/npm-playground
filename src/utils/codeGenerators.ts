/**
 * Code snippet generators and auto-suggestion engine
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import { CDNProvider, ExportedItem } from '../types';
import { CDN_CONFIG, POPULAR_PACKAGES } from './constants';
import { toValidIdentifier } from './npmRegistry';

export function generateDefaultCodeForPackage(
  pkgName: string,
  version?: string,
  exportsList: ExportedItem[] = []
): string {
  // Check if we have curated preset code
  const preset = POPULAR_PACKAGES.find(p => p.name.toLowerCase() === pkgName.toLowerCase());

  if (preset) {
    return preset.defaultCode.replace(/PKG_IMPORT/g, pkgName);
  }

  const varName = toValidIdentifier(pkgName);

  // If we have live introspection of exports:
  if (exportsList.length > 0) {
    const namedFuncs = exportsList.filter(e => e.name !== 'default' && !e.name.startsWith('default.') && e.type === 'function');
    const namedObjs = exportsList.filter(e => e.name !== 'default' && e.type !== 'function');
    const hasDefault = exportsList.some(e => e.name === 'default');

    if (namedFuncs.length > 0) {
      const topNamed = namedFuncs.slice(0, 4).map(f => f.name);
      return `// Testing ${pkgName} in-browser
import { ${topNamed.join(', ')} } from '${pkgName}';

console.log('--- Testing named exports from ${pkgName} ---');
${topNamed.map(fn => {
  return `try {
  const result = typeof ${fn} === 'function' ? ${fn}() : ${fn};
  console.log('${fn}() ->', result);
} catch (err) {
  console.log('${fn} signature/structure:', ${fn});
}`;
}).join('\n\n')}
`;
    }

    if (hasDefault) {
      return `// Testing ${pkgName} default export in-browser
import ${varName} from '${pkgName}';

console.log('Imported ${pkgName}:', ${varName});

if (typeof ${varName} === 'function') {
  try {
    const res = ${varName}();
    console.log('Invocation result:', res);
  } catch (err) {
    console.log('${varName} is a function/constructor with length:', ${varName}.length);
  }
} else if (typeof ${varName} === 'object' && ${varName} !== null) {
  console.log('Available keys:', Object.keys(${varName}));
  console.table(Object.keys(${varName}).slice(0, 15));
}
`;
    }
  }

  // Generic universal template
  return `// In-browser test for ${pkgName}
import * as ${varName} from '${pkgName}';

console.log('Successfully loaded ${pkgName}!');
console.log('Module exports:', ${varName});

// Inspect top-level members
const exportKeys = Object.keys(${varName});
console.log(\`Found \${exportKeys.length} exported member(s):\`, exportKeys);

if (exportKeys.length > 0) {
  console.table(exportKeys.map(key => ({
    name: key,
    type: typeof (${varName} as any)[key]
  })));
}
`;
}

export function generateFunctionSnippet(
  pkgName: string,
  funcItem: ExportedItem,
  version?: string
): string {
  const varName = toValidIdentifier(pkgName);

  if (funcItem.name === 'default') {
    return `import ${varName} from '${pkgName}';\n\nconsole.log('Default export:', ${varName});\nconst result = typeof ${varName} === 'function' ? ${varName}() : ${varName};\nconsole.log('Result:', result);`;
  }

  if (funcItem.name.startsWith('default.')) {
    const prop = funcItem.name.replace('default.', '');
    return `import ${varName} from '${pkgName}';\n\nconsole.log('${prop}() ->', ${varName}.${prop}());`;
  }

  return `import { ${funcItem.name} } from '${pkgName}';\n\n// Testing ${funcItem.name}\nconsole.log('${funcItem.name} definition:', ${funcItem.name});\ntry {\n  const result = ${funcItem.name}();\n  console.log('Result:', result);\n} catch (e) {\n  console.error('Call error:', e.message);\n}`;
}
