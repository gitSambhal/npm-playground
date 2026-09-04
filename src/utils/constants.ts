/**
 * Constants and popular package curated templates
 * Developer: Suhail Akhtar (https://suhail.top)
 */

export const APP_VERSION = 'v1.0.0';
export const DEVELOPER_NAME = 'Suhail Akhtar';
export const DEVELOPER_WEBSITE = 'https://suhail.top';

export const CDN_CONFIG = {
  'esm.sh': (pkg: string, version?: string) => `https://esm.sh/${pkg}${version ? `@${version}` : ''}`,
  'jsdelivr': (pkg: string, version?: string) => `https://cdn.jsdelivr.net/npm/${pkg}${version ? `@${version}` : ''}/+esm`,
  'unpkg': (pkg: string, version?: string) => `https://unpkg.com/${pkg}${version ? `@${version}` : ''}?module`,
  'skypack': (pkg: string, version?: string) => `https://cdn.skypack.dev/${pkg}${version ? `@${version}` : ''}`,
  'jspm': (pkg: string, version?: string) => `https://ga.jspm.io/npm:${pkg}${version ? `@${version}` : ''}`,
};

export interface PopularPackagePreset {
  name: string;
  category: 'Utility' | 'Date & Time' | 'Math & Science' | 'Validation' | 'Visual & UI' | 'Algorithms' | 'Data & State';
  description: string;
  defaultCode: string;
  snippets: {
    title: string;
    description: string;
    code: string;
  }[];
}

