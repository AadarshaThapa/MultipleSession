var app = angular.module('myApp', ['ngRoute', 'ngIdle']);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/login', {
            templateUrl: 'login.html',
            controller: 'SessionController'
        })
        .when('/session', {
            templateUrl: 'session.html',
            controller: 'SessionController'
        })
        .otherwise({
            redirectTo: '/login'
        });

}]);

app.controller('SessionController', ['$location', '$scope', 'Idle', 'Keepalive', 'SessionService', function ($location, $scope, SessionService, Idle, Keepalive,) {

    var request = indexedDB.open("LoginCredentialsDB", 1);

    request.onupgradeneeded = function (event) {
        var db = event.target.result;
        var objectStore = db.createObjectStore("loginCredentials", { keyPath: "id", autoIncrement: true });

        objectStore.add({
            username: "test1", password: "test1", sessionData: {
                data: "User1 Logged"
            }
        });
        objectStore.add({
            username: "test2", password: "test2", sessionData: {
                data: "User2 Logged"
            }
        });
        objectStore.add({
            username: "test3", password: "test3", sessionData: {
                data: "User3 Logged"
            }
        });
    };

    $scope.isLoggedIn = function () {
        return $scope.currentAccountId !== null;
    };

    $scope.currentAccountId = null;
    $scope.activeSession = {};
    $scope.loginData = {
        "username": "",
        "password": "",
        "isLoggedin": "false"
    };

    var initialAccounts = [
        {
            id: 'user1', name: 'User 1', sessionData: {
                data: "User1 Logged"
            }
        },
        {
            id: 'user2', name: 'User 2', sessionData: {
                data: "User2 Logged"
            }
        }
    ];



    $scope.loginButton = function () {
        var username = $scope.loginData.username;
        var password = $scope.loginData.password;


        var sessionID = generateSessionID();
        $scope.loginData.sessionId = sessionID;


        var sessionData = {
            username: $scope.loginData.username,
            password: $scope.loginData.password,
            isLoggedin: "true",
            sessionID: sessionID
        };

        sessionStorage.setItem('LoginCred', JSON.stringify(sessionData));
        sessionStorage.setItem('loginData', JSON.stringify($scope.loginData));



        var request = indexedDB.open("LoginCredentialsDB", 1);

        request.onsuccess = function (event) {
            var db = event.target.result;
            var transaction = db.transaction(["loginCredentials"], "readonly");
            var objectStore = transaction.objectStore("loginCredentials");
            var request = objectStore.openCursor();

            request.onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {

                    if (cursor.value.username === username && cursor.value.password === password) {

                        $location.path('/session');
                        $scope.$apply();
                        return;
                    }
                    cursor.continue();
                } else {

                    alert("Invalid username or password");
                }
            };
        };
    };



    sessionStorage.setItem('Accounts', JSON.stringify(initialAccounts));

    $scope.accounts = JSON.parse(sessionStorage.getItem('Accounts')) || [];

    $scope.startSession = function (accountId, sessionData) {
        sessionStorage.setItem('loginData', JSON.stringify($scope.loginData));
        $scope.currentAccountId = accountId;
        $scope.activeSession = { id: accountId, sessionData: sessionData.data };


    };

    $scope.endSession = function () {
        $location.path('/login');
        sessionStorage.removeItem('loginData');
        sessionStorage.removeItem('LoginCred');
        $scope.currentAccountId = null;
        $scope.activeSession = {};

    };


    function generateSessionID() {
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var sessionID = '';

        var characterslength = characters.length;

        for (i = 0; i <= 6; i++) {
            sessionID += characters.charAt(Math.floor(Math.random() * characterslength));

        }
        return sessionID;
    }


}]);


app.factory('SessionService', [function () {
    return {
        startSession: function (accountId, sessionData) {
            sessionStorage.setItem(accountId, JSON.stringify(sessionData));
        },
        endSession: function (accountId) {
            sessionStorage.removeItem(accountId);
        },
        getSessionData: function (accountId) {
            var sessionData = sessionStorage.getItem(accountId);
            return sessionData ? JSON.parse(sessionData) : null;
        },



    };
}]);





