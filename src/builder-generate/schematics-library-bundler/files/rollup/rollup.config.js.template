// import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import tsConfigPaths from "rollup-plugin-tsconfig-paths";
import alias from "@rollup/plugin-alias";

import glob from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'url';

import copy from 'rollup-plugin-copy';
import cleaner from 'rollup-plugin-cleaner';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { dts } from 'rollup-plugin-dts';

import swc from '@rollup/plugin-swc';

// Convert the import.meta.url to a file path
const __filename = fileURLToPath(import.meta.url);

// Get the directory name from the file path
const __dirname = path.dirname(__filename);


function getInputsFromGlob(pattern) {
  return glob.sync(pattern).reduce((inputs, file) => {
    const name = path.basename(file, path.extname(file));
    if (name === 'public_api') return inputs;
    inputs.push(file);
    return inputs;
  }, []);
}

const tsFilesSrc = getInputsFromGlob('src/**/**/**/**/*.ts');
const buildFolderPathPattern = /^(src\/)(.*?)([/][^/]+\.ts)$/gs;
const removeSrcPattern = /^(src[/\\])(.*?)/gs;

const normalizeUrl = (url) => url.replace(/\\/g, '/');
const removeSrcPath = (string) => normalizeUrl(string).replace(removeSrcPattern, '$2');
const removeSrcFileNamePath = (string) =>
  normalizeUrl(string).replace(buildFolderPathPattern, '$2');

const basePlugins = [
  // typescript({ outputToFilesystem: false }),
  tsConfigPaths(),
  peerDepsExternal(),
  nodeResolve({ extensions: [".ts",".js", ".json"] }),
  swc({
    // SWC configuration
    include: /\.ts?$/,
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: false,
      },
      baseUrl: '.',
      target: 'ES2021',
    },
    module: {
      type: 'commonjs',
    },
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
  }),
];
const baseExternal = [
  'node:module',
  'ansi-colors',
  'ora',
  'inquirer',
  'tty',
  'node-emoji',
  '@angular-devkit/schematics/tasks',
  '@angular-devkit/schematics-cli',
  '@angular-devkit/schematics',
  'winston',
  'winston-console-format'
];

export default [
  {
    input: 'src/public_api.ts',
    output: [
      {
        dir: 'dist',
        format: 'cjs',
        preserveModules: true,
      },
    ],
    external: baseExternal,
    plugins: [
      ...basePlugins,
      cleaner({
        targets: ['./dist/'],
        silence: false,
      }),
      copy({
        targets: [
          {
            src: 'package.json',
            dest: 'dist',
            transform: (contents) => {
              const packageData = JSON.parse(contents.toString());
              delete packageData.scripts;
              delete packageData.devDependencies;
              delete packageData.keywords;
              delete packageData.engines;
              return JSON.stringify(packageData, null, 2);
            },
          },
          {
            src: 'README.md',
            dest: 'dist',
          },
          {
            src: 'src/collection.json',
            dest: 'dist',
          },
          {
            src: 'src/**/**/*.json',
            dest: 'dist/',
            rename: (name, extension, fullPath) => {
              return removeSrcPath(fullPath);
            },
          },
          {
            src: ['src/**/**/**/**/*.template', 'src/**/**/**/**/.*.template'],
            dest: 'dist/',
            rename: (name, extension, fullPath) => {
              return removeSrcPath(fullPath);
            },
          },
        ],
        hook: 'writeBundle',
      }),
    ],
  },
  ...tsFilesSrc.map((file) => ({
    input: file,
    output: {
      dir: `dist/${removeSrcFileNamePath(file)}`,
      format: 'cjs',
      exports: 'auto',
    },
    plugins: [...basePlugins,
      alias({
        entries: [
          { find: 'utils', replacement: '../../utils' }
        ]
      })
    ],
    external: baseExternal,
  })),

  ...tsFilesSrc.map((file) => ({
    input: file,
    output: {
      dir: `dist/${removeSrcFileNamePath(file)}`,
    },
    plugins: [dts()],
  })),
];
