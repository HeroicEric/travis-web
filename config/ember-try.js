module.exports = {
  scenarios: [
    {
      name: 'ember-beta',
      npm: {
        devDependencies: {
          'ember-source': 'beta'
        }
      }
    },
    {
      name: 'ember-canary',
      npm: {
        devDependencies: {
          'ember-source': 'canary'
        }
      }
    },
    {
      name: 'ember-data-beta',
      npm: {
        devDependencies: {
          'ember-data': 'beta'
        }
      }
    }
  ],
};
