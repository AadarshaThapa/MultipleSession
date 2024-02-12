var app = angular.module('myApp', []);

app.factory('SessionService', function () {

    // var sessions = {};

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

app.controller('SessionController', ['$scope', 'SessionService', function ($scope, SessionService) {
    $scope.currentAccountId = null;
    $scope.activeSession = {};

    var initialAccounts = [
        { id: 'user1', name: 'User 1', sessionData: {} },
        { id: 'user2', name: 'User 2', sessionData: {} }
    ];

    sessionStorage.setItem('Accounts', JSON.stringify(initialAccounts));

    $scope.accounts = JSON.parse(sessionStorage.getItem('Accounts')) || [];

    $scope.startSession = function (accountId, sessionData) {
        SessionService.startSession(accountId, sessionData);
        $scope.currentAccountId = accountId;
        $scope.activeSession = { id: accountId, sessionData: sessionData };
    };

    $scope.endSession = function () {
        SessionService.endSession($scope.currentAccountId);
        $scope.currentAccountId = null;
        $scope.activeSession = {};
    };
}]);
