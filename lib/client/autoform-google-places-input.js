/**
 * Autoform google place input
 * Deliver a simple autocomplete input field
 * @version 0.1
 * 
 **/

// https://developers.google.com/maps/documentation/geocoding/?csw=1#Types
var options = {
  mappingDict: []
};

options.mappingDict['street_number'] = '';
options.mappingDict['street_address'] = '';
options.mappingDict['route'] = '';
options.mappingDict['intersection'] = '';
options.mappingDict['political'] = '';
options.mappingDict['country'] = {'short_name': 'country', 'long_name': 'countryName'};
options.mappingDict['administrative_area_level_1'] = '';
options.mappingDict['administrative_area_level_2'] = '';
options.mappingDict['administrative_area_level_3'] = '';
options.mappingDict['administrative_area_level_4'] = '';
options.mappingDict['administrative_area_level_5'] = '';
options.mappingDict['colloquial_area'] = '';
options.mappingDict['locality'] = 'city';
options.mappingDict['ward'] = '';
options.mappingDict['sublocality'] = '';
options.mappingDict['sublocality_level_1'] = '';
options.mappingDict['sublocality_level_2'] = '';
options.mappingDict['sublocality_level_3'] = '';
options.mappingDict['sublocality_level_4'] = '';
options.mappingDict['sublocality_level_5'] = '';
options.mappingDict['neighborhood'] = '';
options.mappingDict['premise'] = '';
options.mappingDict['subpremise'] = '';
options.mappingDict['postal_code'] = 'postalCode';
options.mappingDict['postal_town'] = '';
options.mappingDict['formatted_address'] = 'formattedAddress';


/**
 * Autoform google places input type
 */
AutoForm.addInputType("google-places-input", {
  template: 'afGooglePlaceInput',
  valueIn: function (val) { 
    Session.set('abdj-google-place-input', val);
    return val;
  },
  valueOut: function () { 
    return Session.get('abdj-google-place-input');  
  }
});


/**
 * @desc: set the current address into the session
 */
setAddress = function (formattedAddress, lng, lat, addressComponents) {
  
  var _address = {};
  _address[options.mappingDict['formatted_address']] = formattedAddress ? formattedAddress : "";
  _address[options.geopointName] =  (lng && lat) ? [lng, lat] : "";

  if( addressComponents ) {
    _.each(addressComponents, function(component) {
      var name = component.types[0];

      _.each(component.types, function(name) {
        var _o = options.mappingDict[name];

        if( _.isString(_o) ) {
          _address[_o] = component.short_name;
        }
        else if( _.isObject(_o) ) {

          if( _.has(_o, 'short_name') && _o.short_name !== '' ) {
            _address[_o.short_name] = component.short_name;
          }
          
          if( _.has(_o, 'long_name') && _o.long_name !== '' ) {
            _address[_o.long_name] = component.long_name;
          }
        }
      });
    }); 
  }
  //console.log(' -- _address -- ');
  //console.log( _address );
  Session.set('abdj-google-place-input', _address);
}


Template.afGooglePlaceInput.rendered = function () {

  _.extend(options, this.data.atts);
  
  if( !_.has(options, 'geopointName') ) {
    options.geopointName = 'geopoint';
  }
  
  Tracker.autorun(function () {
    if (GoogleMaps.loaded()) {

      _inputGeocomplete = $('.af-google-place-input').geocomplete();

      _inputGeocomplete.bind("geocode:result", function(event, result) {
        setAddress(result.formatted_address, result.geometry.location.lng(), result.geometry.location.lat(), result.address_components);
      });

      _inputGeocomplete.bind("geocode:error", function (event, result){
        if( $('.af-google-place-input').val() == '' ) {
          Session.set('abdj-google-place-input', {});
        }
      });
    }
  });
};


/**
 * @desc: on edit case, if the field is empty.
 */
Template.afGooglePlaceInput.events({
  'focusout .af-google-place-input': function () {
    console.log('onfocus out');
    if( $('.af-google-place-input').val() == '' ) {
      Session.set('abdj-google-place-input', {});
    }
  }
})


Template.afGooglePlaceInput.helpers({
  value: function () { return ( Session.get('abdj-google-place-input') ? Session.get('abdj-google-place-input')[options.mappingDict['formatted_address']] : '' ); }
});

