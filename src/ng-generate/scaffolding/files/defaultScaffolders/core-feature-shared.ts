export const CFS: unknown = {
  projects: [
    {
      name: 'default',
      structure: [
        {
          name: 'core',
          module: {
            flat: true,
            routing: true,
          },
          children: [
            {
              name: 'services',
              component: [{ name: 'header' }, { name: 'footer' }, { name: 'breadcrumb' }],

              children: [
                {
                  name: 'services',
                  service: [{ name: 'auth' }, { name: 'logger' }],
                },
              ],
            },
          ],
        },
        {
          name: 'features',
          hasShortPath: true,
        },
        {
          name: 'shared',
          module: {
            flat: true,
            routing: true,
          },
        },
      ],
    },
  ],
};

