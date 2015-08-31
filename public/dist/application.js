'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
    // Init module configuration options
    var applicationModuleName = 'babeinventory';
    var applicationModuleVendorDependencies = ['ngResource', 'ngCookies',  'ngAnimate',  'ngTouch',  'ngSanitize',  'ui.router', 'ui.bootstrap', 'ui.utils', 'ngTable', 'formly', 'formlyBootstrap'];

    // Add a new vertical module
    var registerModule = function(moduleName, dependencies) {
        // Create angular module
        angular.module(moduleName, dependencies || []);

        // Add the module to the AngularJS configuration file
        angular.module(applicationModuleName).requires.push(moduleName);
    };

    return {
        applicationModuleName: applicationModuleName,
        applicationModuleVendorDependencies: applicationModuleVendorDependencies,
        registerModule: registerModule
    };
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix('!');
    }
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
    //Fixing facebook bug with redirect
    if (window.location.hash === '#_=_') window.location.hash = '#!';

    //Then init the app
    angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

// Use application configuration module to register a new module
ApplicationConfiguration.registerModule('locations', ['core']);

'use strict';

// Use application configuration module to register a new module
ApplicationConfiguration.registerModule('users');

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');

        // Home state routing
        $stateProvider.
        state('home', {
            url: '/',
            templateUrl: 'modules/core/views/home.client.view.html'
        });
    }
]);
'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus',
    function($scope, Authentication, Menus) {
        $scope.authentication = Authentication;
        $scope.isCollapsed = false;
        $scope.menu = Menus.getMenu('topbar');

        $scope.toggleCollapsibleMenu = function() {
            $scope.isCollapsed = !$scope.isCollapsed;
        };

        // Collapsing the menu after navigation
        $scope.$on('$stateChangeSuccess', function() {
            $scope.isCollapsed = false;
        });
    }
]);
'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication',
    function($scope, Authentication) {
        // This provides Authentication context.
        $scope.authentication = Authentication;
    }
]);
'use strict';

angular.module('core')
  .directive('ngReallyClick', ['$modal',
    function($modal) {

      var ModalInstanceCtrl = ["$scope", "$modalInstance", function($scope, $modalInstance) {
        $scope.ok = function() {
          $modalInstance.close();
        };

        $scope.cancel = function() {
          $modalInstance.dismiss('cancel');
        };
      }];

      return {
        restrict: 'A',
        scope: {
          ngReallyClick: '&'
        },
        link: function(scope, element, attrs) {

          element.bind('click', function() {
            var message = attrs.ngReallyMessage || 'Are you sure ?';

            var modalHtml = '<div class="modal-body">' + message + '</div>';
            modalHtml += '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button><button class="btn btn-warning" ng-click="cancel()">Cancel</button></div>';

            var modalInstance = $modal.open({
              template: modalHtml,
              controller: ModalInstanceCtrl
            });

            modalInstance.result.then(function() {
              scope.ngReallyClick();
            }, function() {
              //Modal dismissed
            });

          });

        }

      };

    }

  ]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

    function() {
        // Define a set of default roles
        this.defaultRoles = ['*'];

        // Define the menus object
        this.menus = {};

        // A private function for rendering decision
        var shouldRender = function(user) {
            if (user) {
                if (!!~this.roles.indexOf('*')) {
                    return true;
                } else {
                    for (var userRoleIndex in user.roles) {
                        for (var roleIndex in this.roles) {
                            if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
                                return true;
                            }
                        }
                    }
                }
            } else {
                return this.isPublic;
            }

            return false;
        };

        // Validate menu existance
        this.validateMenuExistance = function(menuId) {
            if (menuId && menuId.length) {
                if (this.menus[menuId]) {
                    return true;
                } else {
                    throw new Error('Menu does not exists');
                }
            } else {
                throw new Error('MenuId was not provided');
            }

            return false;
        };

        // Get the menu object by menu id
        this.getMenu = function(menuId) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Return the menu object
            return this.menus[menuId];
        };

        // Add new menu object by menu id
        this.addMenu = function(menuId, isPublic, roles) {
            // Create the new menu
            this.menus[menuId] = {
                isPublic: isPublic || false,
                roles: roles || this.defaultRoles,
                items: [],
                shouldRender: shouldRender
            };

            // Return the menu object
            return this.menus[menuId];
        };

        // Remove existing menu object by menu id
        this.removeMenu = function(menuId) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Return the menu object
            delete this.menus[menuId];
        };

        // Add menu item object
        this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Push new menu item
            this.menus[menuId].items.push({
                title: menuItemTitle,
                link: menuItemURL,
                menuItemType: menuItemType || 'item',
                menuItemClass: menuItemType,
                uiRoute: menuItemUIRoute || ('/' + menuItemURL),
                isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
                roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
                position: position || 0,
                items: [],
                shouldRender: shouldRender
            });

            // Return the menu object
            return this.menus[menuId];
        };

        // Add submenu item object
        this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Search for menu item
            for (var itemIndex in this.menus[menuId].items) {
                if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
                    // Push new submenu item
                    this.menus[menuId].items[itemIndex].items.push({
                        title: menuItemTitle,
                        link: menuItemURL,
                        uiRoute: menuItemUIRoute || ('/' + menuItemURL),
                        isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
                        roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
                        position: position || 0,
                        shouldRender: shouldRender
                    });
                }
            }

            // Return the menu object
            return this.menus[menuId];
        };

        // Remove existing menu object by menu id
        this.removeMenuItem = function(menuId, menuItemURL) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Search for menu item to remove
            for (var itemIndex in this.menus[menuId].items) {
                if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
                    this.menus[menuId].items.splice(itemIndex, 1);
                }
            }

            // Return the menu object
            return this.menus[menuId];
        };

        // Remove existing menu object by menu id
        this.removeSubMenuItem = function(menuId, submenuItemURL) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Search for menu item to remove
            for (var itemIndex in this.menus[menuId].items) {
                for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
                    if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
                        this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
                    }
                }
            }

            // Return the menu object
            return this.menus[menuId];
        };

        //Adding the topbar menu
        this.addMenu('topbar');
    }
]);
(function() {
    'use strict';

    angular
        .module('core')
        .factory('TableSettings', factory);

    factory.$inject = ['ngTableParams'];

    function factory(ngTableParams) {

      var getData = function(Entity) {
        return function($defer, params) {
                  Entity.get(params.url(), function(response) {
                      params.total(response.total);
                      $defer.resolve(response.results);
                  });
              };

      };

      var params = {
        page: 1,
        count: 5
      };

      var settings = {
        total: 0,
        counts: [5, 10, 15],
        filterDelay: 0,
      };

      var tableParams = new ngTableParams(params, settings);

      var getParams = function(Entity) {
        tableParams.settings({getData: getData(Entity)});
        return tableParams;
      };

      var service = {
        getParams: getParams
      };

      return service;

  }

})();

