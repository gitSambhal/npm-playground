/**
 * Editor Themes Configuration
 * Developer: Suhail Akhtar (https://suhail.top)
 */

export interface EditorTheme {
  id: string;
  name: string;
  bg: string;
  text: string;
  border: string;
  gutterBg: string;
  gutterText: string;
  selection: string;
  accent: string;
}

export const EDITOR_THEMES: EditorTheme[] = [
  {
    id: 'dracula',
    name: 'Dracula',
    bg: '#282a36',
    text: '#bd93f9',
    border: '#44475a',
    gutterBg: '#21222c',
    gutterText: '#6272a4',
    selection: '#44475a',
    accent: '#bd93f9',
  },
  {
    id: 'onedark',
    name: 'One Dark Pro',
    bg: '#1e1e24',
    text: '#61afef',
    border: '#2c313a',
    gutterBg: '#181a1f',
    gutterText: '#4b5263',
    selection: '#3e4451',
    accent: '#61afef',
  },
  {
    id: 'nord',
    name: 'Nord',
    bg: '#2e3440',
    text: '#88c0d0',
    border: '#4c566a',
    gutterBg: '#242933',
    gutterText: '#616e88',
    selection: '#434c5e',
    accent: '#88c0d0',
  },
  {
    id: 'monokai',
    name: 'Monokai Pro',
    bg: '#2d2a2e',
    text: '#ffd866',
    border: '#403e41',
    gutterBg: '#221f22',
    gutterText: '#727072',
    selection: '#5b595c',
    accent: '#ffd866',
  },
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    bg: '#0d1117',
    text: '#58a6ff',
    border: '#30363d',
    gutterBg: '#010409',
    gutterText: '#484f58',
    selection: '#1f6feb33',
    accent: '#58a6ff',
  },
  {
    id: 'github-light',
    name: 'GitHub Light',
    bg: '#ffffff',
    text: '#0366d6',
    border: '#e1e4e8',
    gutterBg: '#f6f8fa',
    gutterText: '#959da5',
    selection: '#0366d622',
    accent: '#0366d6',
  },
];