export const POPULAR_PACKAGES: PopularPackagePreset[] = [
  {
    name: 'lodash-es',
    category: 'Utility',
    description: 'Modern JavaScript utility library delivering modularity, performance, & extras.',
    defaultCode: `// Lodash-es utility test
import { chunk, shuffle, debounce, groupBy, keyBy, cloneDeep, merge } from 'PKG_IMPORT';

const users = [
  { id: 1, name: 'Alex', role: 'admin', age: 29 },
  { id: 2, name: 'Sara', role: 'user', age: 24 },
  { id: 3, name: 'Liam', role: 'user', age: 31 },
  { id: 4, name: 'Emma', role: 'admin', age: 28 },
];

console.log('Group users by role:', groupBy(users, 'role'));
console.log('Chunked array:', chunk([1, 2, 3, 4, 5, 6, 7], 3));
console.log('Shuffled numbers:', shuffle([10, 20, 30, 40, 50]));

const complexObject = { profile: { theme: 'dark', tags: ['dev', 'npm'] } };
const cloned = cloneDeep(complexObject);
cloned.profile.theme = 'light';
console.log('Original theme:', complexObject.profile.theme, '| Cloned theme:', cloned.profile.theme);
`,
    snippets: [
      {
        title: 'groupBy & keyBy',
        description: 'Aggregate and index collections easily',
        code: `import { groupBy, keyBy } from 'PKG_IMPORT';
const items = [{ cat: 'fruit', name: 'apple' }, { cat: 'fruit', name: 'banana' }, { cat: 'veg', name: 'carrot' }];
console.table(items);
console.log('Grouped:', groupBy(items, 'cat'));
console.log('Keyed by name:', keyBy(items, 'name'));`
      },
      {
        title: 'Deep Merge & Clone',
        description: 'Safely clone and merge deeply nested objects',
        code: `import { merge, cloneDeep } from 'PKG_IMPORT';
const defaultSettings = { ui: { theme: 'dark', fontSize: 14 }, network: { retry: 3 } };
const userSettings = { ui: { fontSize: 16 } };
const finalConfig = merge(cloneDeep(defaultSettings), userSettings);
console.log('Merged Settings:', finalConfig);`
      }
    ]
  },
  {
    name: 'date-fns',
    category: 'Date & Time',
    description: 'Modern JavaScript date utility library (tree-shakable and lightweight).',
    defaultCode: `// Date manipulation with date-fns
import { format, formatDistanceToNow, addDays, subHours, isAfter } from 'PKG_IMPORT';

const now = new Date();
const targetDate = addDays(now, 5);
const pastDate = subHours(now, 48);

console.log('Formatted Current Date:', format(now, 'yyyy-MM-dd HH:mm:ss'));
console.log('Friendly Relative Time:', formatDistanceToNow(pastDate, { addSuffix: true }));
console.log('Is 5 days ahead after now?:', isAfter(targetDate, now));
console.log('Target Formatted:', format(targetDate, 'EEEE, MMMM do yyyy'));
`,
    snippets: [
      {
        title: 'Relative Time Formatting',
        description: 'Compute human-readable time spans',
        code: `import { formatDistance, subMonths } from 'PKG_IMPORT';
const release = subMonths(new Date(), 3);
console.log('Released:', formatDistance(release, new Date(), { addSuffix: true }));`
      },
      {
        title: 'Calendar & Add / Subtract',
        description: 'Perform precise date math',
        code: `import { addWeeks, format } from 'PKG_IMPORT';
const deadline = addWeeks(new Date(), 2);
console.log('Sprint Deadline:', format(deadline, 'PPPP'));`
      }
    ]
  },
  {
    name: 'zod',
    category: 'Validation',
    description: 'TypeScript-first schema declaration and validation with static type inference.',
    defaultCode: `// Schema validation with Zod
import { z } from 'PKG_IMPORT';

const UserSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
  tags: z.array(z.string()).default(['developer']),
});

// Test valid user
const validPayload = {
  username: 'suhail_ak',
  email: 'suhailak786@gmail.com',
  age: 26,
};
const parsed = UserSchema.safeParse(validPayload);
console.log('Valid check passed:', parsed.success, parsed.data);

// Test invalid user
const invalidPayload = {
  username: 'ab', // too short
  email: 'not-an-email',
};
const invalidResult = UserSchema.safeParse(invalidPayload);
if (!invalidResult.success) {
  console.warn('Validation errors caught:');
  console.table(invalidResult.error.issues);
}
`,
    snippets: [
      {
        title: 'Complex Form Schema',
        description: 'Validate nested objects with transforms and refinements',
        code: `import { z } from 'PKG_IMPORT';
const PasswordSchema = z.string().min(8).regex(/[A-Z]/, 'Must have uppercase');
console.log('Pass "Secret123":', PasswordSchema.safeParse('Secret123'));
console.log('Pass "short":', PasswordSchema.safeParse('short'));`
      }
    ]
  },
  {
    name: 'mathjs',
    category: 'Math & Science',
    description: 'An extensive math library for JavaScript and Node.js.',
    defaultCode: `// Math computation engine
import { evaluate, derivative, sqrt, matrix, det } from 'PKG_IMPORT';

console.log('Evaluate expression: 2 inch to cm =', evaluate('2 inch to cm').toString());
console.log('Evaluate formula: sin(45 deg) ^ 2 =', evaluate('sin(45 deg) ^ 2'));
console.log('Calculus derivative of x^2 + 2x at x =', derivative('x^2 + 2*x', 'x').toString());

const m = matrix([[1, 2], [3, 4]]);
console.log('Matrix determinant:', det(m));
console.log('Square root of -4 (complex):', sqrt(-4).toString());
`,
    snippets: [
      {
        title: 'Matrix Algebra',
        description: 'Matrix multiplication and linear algebra',
        code: `import { matrix, multiply, inv } from 'PKG_IMPORT';
const a = matrix([[1, 2], [3, 4]]);
const b = matrix([[5, 6], [7, 8]]);
console.log('Multiplied:', multiply(a, b).toArray());
console.log('Inverted:', inv(a).toArray());`
      }
    ]
  },
  {
    name: 'nanoid',
    category: 'Utility',
    description: 'A tiny, secure, URL-friendly, unique string ID generator for JavaScript.',
    defaultCode: `// Unique ID generation
import { nanoid, customAlphabet } from 'PKG_IMPORT';

console.log('Standard NanoID (21 chars):', nanoid());
console.log('Custom Length (10 chars):', nanoid(10));

const numericAlphabet = '0123456789ABCDEF';
const generateHex = customAlphabet(numericAlphabet, 8);
console.log('Custom 8-char Hex Token:', generateHex());
console.log('Generated batch of 5 IDs:', Array.from({ length: 5 }, () => nanoid(6)));
`,
    snippets: [
      {
        title: 'Custom Alphabet & Length',
        description: 'Create human-readable short codes or PINs',
        code: `import { customAlphabet } from 'PKG_IMPORT';
const pinCode = customAlphabet('0123456789', 6);
console.log('Generated 6-digit OTP:', pinCode());`
      }
    ]
  },
  {
    name: 'chroma-js',
    category: 'Visual & UI',
    description: 'JavaScript library for all kinds of color conversions and color scales.',
    defaultCode: `// Color manipulations with chroma-js
import chroma from 'PKG_IMPORT';

const primary = chroma('#6366f1');
console.log('Hex:', primary.hex());
console.log('HSL:', primary.hsl());
console.log('Luminance:', primary.luminance());
console.log('Contrasting text color:', chroma.contrast(primary, 'white') >= 4.5 ? '#ffffff' : '#000000');

// Create beautiful color scale
const scale = chroma.scale(['#f43f5e', '#eab308', '#10b981']).mode('lch').colors(6);
console.log('Generated 6-step palette:', scale);

console.log('Darken 20%:', primary.darken(1.2).hex());
console.log('Saturate:', primary.saturate(2).hex());
`,
    snippets: [
      {
        title: 'Palette Color Scale',
        description: 'Generate smooth multi-step gradients',
        code: `import chroma from 'PKG_IMPORT';
const gradient = chroma.scale('Viridis').colors(8);
console.log('Viridis 8 steps:', gradient);`
      }
    ]
  },
  {
    name: 'fuse.js',
    category: 'Algorithms',
    description: 'Lightweight fuzzy-search library with zero dependencies.',
    defaultCode: `// Fuzzy search with Fuse.js
import Fuse from 'PKG_IMPORT';

const books = [
  { title: "Old Man's War", author: { firstName: 'John', lastName: 'Scalzi' } },
  { title: 'The Lock Artist', author: { firstName: 'Steve', lastName: 'Hamilton' } },
  { title: 'HTML5 & CSS3', author: { firstName: 'Brian', lastName: 'Albers' } },
  { title: 'JavaScript: The Good Parts', author: { firstName: 'Douglas', lastName: 'Crockford' } },
  { title: 'Designing Data-Intensive Applications', author: { firstName: 'Martin', lastName: 'Kleppmann' } }
];

const fuse = new Fuse(books, {
  keys: ['title', 'author.firstName', 'author.lastName'],
  threshold: 0.4
});

const query = 'js good part';
const results = fuse.search(query);
console.log(\`Searching for "\${query}":\`);
console.table(results.map(r => ({ item: r.item.title, score: r.score })));
`,
    snippets: [
      {
        title: 'Search with custom weights',
        description: 'Prioritize specific fields in matching',
        code: `import Fuse from 'PKG_IMPORT';
const items = [{ name: 'React', desc: 'UI library' }, { name: 'Vue', desc: 'Progressive framework' }];
const fuse = new Fuse(items, { keys: [{ name: 'name', weight: 2 }, { name: 'desc', weight: 1 }] });
console.log(fuse.search('UI'));`
      }
    ]
  },
  {
    name: 'canvas-confetti',
    category: 'Visual & UI',
    description: 'Performant in-browser confetti effects using canvas.',
    defaultCode: `// Fire in-browser confetti on the preview stage
import confetti from 'PKG_IMPORT';

console.log('Firing celebratory confetti into DOM preview canvas...');
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 }
});

// Second burst with custom colors
setTimeout(() => {
  confetti({
    particleCount: 50,
    angle: 60,
    spread: 55,
    origin: { x: 0 },
    colors: ['#6366f1', '#ec4899', '#3b82f6']
  });
}, 300);
`,
    snippets: [
      {
        title: 'Fireworks Burst',
        description: 'Continuous fireworks animation pattern',
        code: `import confetti from 'PKG_IMPORT';
const end = Date.now() + 1000;
(function frame() {
  confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } });
  confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } });
  if (Date.now() < end) requestAnimationFrame(frame);
}());
console.log('Fireworks triggered!');`
      }
    ]
  },
  {
    name: 'axios',
    category: 'Utility',
    description: 'Promise based HTTP client for the browser and node.js.',
    defaultCode: `// Axios HTTP client sample API request
import axios from 'PKG_IMPORT';

console.log('Fetching sample TODO from JSONPlaceholder via Axios...');

try {
  const response = await axios.get('https://jsonplaceholder.typicode.com/todos/1');
  console.log('API Response Status:', response.status);
  console.log('Todo Data:', response.data);

  // Fetch users list
  const usersResponse = await axios.get('https://jsonplaceholder.typicode.com/users?_limit=3');
  console.log('Fetched 3 Users:');
  console.table(usersResponse.data.map(u => ({ name: u.name, email: u.email, city: u.address.city })));
} catch (error) {
  console.error('Axios request failed:', error.message);
}
`,
    snippets: [
      {
        title: 'POST Request',
        description: 'Send data to a sample REST endpoint',
        code: `import axios from 'PKG_IMPORT';
try {
  const res = await axios.post('https://jsonplaceholder.typicode.com/posts', {
    title: 'Testing Axios in npmPlay',
    body: 'In-browser ESM execution is amazing!',
    userId: 1,
  });
  console.log('POST Success! Created item ID:', res.data.id);
  console.log(res.data);
} catch (err) {
  console.error('POST error:', err.message);
}`
      },
      {
        title: 'Axios Instance & Timeout',
        description: 'Create custom client instance with baseURL and headers',
        code: `import axios from 'PKG_IMPORT';
const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 5000,
  headers: { 'X-Custom-Header': 'npmPlay-Client' }
});

const res = await api.get('/comments/1');
console.log('Comment fetched:', res.data);`
      }
    ]
  },
  {
    name: 'validator',
    category: 'Utility',
    description: 'A library of string validators and sanitizers.',
    defaultCode: `// String validation and sanitization
import validator from 'PKG_IMPORT';

const email = '  Suhail.Akhtar@Example.com  ';
console.log('Original email:', JSON.stringify(email));
console.log('Trimmed & Normalized:', validator.normalizeEmail(validator.trim(email)));

const testUrl = 'https://suhail.top';
console.log('Is valid URL ("' + testUrl + '")?', validator.isURL(testUrl));

const testIp = '192.168.1.1';
console.log('Is valid IPv4 ("' + testIp + '")?', validator.isIP(testIp));

const unsafeString = '<script>alert("XSS")</script>Hello World';
console.log('Sanitized (escape HTML):', validator.escape(unsafeString));
`,
    snippets: [
      {
        title: 'Credit Card & UUID validation',
        description: 'Validate standard financial and ID formats',
        code: `import validator from 'PKG_IMPORT';
console.log('Is valid UUID v4?', validator.isUUID('123e4567-e89b-12d3-a456-426614174000'));
console.log('Is strong password?', validator.isStrongPassword('SecureP@ss123'));`
      }
    ]
  },
  {
    name: 'marked',
    category: 'Utility',
    description: 'A low-level markdown compiler designed for speed.',
    defaultCode: `// Markdown parser & compiler
import { marked } from 'PKG_IMPORT';

const markdownString = \`# Hello npmPlay\n\n- Fast **ESM** execution\n- Live introspection\n- \`code blocks\` supported!\`;

const htmlOutput = await marked.parse(markdownString);
console.log('Rendered HTML output:');
console.log(htmlOutput);
`,
    snippets: [
      {
        title: 'Parse Markdown with options',
        description: 'Configure renderer and sanitization',
        code: `import { marked } from 'PKG_IMPORT';
marked.setOptions({ gfm: true, breaks: true });
console.log(await marked.parse('Hello ~~strikethrough~~'));`
      }
    ]
  },
  {
    name: 'uuid',
    category: 'Utility',
    description: 'Rigorous UUID generator for JavaScript.',
    defaultCode: `// UUID generation (v1, v4, v5)
import { v4 as uuidv4, v1 as uuidv1 } from 'PKG_IMPORT';

console.log('UUID v4 (Random):', uuidv4());
console.log('UUID v1 (Timestamp):', uuidv1());

// Generate batch of 3 unique IDs
const ids = Array.from({ length: 3 }, () => uuidv4());
console.table(ids.map((id, idx) => ({ index: idx + 1, uuid: id })));
`,
    snippets: [
      {
        title: 'Namespace UUID v5',
        description: 'Generate deterministic name-based UUIDs',
        code: `import { v5 as uuidv5 } from 'PKG_IMPORT';
const MY_NAMESPACE = '1b671a64-4055-419e-7da9-000000000000';
console.log('UUID v5:', uuidv5('suhail.top', MY_NAMESPACE));`
      }
    ]
  },
  {
    name: 'qs',
    category: 'Utility',
    description: 'A querystring parsing and stringifying library with nested object support.',
    defaultCode: `// Query string serialization and parsing
import qs from 'PKG_IMPORT';

const obj = {
  user: { name: 'Suhail', role: 'admin' },
  filters: ['active', 'verified'],
  page: 2
};

const queryString = qs.stringify(obj);
console.log('Serialized Query String:', queryString);

const parsed = qs.parse('user.name=Suhail&page=2&filters[0]=active');
console.log('Parsed Object:', parsed);
`,
    snippets: [
      {
        title: 'Custom Delimiter',
        description: 'Parse query strings with semicolon separators',
        code: `import qs from 'PKG_IMPORT';
const parsed = qs.parse('a=b;c=d', { delimiter: ';' });
console.log('Parsed with semicolon:', parsed);`
      }
    ]
  }
];
