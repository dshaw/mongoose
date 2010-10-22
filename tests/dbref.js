var assert = require('assert')
  , mongoose = require('../');
  
mongoose.connect('mongodb://localhost/mongoose_integration_tests');
mongoose.define('Dog')
  .oid('_id')
  .string('name');
var Dog = mongoose.Dog;

mongoose.define('User')
  .oid('_id')
  .string('name')
  .dbref('dog', Dog);
var User = mongoose.User;

module.exports = {
  'setting via JSON input should allow you to access a Document instance': function () {
    var user = new User({
      name: 'Charlie',
      dog: {name: 'Snoopy'}
    });
    user.dog.do( function (dog) {
      assert.ok((dog instanceof Dog) === true);
    });
  },

  'setting to a new instance should allow you to access that new instance': function () {
    var user = new User({
      name: 'Charlie',
      dog: new Dog({name: 'Snoopy'})
    });
    user.dog.do( function (dog) {
      assert.ok((dog instanceof Dog) === true);
      assert.ok(dog.name === 'Snoopy');
    });
  },

  'setting to a persisted instance should automatically set the dbref params': function () {
    new Dog({
      name: 'Pluto'
    }).save( function (error, dog) {
      var user = new User({
        name: 'Mickey',
        dog: dog
      });
      assert.ok(typeof dog._._id !== "undefined");
      assert.ok(user._.doc.dog === {'$ref': dog._schema._collection, '$id': dog._._id});
    });
  },

  'saving after setting the dbref to unpersisted data should automatically save that data to its own document': function () {
    var user = new User({
      name: 'Timmy',
      dog: {
        name: 'Lassie'
      }
    });
    user.save( function (errors, user) {
      Dog.find({name: 'Lassie'}).first( function (dog) {
        user.dog.do( function (puppy) {
          assert.ok(puppy.id === dog.id);
        });
      });
    });
  },

  'over-riding a dbref target with a different one should change the dbref params AND the de-referenced dbref': function () {
    var user = new User({
      name: 'Charlie',
      dog: {
        name: 'Snoopy'
      }
    });
    user.dog.do( function (dog1) {
      var id1 = user._.doc.dog['$id'];
      user.dog = new Dog({name: 'Woodstock'});
      user.dog.do( function (dog2) {
        var id2 = user._.doc.dog['$id'];
        assert.ok(dog1.id !== dog2.id);
        assert.ok(id1 !== id2);
      });
    });
  },

  'saving the referer after setting to a new dbref should update the dbref params': function () {
    new User({
      name: 'Ed',
      dog: {
        name: 'Marmaduke'
      }
    }).save( function (errors, user) {
      var id1 = user._.doc.dog['$id']
      user.dog = new Dog({ name: 'Droopy' });
      user.save( function (errors, user) {
        var id2 = user._.doc.dog['$id'];
        assert.ok(id1 !== id2);
      });
    });
  },

  'updating the dbref params directly should change the retrieved target on the next get': function () {
    var user = new User({
      name: 'Lynn',
      dog: {
        name: 'Squeak'
      }
    });
    new Dog({
      name: 'Banana Smashie'
    }).save( function (errors, dog2) {
      user.dog.do( function (dog1) {
        user._.doc.dog['$id'] = dog2._.doc._id;
        user.dog.do( function (refreshedDog) {
          assert.ok(refreshedDog.name === dog2.name);
        });
      });
    });
  }

  'saving the source after setting to a persisted instance should not update the de-referenced target': function () {
  },

  'setting properties of the dbref target should persist when we save the referring (source) instance': function () {
    new User({
      name: 'Turner',
      dog: {name: 'Hooch'}
    }).save( function (errors, user) {
      user.dog.do( function (dog) {
        dog.name = 'Hooch the 2nd';
        user.save( function (errors, user) {
          Dog.findById(dog.id, function (dog) {
            assert.ok(dog.name === 'Hooch the 2nd');
          });
        });
      })
    });
  },

  'test removing the dbref target': function () {
    new User({
      name: 'Shaggy',
      dog: {
        name: 'Scooby'
      }
    }).save( function (errors, user) {
      user.dog.remove( function () {
        assert.ok( typeof user.dog === "undefined" );
        assert.ok( typeof user._.doc.dog === "undefined");
      });
    });
  },

  'initializing a referring user without a dbref should set it to the default dbref': function () {
  }
};