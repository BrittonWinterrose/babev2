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
                      options: [{name: '1', value: '.1.', group: 'Normal'},{name: '2', value: '.2.', group: 'Normal'},{name: '4', value: '.4.', group: 'Normal'},{name: '6', value: '.6.', group: 'Normal'},{name: '8', value: '.8.', group: 'Normal'},{name: '10', value: '.10.', group: 'Normal'},{name: '12', value: '.12.', group: 'Normal'},{name: '24', value: '.24.', group: 'Normal'},{name: '27', value: '.27.', group: 'Normal'},{name: '60', value: '.60.', group: 'Normal'},{name: '600', value: '.600.', group: 'Normal'},{name: '613', value: '.613.', group: 'Normal'},{name: '1001', value: '.1001.', group: 'Normal'},{name: '12/600', value: '.12/600.', group: 'Normal'},{name: '1B', value: '.1B.', group: 'Normal'},{name: '27/613', value: '.27/613.', group: 'Normal'},{name: '27A', value: '.27A.', group: 'Normal'},{name: '30/33', value: '.30/33.', group: 'Normal'},{name: '3R', value: '.3R.', group: 'Normal'},{name: '5B', value: '.5B.', group: 'Normal'},{name: '5R', value: '.5R.', group: 'Normal'},{name: '6/10', value: '.6/10.', group: 'Normal'},{name: 'BLUE', value: '.BLUE.', group: 'Funky'},{name: 'BURG', value: '.BURG.', group: 'Funky'},{name: 'DKFXA', value: '.DKFXA.', group: 'Funky'},{name: 'DKPURP', value: '.DKPURP.', group: 'Funky'},{name: 'FUNKY', value: '.FUNKY.', group: 'Funky'},{name: 'O-12_600', value: '.O-12_600.', group: 'Ombre'},{name: 'O-1B_6', value: '.O-1B_6.', group: 'Ombre'},{name: 'O-4_613', value: '.O-4_613.', group: 'Ombre'},{name: 'PINK', value: '.PINK.', group: 'Funky'},{name: 'PURP', value: '.PURP.', group: 'Funky'},{name: 'RED', value: '.RED.', group: 'Funky'},{name: 'TEAL', value: '.TEAL.', group: 'Funky'}]}
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
