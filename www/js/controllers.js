angular.module('starter.controllers', [])

    .controller('LoginCtrl', function ($scope, Auth) {
        $scope.cred = {
            email: "",
            senha: ""
        };
        $scope.login = function () {
            Auth.login($scope.cred.email, $scope.cred.senha)
        };
    })

    .controller('DashCtrl', function ($scope, $ionicLoading, Auth) {
        Auth.checkLogin();
        $scope.on('$stateChangeStart', function(){
            console.log(this);
            
        })
        // console.log($scope);
    })

    .controller('ChatsCtrl', function ($scope, Chats, Auth) {
        Auth.checkLogin();
        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //
        $scope.$on('$ionicView.enter', function(e) {
        
        });

        $scope.chats = Chats.all();
        $scope.remove = function (chat) {
            Chats.remove(chat);
        };
    })

    .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats, Auth) {
        Auth.checkLogin();
        $scope.chat = Chats.get($stateParams.chatId);
    })

    .controller('AccountCtrl', function ($scope, Auth) {
        Auth.checkLogin();
        $scope.settings = {
            enableFriends: true
        };
    })

    .controller('MybooksCtrl', function ($scope, $stateParams, Auth) {
        Auth.checkLogin();
    })

    .controller('NotificationsCtrl', function ($scope, $stateParams, Auth) {
        Auth.checkLogin();
    });
