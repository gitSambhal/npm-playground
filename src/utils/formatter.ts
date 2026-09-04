/**
 * Code Formatter using Prettier Standalone
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import prettier from 'prettier/standalone';
import babelPlugin from 'prettier/plugins/babel';
import estreePlugin from 'prettier/plugins/estree';

export async function formatJavaScriptCode(code: string): Promise<string> {
  try {
    const formatted = await prettier.format(code, {
      parser: 'babel',
      plugins: [babelPlugin, estreePlugin],
      singleQuote: true,
      trailingComma: 'es5',
      printWidth: 80,
      tabWidth: 2,
    });
    return formatted;
  } catch (err) {
    console.warn('Prettier format warning, falling back to original code:', err);
    return code;
  }
}
