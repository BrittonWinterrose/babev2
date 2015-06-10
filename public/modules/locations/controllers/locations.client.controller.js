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
