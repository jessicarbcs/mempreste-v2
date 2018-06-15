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

    .controller('ChatDetailCtrl', function ($scope, $stateParams, $firebaseObject, $firebaseArray, $ionicPopup, Chats, Auth) {
        $scope.checkBtEspecial = function () {
            $scope.chatEncerrado = false;
            if ($scope.chat.status == undefined || $scope.chat.status == 0)
                if ($scope.chat.livro.dono.uid == $scope.user.uid) {
                    $scope.msgBotaoEspecial = "CONFIRMAR EMPRÉSTIMO";
                    $scope.disableBtEspecial = false;
                } else {
                    $scope.msgBotaoEspecial = "AGUARDANDO CONFIRMAÇÃO"
                    $scope.disableBtEspecial = true;
                }
            else if ($scope.chat.status == 1)
                if ($scope.chat.livro.dono.uid == $scope.user.uid) {
                    $scope.msgBotaoEspecial = "PEDIR DEVOLUÇÃO";
                    $scope.disableBtEspecial = false;
                } else {
                    $scope.msgBotaoEspecial = "DEVOLVER"
                    $scope.disableBtEspecial = false;
                }
            else if ($scope.chat.status == 1.1)
                if ($scope.chat.livro.dono.uid == $scope.user.uid) {
                    $scope.msgBotaoEspecial = "AGUARDANDO DEVOLUÇÃO";
                    $scope.disableBtEspecial = true;
                } else {
                    $scope.msgBotaoEspecial = "DEVOLVER"
                    $scope.disableBtEspecial = false;
                }
            else if ($scope.chat.status == 2)
                if ($scope.chat.livro.dono.uid == $scope.user.uid) {
                    $scope.msgBotaoEspecial = "CONFIRMAR DEVOLUÇÃO";
                    $scope.disableBtEspecial = false;
                } else {
                    $scope.msgBotaoEspecial = "AGUARDANDO CONFIRMAÇÃO"
                    $scope.disableBtEspecial = true;
                }
            else {
                $scope.msgBotaoEspecial = "DEVOLVIDO"
                $scope.disableBtEspecial = true;
                $scope.chatEncerrado = true;
            }


        }
        $scope.init = function () {
            Auth.checkLogin();
            $scope.user = Auth.user();
            $scope.chat = $firebaseObject(database.ref('chats/' + $stateParams.chatId));
            $scope.msgs = $firebaseArray(database.ref('chats/' + $stateParams.chatId + '/msgs'));

            $scope.chat.$loaded(function () {
                $scope.checkBtEspecial();
            });

            if ($scope.user) {
                $scope.msgToSave = {
                    user: {
                        uid: $scope.user.uid,
                        email: $scope.user.email
                    },
                    msg: ''
                }
            }
            $scope.execBtEspecial = function () {
                if ($scope.chat.status == undefined || $scope.chat.status == 0) {
                    if ($scope.chat.livro.dono.uid == $scope.user.uid) {
                        var confirmPopup = $ionicPopup.confirm({
                            title: 'Confirmar empréstimo ?'
                        });

                        confirmPopup.then(function (res) {
                            $scope.chat.status = 1;
                            $scope.chat.$save().then(function () {
                                $scope.msgs.$add({
                                    msg: "Confirmou o empréstimo do livro",
                                    user: {
                                        email: $scope.user.email,
                                        uid: $scope.user.uid
                                    },
                                    isEspecial: true
                                });
                                $scope.checkBtEspecial();
                            });
                        });
                    }
                } else if ($scope.chat.status == 1) {
                    if ($scope.chat.livro.dono.uid == $scope.user.uid) {
                        var confirmPopup = $ionicPopup.confirm({
                            title: 'Confirmar pedido de devolução ?'
                        });

                        confirmPopup.then(function (res) {
                            $scope.chat.status = 1.1;
                            $scope.chat.$save().then(function () {
                                $scope.msgs.$add({
                                    msg: "Solicitou a devolução do livro",
                                    user: {
                                        email: $scope.user.email,
                                        uid: $scope.user.uid
                                    },
                                    isEspecial: true
                                });
                                $scope.checkBtEspecial();
                            });
                        });
                    } else {
                        var confirmPopup = $ionicPopup.confirm({
                            title: 'Confirmar devolução ?'
                        });

                        confirmPopup.then(function (res) {
                            $scope.chat.status = 2;
                            $scope.chat.$save().then(function () {
                                $scope.msgs.$add({
                                    msg: "Confirmou a devolução do livro",
                                    user: {
                                        email: $scope.user.email,
                                        uid: $scope.user.uid
                                    },
                                    isEspecial: true
                                });
                                $scope.checkBtEspecial();
                            });
                        });
                    }
                } else if ($scope.chat.status == 1.1) {
                    if ($scope.chat.livro.pedinte.uid == $scope.user.uid) {
                        var confirmPopup = $ionicPopup.confirm({
                            title: 'Confirmar devolução ?'
                        });

                        confirmPopup.then(function (res) {
                            $scope.chat.status = 2;
                            $scope.chat.$save().then(function () {
                                $scope.msgs.$add({
                                    msg: "Confirmou a devolução do livro",
                                    user: {
                                        email: $scope.user.email,
                                        uid: $scope.user.uid
                                    },
                                    isEspecial: true
                                });
                                $scope.checkBtEspecial();
                            });
                        });
                    }
                } else if ($scope.chat.status == 2) {
                    if ($scope.chat.livro.dono.uid == $scope.user.uid) {
                        var confirmPopup = $ionicPopup.confirm({
                            title: 'Confirmar devolução ?'
                        });

                        confirmPopup.then(function (res) {
                            $scope.chat.status = 3;
                            $scope.chat.$save().then(function () {
                                $scope.msgs.$add({
                                    msg: "Confirmou a devolução do livro",
                                    user: {
                                        email: $scope.user.email,
                                        uid: $scope.user.uid
                                    },
                                    isEspecial: true
                                });
                                $scope.checkBtEspecial();
                            });
                        });
                    }
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

    .controller('LivroPedirCtrl', function ($scope, $rootScope, $firebaseObject, $state, $stateParams, $ionicHistory, $ionicPopup, Auth, Chats) {
        $scope.init = function () {
            Auth.checkLogin();
            $scope.user = Auth.user();
            if ($scope.user !== undefined) {
            }
            $scope.livro = $firebaseObject(database.ref($stateParams.idDono + "/livros/" + $stateParams.idLivro));

            Chats.chatsByUserAsPedinte($scope.user).$loaded(function (chats) {
                // console.log(chats);
                chats.forEach(chat => {
                    // Implementar estado do chat
                    if (chat.livro.uid == $stateParams.idLivro)
                        $scope.pedidoRealizado = true
                    else
                        $scope.pedidoRealizado = false
                });
            });
        }
        $scope.init();
        $rootScope.$on('$stateChangeStart', function (event, toState) {
            if (toState.name == "livro-pedir") {
                $scope.init();
            }
        });
        $scope.pedirEmprestado = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Confirmar Pedido de empréstimo'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    Chats.pedidoEmprestimo($scope.livro, $scope.user)
                    $state.go('tab.dash');
                }
            });

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
