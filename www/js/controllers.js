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

    .controller('DashCtrl', function ($scope, $ionicLoading, Auth, Books, $http, $firebaseArray) {
        $scope.init = function () {
            Auth.checkLogin();
            $scope.user = Auth.user();
            $scope.livros = [];
            let allUsers = $firebaseArray(database.ref("/"));
            allUsers.$loaded(function () {
                let firebaseArrays = [];
                allUsers.forEach(user => {
                    firebaseArrays.push($firebaseArray(database.ref(user.$id + "/livros")))
                })
                firebaseArrays.forEach(fArray => {
                    fArray.$loaded(function () {
                        fArray.forEach(livro => {
                            if (livro.dono.email != $scope.user.email)
                                $scope.livros.push(livro);
                        })
                    })
                })
            })
        };
        $scope.$on('$stateChangeStart', function (event, toState) {
            if (toState.name == "tab.dash") {
                $scope.init();
            }
        });
        $scope.init();
        // $http.get('https://www.googleapis.com/books/v1/volumes?q=intitle:harry+potter').then(function (res) {
        //     $scope.livros = res.data.items;
        // })
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
            Auth.checkLogin();
            $scope.user = Auth.user();
            if ($scope.user !== undefined)
                $scope.livros = $firebaseArray(database.ref($scope.user.uid + "/livros"));

            $scope.livrosComigo = [];
            let allUsers = $firebaseArray(database.ref("/"));
            allUsers.$loaded(function () {
                let firebaseArrays = [];
                allUsers.forEach(user => {
                    firebaseArrays.push($firebaseArray(database.ref(user.$id + "/livros")))
                })
                firebaseArrays.forEach(fArray => {
                    fArray.$loaded(function () {
                        fArray.forEach(livro => {
                            if (livro.emprestado != false && livro.emprestado.email == $scope.user.email)
                                $scope.livrosComigo.push(livro);
                        })
                    })
                })
            })
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

    .controller('LivroPedirCtrl', function ($scope, $firebaseObject, $stateParams, $ionicHistory, Auth) {
        $scope.init = function () {
            Auth.checkLogin();
            $scope.user = Auth.user();
            if ($scope.user !== undefined) {
            }
            $scope.livro = $firebaseObject(database.ref($stateParams.idDono + "/livros/" + $stateParams.idLivro));
        }
        $scope.$on('$stateChangeStart', function (event, toState) {
            if (toState.name == "livro-pedir") {
                $scope.init();
            }
        });
        $scope.init();
        $scope.pedirEmprestado = function () {
            Auth.checkLogin();
            $scope.user = Auth.user();
            $scope.livro.emprestado = {
                id: $scope.user.uid,
                email: $scope.user.email
            }
            $scope.livro.$save();
            $ionicHistory.goBack();
        }
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
                        dono: {
                            id: $scope.user.uid,
                            email: $scope.user.email
                        },
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
