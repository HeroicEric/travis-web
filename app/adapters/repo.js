import V3Adapter from 'travis/adapters/v3';
import config from 'travis/config/environment';

const { apiEndpoint } = config;

export default V3Adapter.extend({
  defaultSerializer: '-repo',

  includes: [
    'build.branch',
    'build.commit',
    'build.created_by',
    'build.request',
    'repository.current_build',
    'repository.default_branch',
    'repository.email_subscribed',
    'repository.vcs_type',
    'owner.github_id',
    'owner.installation',
    'owner.vcs_id',
    'owner.vcs_type',
  ].join(','),

  buildURL(modelName, id, snapshot, requestType, query) {
    if (query) {
      const custom = query.custom;
      delete query.custom;
      if (custom && custom.type === 'byOwner') {
        const { owner } = custom;
        return `${apiEndpoint}/owner/${owner}/repos`;
      }
    }
    return this._super(...arguments);
  },

  activate(id) {
    const url = `${apiEndpoint}/repo/${id}/activate`;
    return this.ajax(url, 'POST');
  },

  deactivate(id) {
    const url = `${apiEndpoint}/repo/${id}/deactivate`;
    return this.ajax(url, 'POST');
  },
});
