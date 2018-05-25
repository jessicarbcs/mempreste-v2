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

    .controller('DashCtrl', function ($scope, $ionicLoading, Auth, Books, $http) {
        // Auth.checkLogin();
        $scope.livros = [];
        $http.get('https://www.googleapis.com/books/v1/volumes?q=intitle:harry+potter').then(function (res) {
            $scope.livros = res.data.items;
        })
        // console.log($scope);
    })

    .controller('ChatsCtrl', function ($scope, Chats, Auth) {
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
            // Auth.checkLogin();
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

    .controller('LivroAddCtrl', function ($scope, $firebaseArray, $ionicTabsDelegate, $ionicHistory, Auth, Books) {
        $scope.init = function () {
            Auth.checkLogin();
            $scope.user = Auth.user();
            if ($scope.user !== undefined) {
                $scope.livros = $firebaseArray(database.ref($scope.user.uid + "/livros"));
                $scope.livro = {};
            }
            $scope.search = {
                isbn: undefined
            }
        }
        $scope.$on('$stateChangeStart', function (event, toState) {
            if (toState.name == "livro-add") {
                $scope.init();
            }
        });
        $scope.init();
        // Salva as alterações do objeto livro seja ele um livro existente ou um novo cadastrado.
        $scope.salvar = function () {
            $scope.livros.$add($scope.livro);
            $ionicHistory.goBack();
        };
        // Retorna para view de livros.
        $scope.cancelar = function () {
        };
        // Busca um livro com base no isbn
        $scope.findByIsbn = function () {
            Books.findByIsbn($scope.search.isbn).then(function (res) {
                let msg = res.data.items != undefined ? 'Livro encontrado' : 'Livro não encontrado'
                if (window.plugins) {
                    window.plugins.toast.showLongBottom(msg);
                } else {
                    alert(msg)
                }
                if (res.data.items != undefined) {
                    $scope.livro = {
                        volumeInfo: res.data.items[0].volumeInfo,
                        dono: $scope.user,
                        emprestado: false
                    }
                    $ionicTabsDelegate._instances.forEach(element => {
                        if (element.$element[0].id == "addLivroTabs")
                            element.select(1);
                    });

                }
            })
        };
    });  
