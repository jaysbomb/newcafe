angular.module('starter', ['ionic', 'starter.controllers',
  'LocalStorageModule', 'ion-autocomplete',
  'ngCordova', 'ngProgressLite', 'ionic-ratings',
  
])

.run(function($ionicPlatform, $rootScope, localStorageService, $state,
    ngProgressLite, $cordovaPush, $timeout, $ionicPopup) {
    $ionicPlatform.ready(function() {

      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {

        StatusBar.styleDefault();
      }

    });

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams) {
      ngProgressLite.start();
      $timeout(function() {
        ngProgressLite.done();
      }, 1000);
      // if (localStorageService.get('user') == null && toState.url != "/signup") {
      // }else{
      // }
    });

  })
  .constant('Base_Url', 'https://icafe-a.herokuapp.com/')


.config(function($stateProvider, $urlRouterProvider, ngProgressLiteProvider) {
  $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
    })

    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
    })
    .state('signup', {
      url: '/signup',
      templateUrl: 'templates/signup.html',
      controller: 'SignupCtrl'
    })

    .state('app.cart', {
      url: '/cart',
      views:{
        'menuContent': {
          templateUrl: 'templates/cart.html',
          controller: 'CartCtrl'
        } 
      }
    })
    .state('app.recommend', {
      url: '/recommend',
      views:{
        'menuContent': {
          templateUrl: 'templates/recommend.html',
          controller: 'RecommendCtrl'
        } 
      }
    })
    .state('app.salad', {
      url: '/salad',
      views:{
        'menuContent': {
          templateUrl: 'templates/salad.html',
          controller: 'SaladCtrl'
        } 
      }
    })
    .state('app.staple', {
      url: '/staple',
      views:{
        'menuContent': {
          templateUrl: 'templates/staple.html',
          controller: 'StapleCtrl'
        } 
      }
    })
    .state('app.dessert', {
      url: '/dessert',
      views:{
        'menuContent': {
          templateUrl: 'templates/dessert.html',
          controller: 'DessertCtrl'
        } 
      }
    })
    .state('app.drink', {
      url: '/drink',
      views:{
        'menuContent': {
          templateUrl: 'templates/drink.html',
          controller: 'DrinkCtrl'
        } 
      }
    })
    .state('app.soup', {
      url: '/soup',
      views:{
        'menuContent': {
          templateUrl: 'templates/soup.html',
          controller: 'SoupCtrl'
        } 
      }
    })
    .state('app.snack', {
      url: '/snack',
      views:{
        'menuContent': {
          templateUrl: 'templates/snack.html',
          controller: 'SnackCtrl'
        } 
      }
    })
    .state('app.setmeal', {
      url: '/setmeal',
      views:{
        'menuContent': {
          templateUrl: 'templates/setmeal.html',
          controller: 'SetmealCtrl'
        } 
      }
    })
    .state('app.dishes', {
      url: '/dishes',
      views:{
        'menuContent': {
          templateUrl: 'templates/dishes.html',
          controller: 'DishesCtrl'
        } 
      }
    })
    .state('app.pay', {
      url: '/pay',
      views:{
        'menuContent': {
          templateUrl: 'templates/pay.html',
          controller: 'PayCtrl'
        } 
      }
    })
    .state('app.order', {
      url: '/order',
      views:{
        'menuContent': {
          templateUrl: 'templates/order.html',
          controller: 'OrderCtrl'
        } 
      }
    })
    .state('app.users', {
      url: '/users',
      views:{
        'menuContent': {
          templateUrl: 'templates/users.html',
          controller: 'UsersCtrl'
        } 
      }
    })
    .state('logout', {
      url: '/logout',
      controller: 'LogoutCtrl'
    })
    .state('app.admin', {
      url: '/admin',
      views: {
        'menuContent': {
          templateUrl: 'templates/admin.html',
          controller: 'AdminCtrl'
        }
      }
    })
  ngProgressLiteProvider.settings.speed = 1000;
  $urlRouterProvider.otherwise('/app/recommend');
});
