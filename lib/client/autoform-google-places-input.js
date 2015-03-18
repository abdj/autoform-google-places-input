/**
 * Autoform google place input
 * Deliver a simple autocomplete input field
 * @version 0.1
 * 
 **/

var VAL = new ReactiveVar([]);

// https://developers.google.com/maps/documentation/geocoding/?csw=1#Types
var options = {
  mappingDict: []
};

options.mappingDict['street_number'] = '';
options.mappingDict['street_address'] = '';
options.mappingDict['route'] = '';
options.mappingDict['intersection'] = '';
options.mappingDict['political'] = '';
options.mappingDict['country'] = 'country';
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



AutoForm.addInputType("google-place-input", {
  template: 'afGooglePlaceInput',
  valueIn: function (val) { 
    VAL = _.clone(val) ;
    return val;
  },
  valueOut: function () { 
    return VAL;  
  }
});


Template.afGooglePlaceInput.rendered = function () {

  _.extend(options, this.data.atts);

  Tracker.autorun(function () {

    if (GoogleMaps.loaded()) {

      $('.af-google-place-input').geocomplete().bind("geocode:result", function(event, result) {

        VAL[options.mappingDict['formatted_address']] = result.formatted_address ? result.formatted_address : "";
        VAL.geopoint = [result.geometry.location.lng(), result.geometry.location.lat()];

        _.each(result.address_components, function(component) {
          var name = component.types[0];
          
          _.each(component.types, function(name){
            
            var schemaName = options.mappingDict[name];
            if( schemaName !== undefined && schemaName !== '') {
              VAL[schemaName] = component.short_name;
            }

          });

        });
        
      });
    }

  });

}


Template.afGooglePlaceInput.helpers({
  value: function () { return VAL[options.mappingDict['formatted_address']]; }
});

