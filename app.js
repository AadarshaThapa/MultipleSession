var app = angular.module('myApp', ['ngRoute']);

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

app.controller('SessionController', ['$location', '$scope', 'SessionService', function ($location, $scope, SessionService) {

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

        $location.path('/session');

        var sessionData = {
            username: $scope.loginData.username,
            password: $scope.loginData.password,
            isLoggedin: "true",
        };
        SessionService.startSession(accountId, sessionData)

        SessionService.checkCredentials(sessionData).then(function (accountId) {
            if (accountId) {
                $scope.startSession(accountId, sessionData);
            } else {
                console.error("Invalid username or password!");
                alert("Invalid username or password!");
            }
        });
    };


    sessionStorage.setItem('Accounts', JSON.stringify(initialAccounts));

    $scope.accounts = JSON.parse(sessionStorage.getItem('Accounts')) || [];

    $scope.startSession = function (accountId, sessionData) {

        sessionStorage.setItem('loginData', JSON.stringify($scope.loginData));
        $scope.currentAccountId = accountId;
        $scope.activeSession = { id: accountId, sessionData: sessionData.data };
        // $location.path('/session');

    };

    $scope.endSession = function () {
        $location.path('/login');
        sessionStorage.removeItem('loginData');
        $scope.currentAccountId = null;
        $scope.activeSession = {};

    };

}]);


app.factory('SessionService', ['$q', '$location', function ($q, $location) {
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


        checkCredentials: function (loginData) {
            var deferred = $q.defer();
            var request = indexedDB.open("LoginCredentialsDB");

            request.onsuccess = function (event) {
                var db = event.target.result;
                var transaction = db.transaction(["loginCredentials"], "readonly");
                var objectStore = transaction.objectStore("loginCredentials");
                var index = objectStore.index("username");

                var getRequest = index.get(loginData.username);
                getRequest.onsuccess = function (event) {
                    var credential = event.target.result;
                    if (credential && credential.password === loginData.password) {
                        deferred.resolve(credential.id);
                    } else {
                        deferred.resolve(null);
                    }
                };

                getRequest.onerror = function (event) {
                    console.error("Error retrieving data from indexedDB:", event.target.error);
                    deferred.resolve(null);
                };

                transaction.oncomplete = function (event) {
                    db.close();
                };
            };

            request.onerror = function (event) {
                console.error("Error", event.target.error);
                deferred.resolve(null);
            };

            return deferred.promise;
        }
    };
}]);







