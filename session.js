// Hook in to constellation UI

var Constellation = Package["babrahams:constellation"].API;
    
Constellation.addTab({
  name: 'Session',
  headerContentTemplate: 'Constellation_session_header',
  menuContentTemplate: 'Constellation_session_menu',
  mainContentTemplate: 'Constellation_session_main'
});

var ReactiveDictDep = new Tracker.Dependency;
var currentDict = new ReactiveVar({
  name: "Session",
  dict: Session
});

if (Object.observe) {
  // We're not going to get newly created reactive dictionaries this way until a change is made
  Tracker.autorun(function () {
    var cd = currentDict.get();
    Object.observe(cd.dict.keys, _.throttle(function () {
	  // This does a double redraw of the editableJSON for Session, because the editableJSON is stored in the Session
      ReactiveDictDep.changed();
    }, 3000));
  });
}
else {
  // Check if someone has added something to the Session every 3 seconds
  Meteor.setInterval(function () {
    var currentTab = Constellation.getCurrentTab();
    if (currentTab && currentTab.id === 'Session') {
      // This could get heavy for large reactive dictionaries, so we're going for every 3 seconds
      var change = false;
      var siftedDict = {};
      var currentJSON = EditableJSON.retrieve('constellation_session');
      _.each(currentDict.get().dict.keys || {}, function (val, key) {
        if ((key.indexOf('Constellation_') > -1) || (key.indexOf('Meteor') > -1) || (key.indexOf('Temple_') > -1) || key === "Constellation" || key === 'editableJSON' || _.isUndefined(val) || val === "undefined") {
          return;  
        }
        if (_.isUndefined(currentJSON[key]) || EJSON.stringify(currentJSON[key]) !== val) {
          change = true;
        }
      });
      if (change) {
        ReactiveDictDep.changed();
      }
    }
  }, 3000);
}

var excludedKey = function (val, key) {
  return (key.indexOf('Constellation_') > -1) || (key.indexOf('Meteor') > -1) || (key.indexOf('Temple_') > -1) || key === "Constellation" || key === 'editableJSON' || _.isUndefined(val) || val === "undefined";
}

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

Template.Constellation_session_header.helpers({
  keyCount: function () {
	ReactiveDictDep.depend();
	return Object.keys(_.filter(currentDict.get().dict.keys, function (val, key) { return !excludedKey(val, key); })).length;
  }
});

Template.Constellation_session_main.helpers({
  reactivedict: function () {
    ReactiveDictDep.depend();
    var siftedDict = {};
    _.each(currentDict.get().dict.keys, function (val, key) {
      if (excludedKey(val, key)) {
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
  'change .Constellation_reactive_dictionaries' : function (evt, tmpl) {
    currentDict.set(Blaze.getData(tmpl.$(evt.target).find(':selected')[0]));
  }
});