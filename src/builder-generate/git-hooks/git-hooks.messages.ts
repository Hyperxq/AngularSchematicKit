import { colors } from '../../utils/color';

export const MESSAGES = {
  TASK_TO_BE_DONE: `________________________________________
  
${colors.bold(colors.green('Git Hooks'))}  
________________________________________
${colors.bold(colors.blue('Task to be done:'))}
   - Install Husky.
   - Add .husky.sh file
   - Install lint-staged.
   - Add .pre-commit and pre-push files
`,
};
