angular.module('starter.services', [])

    .factory('Chats', function ($q, $firebaseArray) {
        return {
            pedidoEmprestimo: function (livro, pedinte) {
                let chat = {
                    livro: {
                        uid: livro.$id,
                        nome: livro.volumeInfo.title,
                        dono: {
                            nome: livro.dono.email,
                            uid: livro.dono.id
                        },
                        pedinte: {
                            nome: pedinte.email,
                            uid: pedinte.uid
                        }
                    },
                    msgs: [
                        // msg especial de confirmação de entrega
                        {
                            msg: "Empresta aí vai",
                            user: {
                                nome: pedinte.email,
                                uid: pedinte.uid
                            }
                        }
                    ]
                }
                $firebaseArray(database.ref('chats')).$loaded(function(data){
                    data.$add(chat)
                    console.log(chat);
                    
                })
            },
            chatsByUserAsPedinte: function (pedinte){
                return $firebaseArray(database.ref().child('chats').orderByChild('livro/pedinte/uid').equalTo(pedinte.uid));
            }
        };
    })
    .factory('Books', function ($http, $firebaseArray) {
        return {
            findByIsbn: function (isbn) {
                return $http.get('https://www.googleapis.com/books/v1/volumes?q=isbn:' + isbn)
            }
        }
    })

    .factory('Auth', function ($firebaseAuth, $state) {
        let fireAuth = $firebaseAuth();
        let user = undefined;
        //
        let login = function (email, password) {
            fireAuth.$signInWithEmailAndPassword(email, password).then(function (res) {
                user = res.user;
                $state.go('tab.dash')
            }).catch(function (error) {
                console.error("Authentication failed:", error);
            });
        };
        let getUser = function () {
            return user;
        }
        let checkLogin = function () {
            if (user == undefined)
                $state.go('login')
        }

        return {
            login: login,
            user: getUser,
            checkLogin: checkLogin
        };
    });
