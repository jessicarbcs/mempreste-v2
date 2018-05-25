// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

// Initialize Firebase
var config = {
    apiKey: "AIzaSyAUL1Jz6QaNkBv1gtOOPeKhd8NC3Qd2XSs",
    authDomain: "mempreste.firebaseapp.com",
    databaseURL: "https://mempreste.firebaseio.com",
    projectId: "mempreste",
    storageBucket: "mempreste.appspot.com",
    messagingSenderId: "1061869024419"
};

firebase.initializeApp(config);
var database = firebase.database();

// Firebase auth snippet
// var provider = new firebase.auth.GoogleAuthProvider();
// firebase.auth().signInWithRedirect(provider).then(function () {
//     firebase.auth().getRedirectResult().then(function (result) {
//     console.log("sucesso",result);
//     // This gives you a Google Access Token.
//         // You can use it to access the Google API.
//         var token = result.credential.accessToken;
//         // The signed-in user info.
//         var user = result.user;
//         // ...
//     }).catch(function (error) {
//         console.log("erro",error);
//         // Handle Errors here.
//         var errorCode = error.code;
//         var errorMessage = error.message;
//     });
// });


angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ion-floating-menu', 'firebase'])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            // setup an abstract state for the tabs directive
            .state('login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl'
            })

            .state('tab', {
                url: '/tab',
                abstract: true,
                templateUrl: 'templates/layout.html'
            })

            // Each tab has its own nav history stack:
            .state('tab.account', {
                url: '/account',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/tabs/tab-account.html',
                        controller: 'AccountCtrl'
                    }
                }
            })

            .state('tab.mybooks', {
                url: '/mybooks',
                views: {
                    'tab-mybooks': {
                        templateUrl: 'templates/tabs/tab-mybooks.html',
                        controller: 'MybooksCtrl'
                    }
                }
            })

            .state('tab.dash', {
                url: '/dash',
                views: {
                    'tab-dash': {
                        templateUrl: 'templates/tabs/tab-dash.html',
                        controller: 'DashCtrl'
                    }
                }
            })

            .state('tab.notifications', {
                url: '/notifications',
                views: {
                    'tab-notifications': {
                        templateUrl: 'templates/tabs/tab-notifications.html',
                        controller: 'NotificationsCtrl'
                    }
                }
            })

            .state('tab.chats', {
                url: '/chats',
                views: {
                    'tab-chats': {
                        templateUrl: 'templates/tabs/tab-chats.html',
                        controller: 'ChatsCtrl'
                    }
                }
            })
            .state('tab.chat-detail', {
                url: '/chats/:chatId',
                views: {
                    'tab-chats': {
                        templateUrl: 'templates/details/chat-detail.html',
                        controller: 'ChatDetailCtrl'
                    }
                }
            })

            .state('livro-add', {
                url: '/mybooks/:idLivro',
                params: { time: null },
                templateUrl: 'templates/details/livro-add.html',
                controller: 'LivroAddCtrl'
            })
            .state('livro-pedir', {
                url: '/allbooks/:idDono/:idLivro',
                params: { time: null },
                templateUrl: 'templates/details/livro-pedir.html',
                controller: 'LivroPedirCtrl'
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/dash');

    }).config(function ($ionicConfigProvider) {
        $ionicConfigProvider.tabs.position('bottom');
    });