export const ATOMIC_DESIGN: unknown = {
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
          module: {
            flat: true,
            routing: true,
          },
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