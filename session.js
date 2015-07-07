// Hook in to constellation UI

var Constellation = Package["babrahams:constellation"].API;
	
Constellation.addTab({
  name: 'Session',
  mainContentTemplate: 'Constellation_session_main',
  menuContentTemplate: 'Constellation_session_menu'
});

var ReactiveDictDep = new Tracker.Dependency;
var currentDict = new ReactiveVar({
  name: "Session",
  dict:Session
});

// Check if someone has added something to the Session every 5 seconds
Meteor.setInterval(function () {
  ReactiveDictDep.changed();
}, 5000);

EditableJSON.afterUpdate(function (store, action, JSONbefore, documentsUpdated) {
  // Make the changes
  // TODO -- this is  quick and dirty and complete overkill -- resetting (almost) everything in the Session.keys
  //         when we can just read the `action` parameter and make the exact granular changes needed
  var cd = currentDict.get();
  _.each(this, function (val, key) {
	cd.dict.set(key, val);
  });
  // Need to make sure any field names that have been changed or deleted have their corresponding session value deleted
  var missingKeys = _.difference(_.keys(JSONbefore),_.keys(this));
  _.each(missingKeys, function (key) {
	var cd = currentDict.get();
	delete cd.dict.keys[key];
  });
  ReactiveDictDep.changed();
},'constellation_session');

Template.Constellation_session_main.helpers({
  reactivedict: function () {
	ReactiveDictDep.depend();
	var siftedDict = {};
	_.each(currentDict.get().dict.keys, function (val, key) {
	  if ((key.indexOf('Constellation_') > -1) || (key.indexOf('Meteor') > -1) || (key.indexOf('Temple_') > -1) || key === "Constellation" || key === 'editableJSON' || _.isUndefined(val) || val === "undefined") {
		return;  
	  }
	  siftedDict[key] = EJSON.parse(val);
	});
	return siftedDict;
  }
});

Template.Constellation_session_menu.helpers({
  dictionaries: function () {
	ReactiveDictDep.depend();
	var dictionaries = [];
	for (var member in window) {
	  if (window[member] instanceof ReactiveDict) {
		dictionaries.push({
		  name: member,
		  dict: window[member]
		});
	  }
	}
	return dictionaries;
  },
  selected: function () {
	ReactiveDictDep.depend();
	var cd = currentDict.get();
    return (this.name === cd.name) ? true : false;
  }
});

Template.Constellation_session_menu.events({
  'click option' : function () {
    currentDict.set(this);
  }
});