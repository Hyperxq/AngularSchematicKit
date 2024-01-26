import { colors } from '../../utils/color';

export const MESSAGES = {
  WELCOME: `________________________________________
${colors.green('Welcome to')}
${colors.green(`${colors.bold('Schematic:')} Prettier`)}
________________________________________`,
  TASK_TO_BE_DONE: `
${colors.bold(colors.blue('Task to be done:'))}
   - Install prettier.
   - Add .prettierrc and .prettierignore files
`,
};