'use strict';

// Configuring the new module
angular.module('locations').run(['Menus',
    function(Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', 'Locations', 'locations', 'dropdown', '/locations(/create)?');
        Menus.addSubMenuItem('topbar', 'locations', 'List Locations', 'locations');
        Menus.addSubMenuItem('topbar', 'locations', 'New Location', 'locations/create');
    }
]);

'use strict';

//Setting up route
angular.module('locations').config(['$stateProvider',
    function($stateProvider) {
        // Locations state routing
        $stateProvider.
        state('listLocations', {
            url: '/locations',
            templateUrl: 'modules/locations/views/list-locations.client.view.html'
        }).
        state('createLocation', {
            url: '/locations/create',
            templateUrl: 'modules/locations/views/create-location.client.view.html'
        }).
        state('viewLocation', {
            url: '/locations/:locationId',
            templateUrl: 'modules/locations/views/view-location.client.view.html'
        }).
        state('editLocation', {
            url: '/locations/:locationId/edit',
            templateUrl: 'modules/locations/views/edit-location.client.view.html'
        });
    }
]);
'use strict';

// Locations controller
angular.module('locations').controller('LocationsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Locations', 'TableSettings', 'LocationsForm',
    function($scope, $stateParams, $location, Authentication, Locations, TableSettings, LocationsForm ) {
        $scope.authentication = Authentication;
        $scope.tableParams = TableSettings.getParams(Locations);
        $scope.location = {};

        $scope.setFormFields = function(disabled) {
$scope.formFields = LocationsForm.getFormFields(disabled);
        };


        // Create new Location
        $scope.create = function() {
            var location = new Locations($scope.location);

            // Redirect after save
            location.$save(function(response) {
                $location.path('locations/' + response._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing Location
        $scope.remove = function(location) {

            if ( location ) {
                location = Locations.get({locationId:location._id}, function() {
                    location.$remove();
                    $scope.tableParams.reload();
                });

            } else {
                $scope.location.$remove(function() {
                    $location.path('locations');
                });
            }

        };

        // Update existing Location
        $scope.update = function() {
            var location = $scope.location;

            location.$update(function() {
                $location.path('locations/' + location._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };



        $scope.toViewLocation = function() {
            $scope.location = Locations.get( {locationId: $stateParams.locationId} );
            $scope.setFormFields(true);
        };

        $scope.toEditLocation = function() {
            $scope.location = Locations.get( {locationId: $stateParams.locationId} );
            $scope.setFormFields(false);
        };

    }

]);

'use strict';

//Locations service used to communicate Locations REST endpoints
angular.module('locations').factory('Locations', ['$resource',
    function($resource) {
        return $resource('locations/:locationId', { locationId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
(function() {
    'use strict';

    angular
        .module('locations')
        .factory('LocationsForm', factory);
    function factory() {

      var getFormFields = function(disabled) {

        var fields = [
                    {
                    key: 'shipment',
                    type: 'input',
                    templateOptions: {
                        label: 'Shipment:',
                        disabled: disabled
                        }
                    },
                    {
                    key: 'type',
                    type: 'select',
                    templateOptions: {
                      label: 'Type',
                      options: [
                            {
                            name: 'S-TAPE',
                            value: 'S-TAPE'
                            },
                            {
                            name: 'VA16-HUMAN',
                            value: 'VA16-HUMAN'
                            },
                            {
                            name: 'KLS',
                            value: 'KLS'
                            },
                            {
                            name: 'SI',
                            value: 'SI'
                            },
                            {
                            name: 'IBODY',
                            value: 'IBODY'
                            }
                          ]
                        }
                    },
                    {
                    key: 'length',
                    type: 'select',
                    templateOptions: {
                      label: 'Length',
                      options: [
                            {
                            name: '14',
                            value: '14'
                            },
                            {
                            name: '16',
                            value: '16'
                            },
                            {
                            name: '18',
                            value: '18'
                            },
                            {
                            name: '22',
                            value: '22'
                            },
                            {
                            name: 'COLOR SWATCH',
                            value: 'COLOR SWATCH'
                            }
                          ]
                        }
                    },
                    {
                    key: 'color',
                    type: 'select',
                    templateOptions: {
                      label: 'Color',
                      options: [{name: '1', value: '.1.', group: 'Normal'},{name: '2', value: '.2.', group: 'Normal'},{name: '4', value: '.4.', group: 'Normal'},{name: '6', value: '.6.', group: 'Normal'},{name: '8', value: '.8.', group: 'Normal'},{name: '10', value: '.10.', group: 'Normal'},{name: '12', value: '.12.', group: 'Normal'},{name: '24', value: '.24.', group: 'Normal'},{name: '27', value: '.27.', group: 'Normal'},{name: '60', value: '.60.', group: 'Normal'},{name: '600', value: '.600.', group: 'Normal'},{name: '613', value: '.613.', group: 'Normal'},{name: '1001', value: '.1001.', group: 'Normal'},{name: '12/600', value: '.12/600.', group: 'Normal'},{name: '1B', value: '.1B.', group: 'Normal'},{name: '27/613', value: '.27/613.', group: 'Normal'},{name: '27A', value: '.27A.', group: 'Normal'},{name: '30/33', value: '.30/33.', group: 'Normal'},{name: '3R', value: '.3R.', group: 'Normal'},{name: '5B', value: '.5B.', group: 'Normal'},{name: '5R', value: '.5R.', group: 'Normal'},{name: '6/10', value: '.6/10.', group: 'Normal'},{name: 'BLUE', value: '.BLUE.', group: 'Funky'},{name: 'BURG', value: '.BURG.', group: 'Funky'},{name: 'DKFXA', value: '.DKFXA.', group: 'Funky'},{name: 'DKPURP', value: '.DKPURP.', group: 'Funky'},{name: 'FUNKY', value: '.FUNKY.', group: 'Funky'},{name: 'O-12_600', value: '.O-12_600.', group: 'Ombre'},{name: 'O-1B_6', value: '.O-1B_6.', group: 'Ombre'},{name: 'O-4_613', value: '.O-4_613.', group: 'Ombre'},{name: 'PINK', value: '.PINK.', group: 'Funky'},{name: 'PURP', value: '.PURP.', group: 'Funky'},{name: 'RED', value: '.RED.', group: 'Funky'},{name: 'TEAL', value: '.TEAL.', group: 'Funky'}]
                        }
                    },
                    {
                    key: 'quantity',
                    type: 'input',
                    templateOptions: {
                        label: 'Quantity:',
                          disabled: disabled
                        }
                    },
                    {
                    key: 'location',
                    type: 'input',
                    templateOptions: {
                        label: 'Location:',
                          disabled: disabled
                        }
                    },

              ];

        return fields;


      };

      var service = {
        getFormFields: getFormFields
      };

      return service;

  }

})();

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
    function($httpProvider) {
        // Set the httpProvider "not authorized" interceptor
        $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
            function($q, $location, Authentication) {
                return {
                    responseError: function(rejection) {
                        switch (rejection.status) {
                            case 401:
                                // Deauthenticate the global user
                                Authentication.user = null;

                                // Redirect to signin page
                                $location.path('signin');
                                break;
                            case 403:
                                // Add unauthorized behaviour
                                break;
                        }

                        return $q.reject(rejection);
                    }
                };
            }
        ]);
    }
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
    function($stateProvider) {
        // Users state routing
        $stateProvider.
        state('profile', {
            url: '/settings/profile',
            templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
        }).
        state('password', {
            url: '/settings/password',
            templateUrl: 'modules/users/views/settings/change-password.client.view.html'
        }).
        state('accounts', {
            url: '/settings/accounts',
            templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
        }).
        state('signup', {
            url: '/signup',
            templateUrl: 'modules/users/views/authentication/signup.client.view.html'
        }).
        state('signin', {
            url: '/signin',
            templateUrl: 'modules/users/views/authentication/signin.client.view.html'
        }).
        state('forgot', {
            url: '/password/forgot',
            templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
        }).
        state('reset-invalid', {
            url: '/password/reset/invalid',
            templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
        }).
        state('reset-success', {
            url: '/password/reset/success',
            templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
        }).
        state('reset', {
            url: '/password/reset/:token',
            templateUrl: 'modules/users/views/password/reset-password.client.view.html'
        });
    }
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
    function($scope, $http, $location, Authentication) {
        $scope.authentication = Authentication;

        // If user is signed in then redirect back home
        if ($scope.authentication.user) $location.path('/');

        $scope.signup = function() {
            $http.post('/auth/signup', $scope.credentials).success(function(response) {
                // If successful we assign the response to the global user model
                $scope.authentication.user = response;

                // And redirect to the index page
                $location.path('/');
            }).error(function(response) {
                $scope.error = response.message;
            });
        };

        $scope.signin = function() {
            $http.post('/auth/signin', $scope.credentials).success(function(response) {
                // If successful we assign the response to the global user model
                $scope.authentication.user = response;

                // And redirect to the index page
                $location.path('/');
            }).error(function(response) {
                $scope.error = response.message;
            });
        };
    }
]);
'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
    function($scope, $stateParams, $http, $location, Authentication) {
        $scope.authentication = Authentication;

        //If user is signed in then redirect back home
        if ($scope.authentication.user) $location.path('/');

        // Submit forgotten password account id
        $scope.askForPasswordReset = function() {
            $scope.success = $scope.error = null;

            $http.post('/auth/forgot', $scope.credentials).success(function(response) {
                // Show user success message and clear form
                $scope.credentials = null;
                $scope.success = response.message;

            }).error(function(response) {
                // Show user error message and clear form
                $scope.credentials = null;
                $scope.error = response.message;
            });
        };

        // Change user password
        $scope.resetUserPassword = function() {
            $scope.success = $scope.error = null;

            $http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
                // If successful show success message and clear form
                $scope.passwordDetails = null;

                // Attach user profile
                Authentication.user = response;

                // And redirect to the index page
                $location.path('/password/reset/success');
            }).error(function(response) {
                $scope.error = response.message;
            });
        };
    }
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
    function($scope, $http, $location, Users, Authentication) {
        $scope.user = Authentication.user;

        // If user is not signed in then redirect back home
        if (!$scope.user) $location.path('/');

        // Check if there are additional accounts
        $scope.hasConnectedAdditionalSocialAccounts = function(provider) {
            for (var i in $scope.user.additionalProvidersData) {
                return true;
            }

            return false;
        };

        // Check if provider is already in use with current user
        $scope.isConnectedSocialAccount = function(provider) {
            return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
        };

        // Remove a user social account
        $scope.removeUserSocialAccount = function(provider) {
            $scope.success = $scope.error = null;

            $http.delete('/users/accounts', {
                params: {
                    provider: provider
                }
            }).success(function(response) {
                // If successful show success message and clear form
                $scope.success = true;
                $scope.user = Authentication.user = response;
            }).error(function(response) {
                $scope.error = response.message;
            });
        };

        // Update a user profile
        $scope.updateUserProfile = function(isValid) {
            if (isValid) {
                $scope.success = $scope.error = null;
                var user = new Users($scope.user);

                user.$update(function(response) {
                    $scope.success = true;
                    Authentication.user = response;
                }, function(response) {
                    $scope.error = response.data.message;
                });
            } else {
                $scope.submitted = true;
            }
        };

        // Change user password
        $scope.changeUserPassword = function() {
            $scope.success = $scope.error = null;

            $http.post('/users/password', $scope.passwordDetails).success(function(response) {
                // If successful show success message and clear form
                $scope.success = true;
                $scope.passwordDetails = null;
            }).error(function(response) {
                $scope.error = response.message;
            });
        };
    }
]);
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [
    function() {
        var _this = this;

        _this._data = {
            user: window.user
        };

        return _this._data;
    }
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
    function($resource) {
        return $resource('users', {}, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
