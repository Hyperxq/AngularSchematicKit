import { WorkspaceStructure } from '../../scaffold.interfaces';

export const CFS: WorkspaceStructure = {
  projects: [
    {
      name: 'default',
      structure: [
        {
          name: 'core',

          hasModule: true,
          children: [
            {
              name: 'service',
              children: [{ name: 'data' }, { name: 'logic' }],
            },
          ],
        },
        {
          name: 'features',
          hasShortPath: true,
        },
        {
          name: 'shared',

          hasModule: true,
        },
      ],
    },
  ],
};

