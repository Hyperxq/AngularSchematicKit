import { WorkspaceStructure } from '../../scaffold.interfaces';

export const ATOMICDESIGN: WorkspaceStructure = {
  projects: [
    {
      name: 'default',
      structure: [
        {
          name: 'pages',
          hasShortPath: true,
        },
        {
          name: 'shared',
          hasShortPath: true,
          hasModule: true,
          children: [
            {
              name: 'components',
              children: [
                { name: 'atoms' },
                { name: 'molecules' },
                { name: 'organisms' },
                { name: 'templates' },
              ],
            },
            {
              name: 'directives',
            },
          ],
        },
      ],
    },
  ],
};