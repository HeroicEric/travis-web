Travis.Router = Ember.Router.extend
  location: 'hash'
  enableLogging: true
  initialState: 'loading'

  goToRoot: Ember.Route.transitionTo('root.home.show')
  goToStats: Ember.Route.transitionTo('root.stats')
  showRepository: Ember.Route.transitionTo('root.home.repository.show')
  showBuilds: Ember.Route.transitionTo('root.home.repository.builds.index')
  showBuild: Ember.Route.transitionTo('root.home.repository.builds.show')
  showPullRequests: Ember.Route.transitionTo('root.home.repository.pullRequests')
  showBranches: Ember.Route.transitionTo('root.home.repository.branches')
  showJob: Ember.Route.transitionTo('root.home.repository.job')
  showProfile: Ember.Route.transitionTo('root.profile')
  showAccount: Ember.Route.transitionTo('root.profile.account')
  showUserProfile: Ember.Route.transitionTo('root.profile.account.profile')

  signedIn: ->
    !!Travis.app.get('currentUser')

  requiresAuth: (path) ->
    # TODO: not sure what the path is at the moment
    path == '/profile' && !@signedIn()

  loading: Ember.Route.extend
    routePath: (router, path) ->
      router.set('lastAttemptedPath', path)
      if router.requiresAuth(path)
        router.send 'switchToUnauthenticated'
      else
        router.send 'switchToAuthenticated'

  switchToUnauthenticated: Ember.State.transitionTo('unauthenticated.index')
  switchToAuthenticated: Ember.State.transitionTo('authenticated.index')

  unauthenticated: Ember.Route.extend
    index: Ember.Route.extend
      route: '/'

      connectOutlets: (router) ->
        router.transitionTo('login')

    login: Ember.Route.extend
      route: '/login'

      connectOutlets: (router) ->
        router.get('applicationController').connectOutlet('login')

  authenticated: Ember.Route.extend
    index: Ember.Route.extend
      connectOutlets: (router) ->
        router.transitionTo('root')

        path = router.get('lastAttemptedPath')
        if path && path != '/'
          router.route(path)

  root: Ember.Route.extend
    initialState: 'home'
    loading: Ember.State.extend()

    stats: Ember.Route.extend
      route: '/stats'
      connectOutlets: (router) ->
        router.get('applicationController').connectOutlet 'statsLayout'
        $('body').attr('id', 'stats')
        router.get('statsLayoutController').connectOutlet 'top', 'top'
        router.get('statsLayoutController').connectOutlet 'main', 'stats'

    profile: Ember.Route.extend
      initialState: 'index'
      route: '/profile'
      connectOutlets: (router) ->
        router.get('applicationController').connectOutlet 'profileLayout'
        $('body').attr('id', 'profile')
        router.get('profileLayoutController').connectOutlet 'top', 'top'
        router.get('profileLayoutController').connectOutlet 'left', 'accounts'

      index: Ember.Route.extend
        route: '/'
        connectOutlets: (router) ->
          router.get('profileLayoutController').connectOutlet 'main', 'profile'
          router.get('profileController').activate 'hooks'

      account: Ember.Route.extend
        initialState: 'index'
        route: '/:login'

        connectOutlets: (router, account) ->
          if account
            params = { login: account.get('login') }
            router.get('profileController').setParams(params)
          else
            router.send 'showProfile'

        deserialize: (router, params) ->
          router.get('accountsController').findByLogin(params.login)

        serialize: (router, account) ->
          if account
            { login: account.get('login') }
          else
            {}

        index: Ember.Route.extend
          route: '/'
          connectOutlets: (router) ->
            router.get('profileController').activate 'hooks'

        profile: Ember.Route.extend
          route: '/profile'

          connectOutlets: (router) ->
            router.get('profileController').activate 'user'

    home: Ember.Route.extend
      initialState: 'show'
      route: '/'
      connectOutlets: (router) ->
        router.get('applicationController').connectOutlet 'home'
        $('body').attr('id', 'home')
        router.get('homeController').connectOutlet 'left', 'repositories'
        router.get('homeController').connectOutlet 'right', 'sidebar'
        router.get('homeController').connectOutlet 'top', 'top'
        router.get('homeController').connectOutlet 'main', 'repository'

      show: Ember.Route.extend
        route: '/'
        connectOutlets: (router) ->
          router.get('repositoryController').activate('index')

      repository: Ember.Route.extend
        initialState: 'show'
        route: '/:owner/:name'

        connectOutlets: (router, repository) ->
          params = { owner: repository.get('owner'), name: repository.get('name') }

          # TODO: we can just pass objects instead of params now, I'm leaving this
          #       to not have to rewrite too much, but it would be nice to fix this
          #       later
          router.get('repositoryController').setParams(params)

        deserialize: (router, params) ->
          slug = "#{params.owner}/#{params.name}"
          repos = Travis.Repository.bySlug(slug)
          deferred = $.Deferred()

          observer = ->
            if repos.get 'isLoaded'
              repos.removeObserver 'isLoaded', observer
              deferred.resolve repos.objectAt(0)

          repos.addObserver 'isLoaded', observer

          deferred.promise()

        serialize: (router, repository) ->
          if repository
            { owner: repository.get('owner'), name: repository.get('name') }
          else
            {}

        show: Ember.Route.extend
          route: '/'
          connectOutlets: (router) ->
            router.get('repositoryController').activate('current')

        builds: Ember.Route.extend
          route: '/builds'
          initialState: 'index'

          index: Ember.Route.extend
            route: '/'
            connectOutlets: (router, repository) ->
              router.get('repositoryController').activate 'builds'

          show: Ember.Route.extend
            route: '/:build_id'
            connectOutlets: (router, build) ->
              router.get('repositoryController').activate 'build', id: build.get('id')

            deserialize: (router, params) ->
              # Something is wrong here. If I don't use deferred, id is not
              # initialized and url ends up being /jobs/null
              # This should not be needed, as id should be immediately set on the
              # record.
              # TODO: find out why it happens
              build = Travis.Build.find params.build_id
              deferred = $.Deferred()

              observer = ->
                if build.get 'id'
                  build.removeObserver 'id', observer
                  deferred.resolve build

              build.addObserver 'id', observer

              deferred.promise()

        pullRequests: Ember.Route.extend
          route: '/pull_requests'
          connectOutlets: (router, repository) ->
            router.get('repositoryController').activate 'pull_requests'

        branches: Ember.Route.extend
          route: '/branches'
          connectOutlets: (router, repository) ->
            router.get('repositoryController').activate 'branches'

        job: Ember.Route.extend
          route: '/jobs/:job_id'
          connectOutlets: (router, job) ->
            router.get('repositoryController').activate 'job', id: job.get('id')

          deserialize: (router, params) ->
            job = Travis.Job.find params.job_id
            deferred = $.Deferred()

            observer = ->
              if job.get 'id'
                job.removeObserver 'id', observer
                deferred.resolve job
            job.addObserver 'id', observer
            deferred.promise()
