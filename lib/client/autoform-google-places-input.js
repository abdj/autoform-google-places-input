/**
 * Autoform google place input
 * Deliver a simple autocomplete input field
 * @version 0.1
 * 
 **/

// https://developers.google.com/maps/documentation/geocoding/?csw=1#Types
var defaultOptions = {
  mappingDict: []
};

defaultOptions.mappingDict['street_number'] = '';
defaultOptions.mappingDict['street_address'] = '';
defaultOptions.mappingDict['route'] = '';
defaultOptions.mappingDict['intersection'] = '';
defaultOptions.mappingDict['political'] = '';
defaultOptions.mappingDict['country'] = {'short_name': 'country', 'long_name': 'countryName'};
defaultOptions.mappingDict['administrative_area_level_1'] = '';
defaultOptions.mappingDict['administrative_area_level_2'] = '';
defaultOptions.mappingDict['administrative_area_level_3'] = '';
defaultOptions.mappingDict['administrative_area_level_4'] = '';
defaultOptions.mappingDict['administrative_area_level_5'] = '';
defaultOptions.mappingDict['colloquial_area'] = '';
defaultOptions.mappingDict['locality'] = 'city';
defaultOptions.mappingDict['ward'] = '';
defaultOptions.mappingDict['sublocality'] = '';
defaultOptions.mappingDict['sublocality_level_1'] = '';
defaultOptions.mappingDict['sublocality_level_2'] = '';
defaultOptions.mappingDict['sublocality_level_3'] = '';
defaultOptions.mappingDict['sublocality_level_4'] = '';
defaultOptions.mappingDict['sublocality_level_5'] = '';
defaultOptions.mappingDict['neighborhood'] = '';
defaultOptions.mappingDict['premise'] = '';
defaultOptions.mappingDict['subpremise'] = '';
defaultOptions.mappingDict['postal_code'] = 'postalCode';
defaultOptions.mappingDict['postal_town'] = '';
defaultOptions.mappingDict['formatted_address'] = 'formattedAddress';

var fieldOption = {};

/**
 * @desc: set the current address into the session
 */
setAddress = function (fieldName, formattedAddress, lng, lat, addressComponents) {
  var options = fieldOption[fieldName];
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
    var _name = this[0].name;
    return Session.get('abdj-google-place-input-' + _name);  
  }
});


Template.afGooglePlaceInput.onCreated(function () {
  var _name = this.data.name;
  fieldOption[_name] = _.clone(defaultOptions);
  _.extend(fieldOption[_name], this.data.atts);

  if( !_.has(fieldOption[_name], 'geopointName') ) {
    fieldOption[_name].geopointName = 'geopoint';
  }
});


Template.afGooglePlaceInput.onRendered(function () {
  var instance = this;
  var _name = this.data.name;
  var options = fieldOption[_name];

  Tracker.autorun(function () {
    if (GoogleMaps.loaded()) {

      var _element = $('input[name="' + _name + '"]');
      if( _element.val() == '' ) {
        if( _.has(options, 'onEmptyStateFntName') && _.isString(options.onEmptyStateFntName) && _.has(window, options.onEmptyStateFntName)) {
          var res = window[options.onEmptyStateFntName].apply();
          setAddress(_name, res.formattedAddress, res.longitude, res.latitude, res.addressComponents);
        }
      }

      // create component with options if they exist
      if (_.has(instance.data, 'geocompleteOptions')) {
        _inputGeocomplete = _element.geocomplete(instance.data.geocompleteOptions);
      }
      else {
        _inputGeocomplete = _element.geocomplete();
      }
      

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
});


/**
 * @desc: on edit case, if the field is empty.
 */
Template.afGooglePlaceInput.events({
  'focusout .af-google-place-input': function () {
    if( $('input[name="' + this.name + '"]').val() == '' ) {
      Session.set('abdj-google-place-input-' + this.name, {});
    }
  }
})


Template.afGooglePlaceInput.helpers({
  value: function () {
    var options = fieldOption[this.name];
    return ( Session.get('abdj-google-place-input-' + this.name) ? Session.get('abdj-google-place-input-' + this.name)[options.mappingDict['formatted_address']] : '' );
  }
});

