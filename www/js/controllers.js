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

    .controller('DashCtrl', function ($scope, $ionicLoading, Auth, $http) {
        // Auth.checkLogin();
        $scope.livros = [];
        $http.get('https://www.googleapis.com/books/v1/volumes?q=intitle:harry+potter').then(function(res){
            $scope.livros = res.data.items;
        })
        // console.log($scope);
    })

    .controller('ChatsCtrl', function ($scope, Chats, Auth) {
        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //
        $scope.$on('$ionicView.enter', function (e) {

        });

        $scope.chats = Chats.all();
        $scope.remove = function (chat) {
            Chats.remove(chat);
        };
    })

    .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats, Auth) {
        $scope.chat = Chats.get($stateParams.chatId);
    })

    .controller('AccountCtrl', function ($scope, Auth) {
        $scope.settings = {
            enableFriends: true
        };
    })

    .controller('MybooksCtrl', function ($scope, $stateParams, $state, $firebaseArray, Auth) {
        $scope.init = function () {
            Auth.checkLogin();
            $scope.user = Auth.user();
            if ($scope.user !== undefined)
                $scope.livros = $firebaseArray(database.ref($scope.user.uid + "/livros"));
        }
        $scope.$on('$stateChangeStart', function (event, toState) {
            if (toState.name == "tab.mybooks") {
                $scope.init();
            }
        });
        $scope.init();
        //

        $scope.add = function () {
            $state.go('livro-add', {
                time: Date.now(),
                idLivro: 'new'
            })
        }
    })

    .controller('NotificationsCtrl', function ($scope, $stateParams, Auth) {
    })

    .controller('LivroAddCtrl', function ($scope, $stateParams, $firebaseObject, $firebaseArray, $ionicTabsDelegate, Auth) {
        $scope.user = Auth.user();
        if ($scope.user != null) {
            if ($stateParams.idLivro != 'new')
                $scope.livro = $firebaseObject(database.ref($scope.user.uid + "/livros/" + $stateParams.idLivro));
            else {
                $scope.livros = $firebaseArray(database.ref($scope.user.uid + "/livros"));
                $scope.livro = {};
            }
        }
        // Salva as alterações do objeto livro seja ele um livro existente ou um novo cadastrado.
        $scope.salvar = function () {
            if ($stateParams.idLivro != 'new')
                $scope.livro.$save();
            else
                $scope.livros.$add($scope.livro);
            $state.go("app.livros")
        };
        // Retorna para view de livros.
        $scope.cancelar = function () {
            $state.go("app.livros")
        };
        // Remove um livro do banco de dados.
        $scope.remove = function () {
            $scope.livro.$remove();
            $state.go("app.livros")
        }
    });  
