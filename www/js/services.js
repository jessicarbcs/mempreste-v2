angular.module('starter.services', [])

    .factory('Chats', function () {
        // Might use a resource here that returns a JSON array

        // Some fake testing data
        var chats = [{
            id: 0,
            name: 'Ben Sparrow',
            lastText: 'You on your way?',
            face: 'img/ben.png'
        }, {
            id: 1,
            name: 'Max Lynx',
            lastText: 'Hey, it\'s me',
            face: 'img/max.png'
        }, {
            id: 2,
            name: 'Adam Bradleyson',
            lastText: 'I should buy a boat',
            face: 'img/adam.jpg'
        }, {
            id: 3,
            name: 'Perry Governor',
            lastText: 'Look at my mukluks!',
            face: 'img/perry.png'
        }, {
            id: 4,
            name: 'Mike Harrington',
            lastText: 'This is wicked good ice cream.',
            face: 'img/mike.png'
        }];

        return {
            all: function () {
                return chats;
            },
            remove: function (chat) {
                chats.splice(chats.indexOf(chat), 1);
            },
            get: function (chatId) {
                for (var i = 0; i < chats.length; i++) {
                    if (chats[i].id === parseInt(chatId)) {
                        return chats[i];
                    }
                }
                return null;
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
