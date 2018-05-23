angular.module('starter.controllers', [])

    .controller('DashCtrl', function ($scope, $ionicLoading) {
        $scope.googleSignIn = function () {
            $ionicLoading.show({
                template: 'Logging in...'
            });

            window.plugins.googleplus.login(
                {
                    'webClientId': '1061869024419-hbovvk7f17k53m1vl7jml8ovus15u8jo.apps.googleusercontent.com'
                },
                function (user_data) {
                    // For the purpose of this example I will store user data on local storage
                    UserService.setUser({
                        userID: user_data.userId,
                        name: user_data.displayName,
                        email: user_data.email,
                        picture: user_data.imageUrl,
                        accessToken: user_data.accessToken,
                        idToken: user_data.idToken
                    });

                    $ionicLoading.hide();
                    $state.go('app.home');
                },
                function (msg) {
                    console.log(msg);
                    
                    $ionicLoading.hide();
                }
            );
        };
    })

    .controller('ChatsCtrl', function ($scope, Chats) {
        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //
        //$scope.$on('$ionicView.enter', function(e) {
        //});

        $scope.chats = Chats.all();
        $scope.remove = function (chat) {
            Chats.remove(chat);
        };
    })

    .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
        $scope.chat = Chats.get($stateParams.chatId);
    })

    .controller('AccountCtrl', function ($scope) {
        $scope.settings = {
            enableFriends: true
        };
    })

    .controller('MybooksCtrl', function ($scope, $stateParams) {

    })

    .controller('NotificationsCtrl', function ($scope, $stateParams) {

    });
