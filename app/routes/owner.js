import $ from 'jquery';
import TravisRoute from 'travis/routes/basic';
import { inject as service } from '@ember/service';

export default TravisRoute.extend({
  auth: service(),
  deactivate() {
    return this.controllerFor('loading').set('layoutName', null);
  },

  titleToken(model) {
    let name = model.name || model.login;
    return name;
  },

  model(params) {
    const { owner } = params;
    return this.store.queryRecord('owner', { login: owner });
  },

  renderTemplate() {
    $('body').attr('id', 'owner');
    this._super(...arguments);
  },

  actions: {
    error(error, /* transition, originRoute*/) {
      const is404 = error.status === 404 || error.errors.firstObject.status === '404';

      if (!is404) {
        let message = 'There was an error while loading data, please try again.';
        this.controllerFor('error').set('layoutName', 'simple');
        this.controllerFor('error').set('message', message);
        return true;
      } else {
        error.ownerName = this.paramsFor('owner').owner;
        return true;
      }
    }
  }
});
