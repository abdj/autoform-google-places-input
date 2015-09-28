# autoform google places input

Enable a google autocomplete input field into your autoform form, defining a mapper between the google api response and your schema. 

## installation
```
meteor add abdj:autoform-google-places-input
```

## todo June 2015
* debug: do NoT add two google input field into your form, you'll have a conflict between those two inputs. WIP. 


## Demo Application
A demo for this plugin is available here: https://github.com/abdj/meteor_google_input_address_demo


## prerequisite
Ensure you have loaded the GoogleMaps API, either globally or on the route scope. 
```
GoogleMaps.load({libraries: 'places'});
```


## example

into your collection declaration
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
      // geopointName: "myOwnGeopointName"
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
