import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { isInternal, presentedPath, fileNameWithoutSha } from 'travis/utils/format-config';
import { later } from '@ember/runloop';

export default Component.extend({
  copied: false,
  baseYmlName: '.travis.yml',
  vcsLinks: service(),

  buttonLabel: computed('copied', 'rawConfig.source', function () {
    let source = this.get('rawConfig.source');
    return this.get('copied') ? 'Copied!' : `Copy ${fileNameWithoutSha(source)}`;
  }),

  formattedConfig: computed('rawConfig.config', 'slug', function () {
    let config = this.get('rawConfig.config');
    try {
      return JSON.stringify(JSON.parse(config), null, 2);
    } catch (e) {
      return config;
    }
  }),

  filePath: computed('rawConfig.source', 'slug', function () {
    let source = this.get('rawConfig.source');
    let name = fileNameWithoutSha(source);
    if (name === this.baseYmlName) { return name; }

    return presentedPath(source, this.get('slug'));
  }),

  fileUrl: computed('rawConfig.source', 'slug', 'build.branchName', 'build.repo.vcsType', function () {
    const source = this.get('rawConfig.source');
    const slug = this.get('slug');
    const branchName = this.get('build.branchName');
    const vcsType = this.get('build.repo.vcsType');

    if (isInternal(source, slug)) { 
      return null;
    }
    return this.get('vcsLinks').fileUrl(vcsType, slug, branchName, fileNameWithoutSha(source));
  }),

  actions: {
    copied() {
      this.set('copied', true);
      later(() => this.set('copied', false), 3000);
    }
  }
});
