import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import jobConfigLanguage from 'travis/utils/job-config-language';
import { not } from '@ember/object/computed';

const commitMessageLimit = 72;

export default Component.extend({
  externalLinks: service(),

  tagName: 'section',
  classNames: ['build-header'],
  classNameBindings: ['item.state'],
  attributeBindings: ['jobId:data-job-id'],

  jobId: computed('item.{build,id,jobs}', function () {
    let build = this.get('item.build');
    let id = this.get('item.id');
    let jobs = this.get('item.jobs');
    if (build) {
      return id;
    } else {
      let ids = [];
      jobs = jobs || [];
      jobs.forEach(item => { ids.push(item.id); });
      return ids.join(' ');
    }
  }),

  isJob: computed('item.build', function () {
    let build = this.get('item.build');
    if (build) {
      return true;
    }
    return false;
  }),

  build: computed('isJob', function () {
    let isJob = this.isJob;
    if (isJob) {
      return this.get('item.build');
    } else {
      return this.item;
    }
  }),

  jobsConfig: computed('isJob', 'item.config', 'item.jobs.firstObject.config', function () {
    let isJob = this.isJob;
    if (isJob) {
      return this.get('item.config');
    } else {
      return this.get('item.jobs.firstObject.config');
    }
  }),

  displayCompare: computed('item.eventType', function () {
    let eventType = this.get('item.eventType');
    return !['api', 'cron'].includes(eventType);
  }),

  urlGitHubBranch: computed('item.repo.slug', 'build.branchName', function () {
    let slug = this.get('item.repo.slug');
    let branchName = this.get('build.branchName');
    return this.externalLinks.githubBranch(slug, branchName);
  }),

  urlGitHubTag: computed('item.repo.slug', 'build.tag.name', function () {
    let slug = this.get('item.repo.slug');
    let tag = this.get('build.tag.name');
    return this.externalLinks.githubTag(slug, tag);
  }),

  buildState: computed('item.jobs.firstObject.state', 'item.state', 'item.isMatrix', function () {
    let jobState = this.get('item.jobs.firstObject.state');
    let buildState = this.get('item.state');
    let isMatrix = this.get('item.isMatrix');
    if (isMatrix) {
      return buildState;
    } else {
      return jobState || buildState;
    }
  }),

  languages: computed('jobsConfig.content', function () {
    let config = this.get('jobsConfig.content');
    return jobConfigLanguage(config);
  }),

  name: computed('jobsConfig.content.name', function () {
    let name = this.get('jobsConfig.content.name');
    if (name) {
      return name;
    }
  }),

  environment: computed('jobsConfig.content.{env,gemfile}', function () {
    let env = this.get('jobsConfig.content.env');
    let gemfile = this.get('jobsConfig.content.gemfile');
    if (env) {
      return env;
    } else if (gemfile) {
      return `Gemfile: ${gemfile}`;
    }
  }),

  os: computed('jobsConfig.content.os', function () {
    let os = this.get('jobsConfig.content.os');
    if (os === 'linux' || os === 'linux-ppc64le') {
      return 'linux';
    } else if (os === 'osx') {
      return 'osx';
    } else if (os === 'windows') {
      return 'windows';
    } else {
      return 'unknown';
    }
  }),

  osIcon: computed('os', function () {
    let os = this.os;
    if (os === 'linux') {
      return 'icon-linux';
    } else if (os === 'osx') {
      return 'icon-mac';
    } else if (os === 'windows') {
      return 'icon-windows';
    }  else {
      return 'help';
    }
  }),

  commitBody: computed('item.commit.body', function () {
    let body = this.get('item.commit.body');
    this.$('commit-description').remove('fade-commit-message');

    if (body.length > commitMessageLimit) {
      this.$('.commit-description').addClass('fade-commit-message');
    }
  }),

  isNotMatrix: not('item.isMatrix'),

  actions: {
    expandEnv() {
      if (this.$('.expandEnv').css('white-space') === 'normal') {
        this.$('.detail-job-env').removeClass('expandEnv');
        this.$('.detail-job-env').addClass('closeEnv');
      } else {
        this.$('.detail-job-env').removeClass('closeEnv');
        this.$('.detail-job-env').addClass('expandEnv');
      }
    }
  }
});
