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

  // Value from database, on edit form
  valueIn: function (val, atts) { 
    Session.set('abdj-google-place-input-' + atts.name, val);
    return val;
  },
  
  // Value to database
  valueOut: function () {
    var _name = this.context.dataset.schemaKey;
    return Session.get('abdj-google-place-input-' + _name);  
  }
});


/**
 * @desc: set the current address into the session
 */
setAddress = function (fieldName, formattedAddress, lng, lat, addressComponents) {
  
  var _address = {};
  _address[options.mappingDict['formatted_address']] = formattedAddress ? formattedAddress : "";
  _address[options.geopointName] =  (lng && lat) ? [lng, lat] : "";

  if( addressComponents ) {
    _.each(addressComponents, function(component) {
      _.each(component.types, function(name) {
        var _o = options.mappingDict[name];

        if( !_.isEmpty(_o) && _.isString(_o) ) {
          _address[_o] = component.short_name;
        }
        else if(_.isObject(_o) ) {

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
  Session.set('abdj-google-place-input-' + fieldName, _address);
}


Template.afGooglePlaceInput.rendered = function () {

  var _name = this.data.name;
  _.extend(options, this.data.atts);
  
  if( !_.has(options, 'geopointName') ) {
    options.geopointName = 'geopoint';
  }
  
  Tracker.autorun(function () {
    if (GoogleMaps.loaded()) {
      var _element = $('input[name="' + _name + '"]');
      _inputGeocomplete = _element.geocomplete();

      _inputGeocomplete.bind("geocode:result", function(event, result) {
        setAddress(_name, result.formatted_address, result.geometry.location.lng(), result.geometry.location.lat(), result.address_components);
      });

      _inputGeocomplete.bind("geocode:error", function (event, result){
        if( _element.val() == '' ) {
          Session.set('abdj-google-place-input-' + _name, {});
        }
      });
    }
  });

  // Patch for iOS mobile integration
  $(document).on({
    'DOMNodeInserted': function() {
        $('.pac-item, .pac-item span', this).addClass('needsclick');
    }
  }, '.pac-container');
};


/**
 * @desc: on edit case, if the field is empty.
 */
Template.afGooglePlaceInput.events({
  'focusout .af-google-place-input': function () {
    if( $('.input[name="' + this.name + '"').val() == '' ) {
      Session.set('abdj-google-place-input-' + this.name, {});
    }
  }
})


Template.afGooglePlaceInput.helpers({
  value: function () {
    return ( Session.get('abdj-google-place-input-' + this.name) ? Session.get('abdj-google-place-input-' + this.name)[options.mappingDict['formatted_address']] : '' );
  }
});

