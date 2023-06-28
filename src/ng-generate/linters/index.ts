import {
    Rule,
    chain,
} from '@angular-devkit/schematics';
// import {
//     apply,
//     filter,
//     mergeWith,
//     move,
//     renameTemplateFiles,
//     Rule,
//     strings,
//     template,
//     Tree,
//     url,
//     chain,
// } from '@angular-devkit/schematics';
// import { addPackageJsonDependency, NodeDependency, NodeDependencyType } from '../../utils/dependencies';
// import { LintersOptions } from '../../utils/interfaces/lintersOptions';
// import { JSONFile } from '../../utils/json-file';

export function setupLinters(_linterOptions: unknown): Rule {
    return () => {
        return chain([]);
        // return chain([addPrettier(linterOptions), linterOptions.addHusky ? addHusky(linterOptions) : noop()]);
    };
}

// export function addPrettier(options: LintersOptions): Rule {
//     return (tree: Tree) => {
//         if (!tree.exists(`.prettierrc.template`)) {
//             const sourceTemplate = url('./files');
//             const sourceParametrizeTemplate = apply(sourceTemplate, [
//                 filter(
//                     (pathModule) =>
//                         pathModule.endsWith('/.prettierrc.template') ||
//                         pathModule.endsWith('/.prettierignore.template') ||
//                         pathModule.endsWith('/.eslintrc.template') ||
//                         pathModule.endsWith('/.eslintignore.template')
//                 ),
//                 template({
//                     ...strings,
//                     ...options,
//                 }),
//                 renameTemplateFiles(),
//                 move('./'),
//             ]);
//
//             return chain([
//                 mergeWith(sourceParametrizeTemplate),
//                 addDependency('prettier', '^2.7.1'),
//                 addDependency('eslint', '^8.21.0'),
//             ]);
//         }
//     };
// }
//
// export function addHusky(options: LintersOptions): Rule {
//     return (tree: Tree) => {
//         tree.exists;
//         if (!tree.exists(`husky/pre-push`)) {
//             const sourceTemplate = url('./files/husky');
//             const sourceParametrizeTemplate = apply(sourceTemplate, [
//                 filter(
//                     (pathModule) => pathModule.endsWith('/pre-commit.template') || pathModule.endsWith('/pre-push.template')
//                 ),
//                 template({
//                     ...strings,
//                     ...options,
//                 }),
//                 renameTemplateFiles(),
//                 move('./.husky'),
//             ]);
//
//             const sourceParametrizeHuskyTemplate = apply(sourceTemplate, [
//                 filter(
//                     (pathModule) => pathModule.endsWith('/.gitignore.template') || pathModule.endsWith('/husky.sh.template')
//                 ),
//                 template({
//                     ...strings,
//                     ...options,
//                 }),
//                 renameTemplateFiles(),
//                 move('./.husky/_'),
//             ]);
//
//             return chain([
//                 mergeWith(sourceParametrizeTemplate),
//                 mergeWith(sourceParametrizeHuskyTemplate),
//                 addPackageJsonScript({
//                     name: 'prettier:check',
//                     script: 'prettier --config .prettierrc --check "src/**/**/*.ts" --ignore-path ./.prettierignore',
//                 }),
//                 addPackageJsonScript({
//                     name: 'lint',
//                     script: 'eslint . --ext .ts',
//                 }),
//                 addDependency('husky', '^8.0.1'),
//             ]);
//         }
//     };
// }
//
// const PKG_JSON_PATH = './package.json';
// function addPackageJsonScript(content: { name: string; script: string }, pkgJsonPath = PKG_JSON_PATH) {
//     return (host: Tree) => {
//         const json = new JSONFile(host, pkgJsonPath);
//         const path = ['scripts', content.name];
//         json.modify(path, content.script);
//         return host;
//     };
// }
//
// function addDependency(name: string, version: string): Rule {
//     return (host: Tree, context: SchematicContext) => {
//         context.logger.log('info', `Adding ${name}`);
//         const dependency: NodeDependency = { type: NodeDependencyType.Default, version: version, name: name };
//         addPackageJsonDependency(host, dependency);
//         context.logger.log('info', `✅️ Added "${dependency.name}" into ${dependency.type}`);
//         return host;
//     };
// }