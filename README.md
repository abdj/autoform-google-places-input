# Autoform Google Places Input
Enable a google autocomplete input field into your autoform form, defining a mapper between the google api response and your schema. 

## Installation
```
meteor add abdj:autoform-google-places-input
```

## Demo Application
A demo for this plugin is available here: http://google-input-address.meteor.com/

Source code of the demo is available here: https://github.com/abdj/meteor_google_input_address_demo


## Prerequisite and Configuration
Ensure you have loaded the GoogleMaps API, either globally or on the route scope. 
```
GoogleMaps.load({libraries: 'places'});
```

(i) Example: Install the package globally
```
Meteor.startup(function() {
  GoogleMaps.load({
    key: 'YOUR API KEY', // optional, could be loaded via Meteor.settings.public.GOOGLE_MAP_API
    libraries: 'places'  // can be an array
  });
});
```

(ii) Example: Optimize loading time, by loading google libraries only on needed routes
```
Router.onBeforeAction(function() {
  GoogleMaps.load({
    key: 'YOUR API KEY', // optional
    libraries: 'places'  // can be an array of libraries
  });
  this.next();
}, { only: ['aRoute', 'aSecondRoute'] });
```


## Usage Example

Into your collection declaration
```
//This is the default address schema
Schema.Address = new SimpleSchema({
  formattedAddress: {
    type: String,
    optional: true
  },
  geopoint: {
    type: [Number], //[longitude, latitude]
    decimal: true,
    optional: true
  },
  city: {
    type: String,
    optional: true
  },
  postalCode: {
    type: String,
    optional: true
  },
  country: {
    type: String,
    optional: true
  },
  countryName: {
    type: String,
    optional: true
  }
});


Schema.Test = new SimpleSchema({
  address: {
    type: Schema.Address,
    optional: true,
    autoform: {
      type: 'google-places-input'
      // geopointName: "myOwnGeopointName" //optional, you can use a custom geopoint name
    }
  },
  text: { // useless in our example
    type: String,
    optional: true
  }
});
Test.attachSchema(Schema.Test);
```

Generate your autoform form: 
```
    {{> quickForm id="formUpdate" schema="Schema.Test" collection="Test" type="insert" }}
```


## Changelogs
  * 29-12-2015:
     * Allow two address field on the same form
     * Valid iOS mobile integration

## License 
MIT
