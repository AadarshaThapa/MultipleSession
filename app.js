var app = angular.module('myApp', ['ngRoute']);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/login', {
            templateUrl: 'login.html'

        })
        .when('/index', {
            templateUrl: 'index.html'

        })

        .otherwise({
            redirectTo: '/login'
        });

}]);







app.factory('SessionService', function () {
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
        }
    };
});

app.controller('SessionController', ['$scope', '$location', 'SessionService', function ($scope, $location, SessionService) {
    $scope.currentAccountId = null;
    $scope.activeSession = {};
    $scope.loginData = {
        "username": "",
        "password": ""
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
        console.log("Login button clicked")

        // $scope.startSession($scope.currentAccountId, $scope.loginData);
        // sessionStorage.setItem(loginData, JSON.stringify($scope.loginData));
        var sessionData = {
            username: $scope.loginData.username,
            password: $scope.loginData.password
        };

        SessionService.startSession($scope.currentAccountId, sessionData);

        $location.path('/index');
        // $window.location.href = 'index.html';
    };

    sessionStorage.setItem('Accounts', JSON.stringify(initialAccounts));

    $scope.accounts = JSON.parse(sessionStorage.getItem('Accounts')) || [];

    $scope.startSession = function (accountId, sessionData) {
        $location.path('/index');
        sessionStorage.setItem('loginData', JSON.stringify($scope.loginData));
        $scope.currentAccountId = accountId;
        $scope.activeSession = { id: accountId, sessionData: sessionData.data };

    };

    $scope.endSession = function () {
        $location.path('/login');
        sessionStorage.removeItem('loginData');
        $scope.currentAccountId = null;
        $scope.activeSession = {};

    };

    // $scope.loginButton = function () {
    //     $scope.startSession($scope.currentAccountId, {});
    //     $location.path('/index');

    // };



}]);
