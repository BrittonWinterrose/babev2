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
                    key: 'po',
                    type: 'input',
                    templateOptions: {
                        label: 'Purchase Order #:',
                        disabled: disabled
                        }
                    },
                    {
                    key: 'upc',
                    type: 'input',
                    templateOptions: {
                        label: 'UPC:',
                        disabled: disabled
                        }
                    },
                    {
                    key: 'item',
                    type: 'select',
                    templateOptions: {
                      label: 'SKU (scan UPC):',
                      options: [{name:  '799861393207', value: '18SI-1'},
                                {name:  '799861393214', value: '18SI-1B'},
                                {name:  '799861393221', value: '18SI-2'},
                                {name:  '799861393238', value: '18SI-3R'},
                                {name:  '799861393245', value: '18SI-4'},
                                {name:  '799861393252', value: '18SI-5B'},
                                {name:  '799861393269', value: '18SI-5R'},
                                {name:  '799861393276', value: '18SI-6'},
                                {name:  '799861393283', value: '18SI-6/10'},
                                {name:  '799861393290', value: '18SI-8'},
                                {name:  '799861393306', value: '18SI-10'},
                                {name:  '799861393313', value: '18SI-12'},
                                {name:  '799861393320', value: '18SI-12/600'},
                                {name:  '799861393337', value: '18SI-24'},
                                {name:  '799861393344', value: '18SI-27'},
                                {name:  '799861393351', value: '18SI-27A'},
                                {name:  '799861393368', value: '18SI-27/613'},
                                {name:  '799861393375', value: '18SI-30/33'},
                                {name:  '799861393382', value: '18SI-60'},
                                {name:  '799861393399', value: '18SI-600'},
                                {name:  '799861393405', value: '18SI-613'},
                                {name:  '799861393412', value: '18SI-1001'},
                                {name:  '799861393429', value: '18SI-BLUE'},
                                {name:  '799861393436', value: '18SI-BURG'},
                                {name:  '799861393443', value: '18SI-DKPURP'},
                                {name:  '799861393450', value: '18SI-DKFXA'},
                                {name:  '799861393467', value: '18SI-PINK'},
                                {name:  '799861393474', value: '18SI-PURP'},
                                {name:  '799861393481', value: '18SI-RED'},
                                {name:  '799861393498', value: '18SI-TEAL'},
                                {name:  '799861393504', value: '18SI-FUNKY'},
                                {name:  '711978582602', value: '18SI-O-1B_6'},
                                {name:  '711978582619', value: '18SI-O-4_613'},
                                {name:  '711978582626', value: '18SI-O-12_600'},
                                {name:  '799861393511', value: '1018SI-60'},
                                {name:  '799861393528', value: '1018SI-BLUE'},
                                {name:  '799861393535', value: '1018SI-BURGUNDY'},
                                {name:  '799861393542', value: '1018SI-DARK FUXIA'},
                                {name:  '799861393559', value: '1018SI-DARK PURPLE'},
                                {name:  '799861393566', value: '1018SI-PINK'},
                                {name:  '799861393573', value: '1018SI-PURPLE'},
                                {name:  '799861393580', value: '1018SI-RED'},
                                {name:  '799861393597', value: '1018SI-TEAL'},
                                {name:  '799861393603', value: '22SI-1'},
                                {name:  '799861393610', value: '22SI-1B'},
                                {name:  '799861393627', value: '22SI-2'},
                                {name:  '799861393634', value: '22SI-4'},
                                {name:  '799861393641', value: '22SI-6'},
                                {name:  '799861393658', value: '22SI-6/10'},
                                {name:  '799861393665', value: '22SI-8'},
                                {name:  '799861393672', value: '22SI-10'},
                                {name:  '799861393689', value: '22SI-12'},
                                {name:  '799861393696', value: '22SI-12/600'},
                                {name:  '799861393702', value: '22SI-24'},
                                {name:  '799861393719', value: '22SI-27'},
                                {name:  '799861393726', value: '22SI-27A'},
                                {name:  '799861393733', value: '22SI-27/613'},
                                {name:  '799861393740', value: '22SI-30/33'},
                                {name:  '799861393757', value: '22SI-613'},
                                {name:  '799861393764', value: '22SI-1001'},
                                {name:  '799861393771', value: 'IBODY22-1'},
                                {name:  '799861393788', value: 'IBODY22-1B'},
                                {name:  '799861393795', value: 'IBODY22-2'},
                                {name:  '799861393801', value: 'IBODY22-4'},
                                {name:  '799861393818', value: 'IBODY22-6'},
                                {name:  '799861393825', value: 'IBODY22-6/10'},
                                {name:  '799861393832', value: 'IBODY22-8'},
                                {name:  '799861393849', value: 'IBODY22-10'},
                                {name:  '799861393856', value: 'IBODY22-12'},
                                {name:  '799861393863', value: 'IBODY22-12/600'},
                                {name:  '799861393870', value: 'IBODY22-24'},
                                {name:  '799861393887', value: 'IBODY22-27'},
                                {name:  '799861393894', value: 'IBODY22-27A'},
                                {name:  '799861393900', value: 'IBODY22-27/613'},
                                {name:  '799861393917', value: 'IBODY22-30/33'},
                                {name:  '799861393924', value: 'IBODY22-613'},
                                {name:  '799861393931', value: 'IBODY22-1001'},
                                {name:  '799861393948', value: '18SI FUNKY COLOR KIT'},
                                {name:  '799861392255', value: 'S-TAPE14-1'},
                                {name:  '799861392262', value: 'S-TAPE14-1B'},
                                {name:  '799861392279', value: 'S-TAPE14-2'},
                                {name:  '799861392286', value: 'S-TAPE14-3R'},
                                {name:  '799861392293', value: 'S-TAPE14-4'},
                                {name:  '799861392309', value: 'S-TAPE14-5B'},
                                {name:  '799861392316', value: 'S-TAPE14-5R'},
                                {name:  '799861392323', value: 'S-TAPE14-6'},
                                {name:  '799861392330', value: 'S-TAPE14-6/10'},
                                {name:  '799861392347', value: 'S-TAPE14-8'},
                                {name:  '799861392354', value: 'S-TAPE14-10'},
                                {name:  '799861392361', value: 'S-TAPE14-12'},
                                {name:  '799861392378', value: 'S-TAPE14-12/600'},
                                {name:  '799861392385', value: 'S-TAPE14-24'},
                                {name:  '799861392392', value: 'S-TAPE14-27'},
                                {name:  '799861392408', value: 'S-TAPE14-27A'},
                                {name:  '799861392415', value: 'S-TAPE14-27/613'},
                                {name:  '799861392422', value: 'S-TAPE14-30/33'},
                                {name:  '799861392439', value: 'S-TAPE14-60'},
                                {name:  '799861392446', value: 'S-TAPE14-600'},
                                {name:  '799861392453', value: 'S-TAPE14-613'},
                                {name:  '799861392460', value: 'S-TAPE14-1001'},
                                {name:  '799861392477', value: 'S-TAPE18-1'},
                                {name:  '799861392484', value: 'S-TAPE18-1B'},
                                {name:  '799861392491', value: 'S-TAPE18-2'},
                                {name:  '799861392507', value: 'S-TAPE18-3R'},
                                {name:  '799861392514', value: 'S-TAPE18-4'},
                                {name:  '799861392521', value: 'S-TAPE18-5B'},
                                {name:  '799861392538', value: 'S-TAPE18-5R'},
                                {name:  '799861392545', value: 'S-TAPE18-6'},
                                {name:  '799861392552', value: 'S-TAPE18-6/10'},
                                {name:  '799861392569', value: 'S-TAPE18-8'},
                                {name:  '799861392576', value: 'S-TAPE18-10'},
                                {name:  '799861392583', value: 'S-TAPE18-12'},
                                {name:  '799861392590', value: 'S-TAPE18-12/600'},
                                {name:  '799861392606', value: 'S-TAPE18-24'},
                                {name:  '799861392613', value: 'S-TAPE18-27'},
                                {name:  '799861392620', value: 'S-TAPE18-27A'},
                                {name:  '799861392637', value: 'S-TAPE18-27/613'},
                                {name:  '799861392644', value: 'S-TAPE18-30/33'},
                                {name:  '799861392651', value: 'S-TAPE18-60'},
                                {name:  '799861392668', value: 'S-TAPE18-600'},
                                {name:  '799861392675', value: 'S-TAPE18-613'},
                                {name:  '799861392682', value: 'S-TAPE18-1001'},
                                {name:  '799861392699', value: 'S-TAPE18-BLUE'},
                                {name:  '799861392705', value: 'S-TAPE18-BURG'},
                                {name:  '799861392712', value: 'S-TAPE18-DKPURP'},
                                {name:  '799861392729', value: 'S-TAPE18-DKFXA'},
                                {name:  '799861392736', value: 'S-TAPE18-PINK'},
                                {name:  '799861392743', value: 'S-TAPE18-PURP'},
                                {name:  '799861392750', value: 'S-TAPE18-RED'},
                                {name:  '799861392767', value: 'S-TAPE18-TEAL'},
                                {name:  '799861392774', value: 'S-TAPE18-FUNKY'},
                                {name:  '711978582664', value: 'S-TAPE18-O-1B_6'},
                                {name:  '711978582671', value: 'S-TAPE18-O-4_613'},
                                {name:  '711978582688', value: 'S-TAPE18-O-12_600'},
                                {name:  '799861392781', value: 'S-TAPE22-1'},
                                {name:  '799861392798', value: 'S-TAPE22-1B'},
                                {name:  '799861392804', value: 'S-TAPE22-2'},
                                {name:  '799861392811', value: 'S-TAPE22-3R'},
                                {name:  '799861392828', value: 'S-TAPE22-4'},
                                {name:  '799861392835', value: 'S-TAPE22-5B'},
                                {name:  '799861392842', value: 'S-TAPE22-5R'},
                                {name:  '799861392859', value: 'S-TAPE22-6'},
                                {name:  '799861392866', value: 'S-TAPE22-6/10'},
                                {name:  '799861392873', value: 'S-TAPE22-8'},
                                {name:  '799861392880', value: 'S-TAPE22-10'},
                                {name:  '799861392897', value: 'S-TAPE22-12'},
                                {name:  '799861392903', value: 'S-TAPE22-12/600'},
                                {name:  '799861392910', value: 'S-TAPE22-24'},
                                {name:  '799861392927', value: 'S-TAPE22-27'},
                                {name:  '799861392934', value: 'S-TAPE22-27A'},
                                {name:  '799861392941', value: 'S-TAPE22-27/613'},
                                {name:  '799861392958', value: 'S-TAPE22-30/33'},
                                {name:  '799861392965', value: 'S-TAPE22-60'},
                                {name:  '799861392972', value: 'S-TAPE22-600'},
                                {name:  '799861392989', value: 'S-TAPE22-613'},
                                {name:  '799861392996', value: 'S-TAPE22-1001'},
                                {name:  '799861393009', value: 'TAPE-PRACTICE'},
                                {name:  '799861393016', value: 'TAPE FUNKY COLOR KIT'},
                                {name:  '799861393955', value: 'KLS18-1'},
                                {name:  '799861393962', value: 'KLS18-1B'},
                                {name:  '799861393979', value: 'KLS18-2'},
                                {name:  '799861393986', value: 'KLS18-3R'},
                                {name:  '799861393993', value: 'KLS18-4'},
                                {name:  '799861394006', value: 'KLS18-5B'},
                                {name:  '799861394013', value: 'KLS18-5R'},
                                {name:  '799861394020', value: 'KLS18-6'},
                                {name:  '799861394037', value: 'KLS18-6/10'},
                                {name:  '799861394044', value: 'KLS18-8'},
                                {name:  '799861394051', value: 'KLS18-10'},
                                {name:  '799861394068', value: 'KLS18-12'},
                                {name:  '799861394075', value: 'KLS18-12/600'},
                                {name:  '799861394082', value: 'KLS18-24'},
                                {name:  '799861394099', value: 'KLS18-27'},
                                {name:  '799861394105', value: 'KLS18-27A'},
                                {name:  '799861394112', value: 'KLS18-27/613'},
                                {name:  '799861394129', value: 'KLS18-30/33'},
                                {name:  '799861394136', value: 'KLS18-60'},
                                {name:  '799861394143', value: 'KLS18-600'},
                                {name:  '799861394150', value: 'KLS18-613'},
                                {name:  '799861394167', value: 'KLS18-1001'},
                                {name:  '799861394174', value: 'KLS18-BLUE'},
                                {name:  '799861394181', value: 'KLS18-BURG'},
                                {name:  '799861394198', value: 'KLS18-DKFXA'},
                                {name:  '799861394204', value: 'KLS18-DKPURP'},
                                {name:  '799861394211', value: 'KLS18-PINK'},
                                {name:  '799861394228', value: 'KLS18-PURP'},
                                {name:  '799861394235', value: 'KLS18-RED'},
                                {name:  '799861394242', value: 'KLS-PRACTICE'},
                                {name:  '711978582633', value: 'KLS18-O-1B_6'},
                                {name:  '711978582640', value: 'KLS18-O-4_613'},
                                {name:  '711978582657', value: 'KLS18-O-12_600'},
                                {name:  '0711978582398', value: 'FTIP22-1'},
                                {name:  '0711978582404', value: 'FTIP22-1B'},
                                {name:  '0711978582411', value: 'FTIP22-2'},
                                {name:  '0711978582428', value: 'FTIP22-3R'},
                                {name:  '0711978582435', value: 'FTIP22-4'},
                                {name:  '0711978582442', value: 'FTIP22-6'},
                                {name:  '0711978582459', value: 'FTIP22-6/10'},
                                {name:  '0711978582466', value: 'FTIP22-8'},
                                {name:  '0711978582473', value: 'FTIP22-12'},
                                {name:  '0711978582343', value: 'FTIP22-12/600'},
                                {name:  '0711978582480', value: 'FTIP22-24'},
                                {name:  '0711978582497', value: 'FTIP22-27'},
                                {name:  '0711978582503', value: 'FTIP22-27/613'},
                                {name:  '0711978582510', value: 'FTIP22-60'},
                                {name:  '0711978582336', value: 'FTIP22-613'},
                                {name:  '0711978582350', value: 'FTIP22-1001'},
                                {name:  '799861394259', value: 'VA16-HUMAN-1'},
                                {name:  '799861394266', value: 'VA16-HUMAN-1B'},
                                {name:  '799861394273', value: 'VA16-HUMAN-2'},
                                {name:  '799861394280', value: 'VA16-HUMAN-4'},
                                {name:  '799861394297', value: 'VA16-HUMAN-4/33'},
                                {name:  '799861394303', value: 'VA16-HUMAN-6'},
                                {name:  '799861394310', value: 'VA16-HUMAN-6/10'},
                                {name:  '799861394327', value: 'VA16-HUMAN-6/24'},
                                {name:  '799861394334', value: 'VA16-HUMAN-8'},
                                {name:  '799861394341', value: 'VA16-HUMAN-10'},
                                {name:  '799861394358', value: 'VA16-HUMAN-10/12'},
                                {name:  '799861394365', value: 'VA16-HUMAN-24'},
                                {name:  '799861394372', value: 'VA16-HUMAN-27'},
                                {name:  '799861394389', value: 'VA16-HUMAN-27/613'},
                                {name:  '799861394396', value: 'VA16-HUMAN-30/33'},
                                {name:  '799861394402', value: 'VA16-HUMAN-600'},
                                {name:  '799861394419', value: 'VA16-HUMAN-613'},
                                {name:  '799861394426', value: 'HILO-HUMAN-1B'},
                                {name:  '799861394433', value: 'HILO-HUMAN-4'},
                                {name:  '799861394440', value: 'HILO-HUMAN-10'},
                                {name:  '799861394457', value: 'HILO-HUMAN-60'},
                                {name:  '799861394464', value: 'HILO-HUMAN-22'},
                                {name:  '799861394471', value: 'HILO-HUMAN-27'},
                                {name:  '799861394488', value: 'HILO-HUMAN-27/613'},
                                {name:  '799861394495', value: 'HILO-HUMAN-613'},
                                {name:  '799861394501', value: 'HILO-HUMAN-RED'},
                                {name:  '799861394518', value: 'HILO-HUMAN-BLUE'},
                                {name:  '799861394525', value: 'HILO-HUMAN-PINK'},
                                {name:  '799861394532', value: 'HILO-HUMAN-DKFXA'},
                                {name:  '799861394549', value: 'HILO-HUMAN-GREEN'},
                                {name:  '799861394556', value: 'HILO-HUMAN-PURP'},
                                {name:  '799861394563', value: 'HILO-HUMAN-BURG'},
                                {name:  '799861393023', value: 'COLOR SWATCH'},
                                {name:  '799861393030', value: 'QUICK PICK'},
                                {name:  '799861393047', value: 'BABE BRUSH'},
                                {name:  '799861393054', value: 'CLIP-BLACK'},
                                {name:  '799861393061', value: 'CLIP-PINK'},
                                {name:  '799861393078', value: 'KERATIN-BOND-REMOVER'},
                                {name:  '799861393085', value: 'TAPE-BOND-REMOVER'},
                                {name:  '799861393092', value: 'MELTING CONNECTOR'},
                                {name:  '799861393108', value: 'PRO DISC'},
                                {name:  '799861393115', value: 'REBONDS-BLACK'},
                                {name:  '799861393122', value: 'REBONDS-BROWN'},
                                {name:  '799861393139', value: 'REBONDS-CLEAR'},
                                {name:  '799861393146', value: 'BEAD-TOOL-ORIGINAL'},
                                {name:  '799861393153', value: 'BEAD-TOOL-CLASSIC'},
                                {name:  '799861393160', value: 'BEAD-TOOL-DELUXE'},
                                {name:  '799861393177', value: 'LOOP TOOL'},
                                {name:  '799861393184', value: 'TAPE-REPLACEMENT'},
                                {name:  '799861393191', value: 'TAPE-SINGLE'},
                                {name:  '799861395829', value: 'EDUCATION-MANUAL'},
                                {name:  '799861394570', value: 'ML-LICORICE'},
                                {name:  '799861394587', value: 'ML-VANILLA'},
                                {name:  '799861394594', value: 'ML-DKCHOC'},
                                {name:  '799861394600', value: 'ML-CARAMEL'},
                                {name:  '799861394617', value: 'ML-MLKCHOC'},
                                {name:  '799861394624', value: 'ML-VARIETY'},
                                {name:  '799861394631', value: 'SB-LICORICE'},
                                {name:  '799861394648', value: 'SB-VANILLA'},
                                {name:  '799861394655', value: 'SB-DKCHOC'},
                                {name:  '799861394662', value: 'SB-CARAMEL'},
                                {name:  '799861394679', value: 'SB-MLKCHOC'},
                                {name:  '799861394686', value: 'FLARE-LICORICE'},
                                {name:  '799861394693', value: 'FLARE-VANILLA'},
                                {name:  '799861394709', value: 'FLARE-DKCHOC'},
                                {name:  '799861394716', value: 'FLARE-CARAMEL'},
                                {name:  '799861394723', value: 'FLARE-MLKCHOC'},
                                {name:  '799861394730', value: 'PRO LASH KIT'},
                                {name:  '799861394747', value: 'STUDENT LASH KIT'},
                                {name:  '799861394754', value: 'BCCURL8.15'},
                                {name:  '799861394761', value: 'BCCURL8.20'},
                                {name:  '799861394778', value: 'BCCURL8.25'},
                                {name:  '799861394785', value: 'BCCURL9.15'},
                                {name:  '799861394792', value: 'BCCURL9.20'},
                                {name:  '799861394808', value: 'BCCURL9.25'},
                                {name:  '799861394815', value: 'BCCURL10.15'},
                                {name:  '799861394822', value: 'BCCURL10.20'},
                                {name:  '799861394839', value: 'BCCURL10.25'},
                                {name:  '799861394846', value: 'BCCURL11.15'},
                                {name:  '799861394853', value: 'BCCURL11.20'},
                                {name:  '799861394860', value: 'BCCURL11.25'},
                                {name:  '799861394877', value: 'BCCURL12.15'},
                                {name:  '799861394884', value: 'BCCURL12.20'},
                                {name:  '799861394891', value: 'BCCURL12.25'},
                                {name:  '799861394907', value: 'BCCURL13.15'},
                                {name:  '799861394914', value: 'BCCURL13.20'},
                                {name:  '799861394921', value: 'BCCURL13.25'},
                                {name:  '799861394938', value: 'BJCURL8.15'},
                                {name:  '799861394945', value: 'BJCURL8.20'},
                                {name:  '799861394952', value: 'BJCURL8.25'},
                                {name:  '799861394969', value: 'BJCURL9.15'},
                                {name:  '799861394976', value: 'BJCURL9.20'},
                                {name:  '799861394983', value: 'BJCURL9.25'},
                                {name:  '799861394990', value: 'BJCURL10.15'},
                                {name:  '799861395003', value: 'BJCURL10.20'},
                                {name:  '799861395010', value: 'BJCURL10.25'},
                                {name:  '799861395027', value: 'BJCURL11.15'},
                                {name:  '799861395034', value: 'BJCURL11.20'},
                                {name:  '799861395041', value: 'BJCURL11.25'},
                                {name:  '799861395058', value: 'BJCURL12.15'},
                                {name:  '799861395065', value: 'BJCURL12.20'},
                                {name:  '799861395072', value: 'BJCURL12.25'},
                                {name:  '799861395089', value: 'BJCURL13.15'},
                                {name:  '799861395096', value: 'BJCURL13.20'},
                                {name:  '799861395102', value: 'BJCURL13.25'},
                                {name:  '799861395119', value: 'MJCURL12.15'},
                                {name:  '799861395126', value: 'MCCURL8.15'},
                                {name:  '799861395133', value: 'MCCURL8.20'},
                                {name:  '799861395140', value: 'MCCURL10.15'},
                                {name:  '799861395157', value: 'MCCURL10.20'},
                                {name:  '799861395164', value: 'MCCURL12.15'},
                                {name:  '799861395171', value: 'MCCURL12.20'},
                                {name:  '799861395188', value: 'MCCURL14.15'},
                                {name:  '799861395195', value: 'MCCURL14.20'},
                                {name:  '799861395201', value: 'ADHESIVE-REGULAR (Black)'},
                                {name:  '799861395218', value: 'ADHESIVE-STRONG (Blue)'},
                                {name:  '799861395225', value: 'ADHESIVE-SENSITIVE (White)'},
                                {name:  '799861395232', value: 'MASCARRA-BLACK'},
                                {name:  '799861395249', value: 'SEALER-CLEAR'},
                                {name:  '799861395256', value: 'LASHREMOVER'},
                                {name:  '799861395263', value: 'COSMETICTAPE'},
                                {name:  '799861395270', value: 'GELPADS'},
                                {name:  '799861395287', value: 'PROTEINREMOVER'},
                                {name:  '799861395294', value: 'MICROSWAB-100'},
                                {name:  '799861395300', value: 'JADESTONE'},
                                {name:  '799861395317', value: 'SILICONEPAD'},
                                {name:  '799861395324', value: 'TWEEZER-HOOK'},
                                {name:  '799861395331', value: 'TWEEZER-STRAIGHT'},
                                {name:  '799861395348', value: 'SCISSORS'},
                                {name:  '799861395355', value: 'PRACTICESTRIPS'},
                                {name:  '799861395362', value: 'LG-2ML'},
                                {name:  '799861395379', value: 'LG-4ML'},
                                {name:  '799861395386', value: 'LG-MASCARA'},
                                {name:  '799861395393', value: 'LG-FIBER'},
                                {name:  '799861395409', value: 'HC4.25-BLUE'},
                                {name:  '799861395416', value: 'HC4.25-FUCHSIA'},
                                {name:  '799861395423', value: 'HC4.25-GREEN'},
                                {name:  '799861395430', value: 'HC4.25-LIME'},
                                {name:  '799861395447', value: 'HC4.25-PURPLE'},
                                {name:  '799861395454', value: 'HC4.25-RED'},
                                {name:  '799861395461', value: 'HC4.25-YELLOW'},
                                {name:  '799861395478', value: 'HC4.25-ORANGE'},
                                {name:  '799861395485', value: 'HC4.25-24DISPLAY'},
                                {name:  '799861395492', value: 'Ice-Rainbow'},
                                {name:  '799861395508', value: 'Ice-Clear'},
                                {name:  '799861395515', value: 'Ice-Blue'},
                                {name:  '799861395522', value: 'Ice-Pink'},
                                {name:  '799861395539', value: 'Shine-Purple'},
                                {name:  '799861395546', value: 'Shine-Silver'},
                                {name:  '799861395553', value: 'Shine-Rainbow'},
                                {name:  '799861395560', value: 'Shine-Champange'},
                                {name:  '799861395577', value: 'Shine-Fuschia'},
                                {name:  '799861395584', value: 'Shine-Royal Blue'},
                                {name:  '799861395591', value: 'Shine-Lime Green'},
                                {name:  '799861395607', value: 'Shine-Red'},
                                {name:  '799861395614', value: 'Shine-Lavender'},
                                {name:  '799861395621', value: 'Shine-Copper'},
                                {name:  '799861395638', value: 'Shine-Pink'},
                                {name:  '799861395645', value: 'FN-VARIETY'},
                                {name:  '799861395652', value: 'FN-WHITE'},
                                {name:  '799861395669', value: 'FS-BLUE'},
                                {name:  '799861395676', value: 'FS-BROWN'},
                                {name:  '799861395683', value: 'FS-BW'},
                                {name:  '799861395690', value: 'FS-GOLDENSTRAW'},
                                {name:  '799861395706', value: 'FS-GREEN'},
                                {name:  '799861395713', value: 'FS-MAGENTA'},
                                {name:  '799861395720', value: 'FS-ORANGE'},
                                {name:  '799861395737', value: 'FS-RED'},
                                {name:  '799861395744', value: 'FS-TURQUOISE'},
                                {name:  '799861395751', value: 'FS-YELLOW'},
                                {name:  '799861395768', value: 'FSO-BLACK'},
                                {name:  '799861395775', value: 'FSO-BLUE'},
                                {name:  '799861395782', value: 'FSO-PINK'},
                                {name:  '799861395799', value: 'FSO-PURPLE'},
                                {name:  '799861395805', value: 'FSO-RASP'},
                                {name:  '799861395812', value: 'FSO-TEAL'},
                                {name:  '799861395836', value: 'POSTER'},
                                {name:  '799861395843', value: 'MIRROR CLING'},
                                {name:  '799861395850', value: 'WINDOW CLING'},
                                {name:  '799861395867', value: 'SHELF TALKERS'},
                                {name:  '799861395874', value: 'HAIR MANUAL'},
                                {name:  '799861395881', value: 'LASH MANUAL'}]}
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
                    {
                    key: 'carton',
                    type: 'input',
                    templateOptions: {
                        label: 'Carton:',
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