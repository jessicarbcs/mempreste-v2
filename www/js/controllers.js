angular.module('starter.controllers', [])

    .controller('LoginCtrl', function ($scope, Auth) {
        $scope.cred = {
            email: "",
            senha: ""
        };
        $scope.login = function () {
            Auth.login($scope.cred.email, $scope.cred.senha)
        };
        Auth.login("jessicarcarvalho@hotmail.com", "123456")
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
    })

    .controller('ChatsCtrl', function ($scope, $firebaseArray, Chats, Auth) {
        $scope.init = function () {
            Auth.checkLogin();
            $scope.user = Auth.user();
            $scope.loadChats();
        }

        $scope.loadChats = function () {
            let refAsPedinte = database.ref('chats');
            $scope.msgs = new Array();
            $firebaseArray(refAsPedinte).$loaded(function (data) {
                data.forEach(element => {
                    let pessoa = undefined;
                    if (element.livro.dono.uid == $scope.user.uid)
                        pessoa = element.livro.pedinte;
                    else if (element.livro.pedinte.uid == $scope.user.uid)
                        pessoa = element.livro.dono;
                    if (pessoa != undefined)
                        $scope.msgs.push({
                            id: element.$id,
                            pessoa: pessoa,
                            livro: element.livro
                        });
                });
            });
        }
        $scope.$on('$stateChangeStart', function (event, toState) {
            if (toState.name == "tab.chats") {
                $scope.init();
            }
        });
        $scope.init();
        //
        $scope.remove = function (chat) {
            Chats.remove(chat);
        };
    })

    .controller('ChatDetailCtrl', function ($scope, $stateParams, $firebaseObject, $firebaseArray, Chats, Auth) {
        $scope.init = function () {
            Auth.checkLogin();
            $scope.user = Auth.user();
            $scope.chat = $firebaseObject(database.ref('chats/' + $stateParams.chatId));
            $scope.msgs = $firebaseArray(database.ref('chats/' + $stateParams.chatId + '/msgs'));

            if ($scope.user) {
                $scope.msgToSave = {
                    user: {
                        uid: $scope.user.uid,
                        email: $scope.user.email
                    },
                    msg: ''
                }
            }
        }
        $scope.$on('$stateChangeStart', function (event, toState) {
            if (toState.name == "tab.chat-detail") {
                $scope.init();
            }
        });
        $scope.init();
        //
        $scope.isReceived = function (msg) {
            return msg.user.uid != $scope.user.uid;
        }
        $scope.send = function () {
            $scope.msgs.$add($scope.msgToSave);
            $scope.msgToSave.msg = "";
        }
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
    .controller('LivroAddCtrl', function ($scope, $firebaseArray, $ionicTabsDelegate, $ionicHistory, $ionicLoading, $ionicPopup, Auth, Books) {
        $scope.init = function () {
            Auth.checkLogin();
            $scope.user = Auth.user();
            if ($scope.user !== undefined) {
                $scope.livros = $firebaseArray(database.ref($scope.user.uid + "/livros"));
                $scope.livro = {
                    volumeInfo: {
                        imageLinks: {
                        }
                    },
                    dono: {
                        id: $scope.user.uid,
                        email: $scope.user.email
                    },
                    emprestado: false
                };
            }
            $scope.search = {
                isbn: undefined
            }
            $scope.hasCamera = navigator.camera !== undefined;
        }
        $scope.$on('$stateChangeStart', function (event, toState) {
            if (toState.name == "livro-add") {
                $scope.init();
            }
        });
        $scope.init();
        // Salva as alterações do objeto livro seja ele um livro existente ou um novo cadastrado.
        $scope.salvar = function () {
            if (!$scope.isByISBN) {
                $scope.livro.volumeInfo.authors = [$scope.livro.volumeInfo.authors]
            }
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
                    $scope.isByISBN = true;
                    $ionicTabsDelegate._instances.forEach(element => {
                        if (element.$element[0].id == "addLivroTabs")
                            element.select(1);
                    });

                }
            })
        };
        // Ler o arquivo de foto selecionado
        $scope.uploadFileFromInput = function (files) {
            $scope.arquivoImg = files[0];
            var reader = new FileReader();
            reader.onload = function (e) {
                $scope.$apply(function () {
                    $scope.livro.volumeInfo.imageLinks.thumbnail = e.target.result;
                });
            };
            reader.readAsDataURL($scope.arquivoImg);
        };

        // Seleciona uma imagem da galeria
        $scope.selectImg = function () {
            var srcType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
            var options = setOptions(srcType);

            $ionicLoading.show({
                template: 'Loading...'
            });
            navigator.camera.getPicture(function cameraSuccess(imageUri) {
                var img = new Image();
                img.src = imageUri;
                img.onload = (() => {
                    var canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    var dataURL = canvas.toDataURL("image/png");

                    $scope.$apply(function () {
                        $scope.livro.volumeInfo.imageLinks.thumbnail = dataURL;
                        $ionicLoading.hide()
                    });
                });
            }, function cameraError(error) {
                console.debug("Unable to obtain picture: " + error, "app");
                $ionicLoading.hide();
            }, options);
        }

        // Tira uma foto
        $scope.takePhoto = function () {
            var srcType = Camera.PictureSourceType.CAMERA;
            var options = setOptions(srcType);

            $ionicLoading.show({
                template: 'Loading...'
            });
            navigator.camera.getPicture(function cameraSuccess(imageUri) {
                var img = new Image();
                img.src = imageUri;
                img.onload = (() => {
                    var canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    var dataURL = canvas.toDataURL("image/png");

                    $scope.$apply(function () {
                        $scope.livro.volumeInfo.imageLinks.thumbnail = dataURL;
                        $ionicLoading.hide()
                    });
                });
            }, function cameraError(error) {
                console.debug("Unable to obtain picture: " + error, "app");
                $ionicLoading.hide();
            }, options);
        }

        function setOptions(srcType) {
            var options = {
                // Some common settings are 20, 50, and 100
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URI,
                // In this app, dynamically set the picture source, Camera or photo gallery
                sourceType: srcType,
                encodingType: Camera.EncodingType.JPEG,
                mediaType: Camera.MediaType.PICTURE,
                allowEdit: true,
                correctOrientation: true  //Corrects Android orientation quirks
            }
            return options;
        }
    });  
