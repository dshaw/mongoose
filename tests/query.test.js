var assert = require('assert')
  , mongoose = require('mongoose').new()
  , document = mongoose.define
  , db = mongoose.connect('mongodb://localhost/mongoose_test');

document('User')
  .oid('_id')
  .object('name',
    document()
      .string('first')
      .string('last'))
  .object('contact',
    document()
      .string('email')
      .string('phone'))
  .number('visits').default(0)
  .number('age').default(1)
  .bool('blocked')
  .bool('awesome').default(true)
  .array('roles');
  
var User = mongoose.User;
module.exports = {
  before: function(assert, done){
    User.drop(done);
  },
  
  'test simple document insertion': function(assert, done){
    var nathan = new User({
      name: {
        first: 'Nathan',
        last: 'White'
      },
      contact: {
        email: 'nathan@learnboost.com',
        phone: '555-555-5555'
      },
      roles: ['admin'],
      age: 33,
      visits: 25
    });
    
    var tj = new User({
      name: {
          first: 'TJ'
        , last: 'Holowaychuk'
      },
      roles: ['admin'],
      blocked: true,
      age: 23,
      visits: 20
    });
    
    var tobi = new User({
      awesome: false,
      name: {
          first: 'Tobi'
        , last: 'Holowaychuk'
      },
      roles: ['ferret', 'pet'],
      visits: 10
    });
    
    var raul = new User({
      awesome: false,
      name: {
          first: 'Raul'
        , last: 'Rauch'
      },
      roles: ['dog', 'pet'],
      visits: 5
    });
      
    nathan.save(function(errors, doc){
//      assert.ok(!errors);
      tj.save(function(errors){
//        assert.ok(!errors);
        tobi.save(function(errors){
  //        assert.ok(!errors);
          raul.save(function(errors){
    //        assert.ok(!errors);
            done();
          })
        });
      });
    });
    
  },
  
  'test all()': function(assert, done){
    User.all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 4);
      done();
    });
  },
  
  'test forEach()': function(assert, done){
    var docs = [];
    User.find().forEach(function(doc){
      docs.push(docs);
    }).done(function(err){
      assert.ok(!err);
      assert.length(docs, 4);
      done();
    });
  },
  
  'test first()': function(assert, done){
    User.first().all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 1);
      done();
    });
  },
  
  'test first(n)': function(assert, done){
    User.first(2).all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 2);
      assert.equal(23, docs[1].age);
      done();
    });
  },
  
  'test first(fn)': function(assert, done){
    User.first(function(err, doc){
      assert.ok(!err);
      assert.equal('Nathan', doc.name.first);
      done();
    });
  },
  
  'test first(n, fn)': function(assert, done){
    User.first(2, function(err, docs){
      assert.ok(!err);
      assert.length(docs, 2);
      done();
    });
  },
  
  'test find()/one()': function(assert, done){
    User.find({ 'name.last': 'Holowaychuk' }).one(function(err, doc){
      assert.ok(!err);
      assert.equal('TJ', doc.name.first);
      done();
    })
  },
  
  'test find(key, true)': function(assert, done){
    User.find('awesome', true).all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 2);
      assert.equal('Nathan', docs[0].name.first);
      assert.equal('TJ', docs[1].name.first);
      done();
    });
  },
  
  'test find(key) boolean true': function(assert, done){
    User.find('awesome').all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 2);
      assert.equal('Nathan', docs[0].name.first);
      assert.equal('TJ', docs[1].name.first);
      done();
    });
  },
  
  'test .key boolean getter': function(assert, done){
    User.awesome.all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 2);
      assert.equal('Nathan', docs[0].name.first);
      assert.equal('TJ', docs[1].name.first);
      User.notAwesome.all(function(err, docs){
        assert.length(docs, 2);
        assert.equal('Tobi', docs[0].name.first);
        assert.equal('Raul', docs[1].name.first);
        done();
      });
    });
  },
  
  'test .key / not<key> boolean getter chaining': function(assert, done){
    User.notBlocked.awesome.all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 1);
      assert.equal('Nathan', docs[0].name.first);
      done();
    });
  },
  
  'test find(key, true)': function(assert, done){
    User.find('awesome', false).all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 2);
      assert.equal('Tobi', docs[0].name.first);
      assert.equal('Raul', docs[1].name.first);
      done();
    });
  },
  
  'test find() partial select': function(assert, done){
    User.find({ 'name.first': 'TJ' }, { age: true }).all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 1);
      assert.isUndefined(docs[0].visits);
      assert.equal(23, docs[0].age);
      assert.eql(undefined, docs[0].name);
      assert.eql(undefined, docs[0].contact);
      done();
    });
  },
  
  'test find() partial select with namespaced field': function(assert, done){
    User.find({ 'name.first': 'Nathan' }, { 'name.first': true }).all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 1);
      assert.equal('Nathan', docs[0].name.first);
      assert.isUndefined(docs[0].name.last);
      assert.isUndefined(docs[0].age);
      assert.eql(undefined, docs[0].contact);
      done();
    });
  },
  
  'test find() partial select with several fields': function(assert, done){
    User.find({ 'name.first': 'Nathan' }, { name: true, age: true }).all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 1);
      assert.equal('Nathan', docs[0].name.first);
      assert.equal('White', docs[0].name.last);
      assert.equal(33, docs[0].age);
      assert.eql(undefined, docs[0].contact);
      done();
    });
  },
  
  'test find() partial select field omission': function(assert, done){
    User.find({ 'name.first': 'Nathan' }, { contact: false }).all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 1);
      assert.equal('Nathan', docs[0].name.first);
      assert.equal(33, docs[0].age);
      assert.eql({}, docs[0].contact);
      done();
    });
  },
  
  'test fields() partial select': function(assert, done){
    User
      .find({ 'name.first': 'Nathan' })
      .fields({ name: true, age: true }).all(function(err, docs){
        assert.ok(!err);
        assert.length(docs, 1);
        assert.equal('Nathan', docs[0].name.first);
        assert.equal(33, docs[0].age);
        assert.eql(undefined, docs[0].contact);
        done();
    });
  },
  
  'test fields() partial select several calls': function(assert, done){
    User
      .find({ 'name.first': 'Nathan' })
      .fields({ name: true })
      .fields({ age: true }).all(function(err, docs){
        assert.ok(!err);
        assert.length(docs, 1);
        assert.equal('Nathan', docs[0].name.first);
        assert.equal(33, docs[0].age);
        assert.eql(undefined, docs[0].contact);
        done();
    });
  },
  
  'test fields() partial select strings': function(assert, done){
    User
      .find({ 'name.first': 'Nathan' })
      .fields('name', 'age').all(function(err, docs){
        assert.ok(!err);
        assert.length(docs, 1);
        assert.equal('Nathan', docs[0].name.first);
        assert.equal(33, docs[0].age);
        assert.eql(undefined, docs[0].contact);
        done();
    });
  },
  
  'test fields() partial select mixed': function(assert, done){
    User
      .find({ 'name.first': 'Nathan' })
      .fields('name', { age: true }).all(function(err, docs){
        assert.ok(!err);
        assert.length(docs, 1);
        assert.equal('Nathan', docs[0].name.first);
        assert.equal(33, docs[0].age);
        assert.eql(undefined, docs[0].contact);
        done();
    });
  },
  
  'test find() partial select field omission': function(assert, done){
    User.find({ 'name.first': 'Nathan' }, 'name').all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 1);
      assert.equal('Nathan', docs[0].name.first);
      assert.isUndefined(docs[0].age);
      assert.eql(undefined, docs[0].contact);
      done();
    });
  },
  
  'test save of partially selected doc': function(assert, done){
    User
      .find('name.first', 'Nathan')
      .fields('name')
      .all(function(err, docs){
        assert.ok(!err);
        assert.length(docs, 1);
        assert.equal('Nathan', docs[0].name.first);
        assert.equal('White', docs[0].name.last);
        assert.isUndefined(docs[0].visits);
        docs[0].name.first = 'Tobi';
        docs[0].save(function(err){
          assert.ok(!err);
          User
            .find({ name: { first: 'Tobi', last: 'White' }})
            .all(function(err, docs){
              assert.ok(!err);
              assert.length(docs, 1);
              assert.equal('Tobi', docs[0].name.first);
              assert.equal('White', docs[0].name.last);
              docs[0].contact.email = 'nathan@learnboost.com';
              docs[0].contact.phone = '555-555-5555';
              docs[0].visits = 25;
              docs[0].age = 33;
              docs[0].roles = ['admin'];
              docs[0].name.first = 'Nathan';
              docs[0].save(function(err){
                assert.ok(!err);
                done();
              });
            });
        });
      });
  },
  
  'test find() $gt': function(assert, done){
    User.find({ visits: { $gt: 10 }}).all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 2);
      assert.equal('Nathan', docs[0].name.first);
      assert.equal('TJ', docs[1].name.first);
      done();
    });
  },
  
  'test find() key with $gt': function(assert, done){
    User.find('visits', { $gt: 10 }).all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 2);
      assert.equal('Nathan', docs[0].name.first);
      assert.equal('TJ', docs[1].name.first);
      done();
    });
  },
  
  'test find() $nin': function(assert, done){
    User.find({ roles: { $nin: ['pet'] }}).all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 2);
      assert.equal('Nathan', docs[0].name.first);
      assert.equal('TJ', docs[1].name.first);
      done();
    })
  },
  
  'test find() $in': function(assert, done){
    User.find({ roles: { $in: ['admin'] }}).all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 2);
      assert.equal('Nathan', docs[0].name.first);
      assert.equal('TJ', docs[1].name.first);
      done();
    })
  },
  
  'test find() $in multiple values': function(assert, done){
    User.find({ roles: { $in: ['admin', 'pet'] }}).all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 4);
      done();
    })
  },
  
  'test array with<key>()': function(assert, done){
    User.withRole('admin').all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 2);
      assert.equal('Nathan', docs[0].name.first);
      assert.equal('TJ', docs[1].name.first);
      done();
    })
  },
  
  'test array without<key>()': function(assert, done){
    User.withoutRole('pet').all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 2);
      assert.equal('Nathan', docs[0].name.first);
      assert.equal('TJ', docs[1].name.first);
      done();
    })
  },
  
  'test array without<key>s()': function(assert, done){
    User.withoutRole(['pet', 'dog']).all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 2);
      assert.equal('Nathan', docs[0].name.first);
      assert.equal('TJ', docs[1].name.first);
      done();
    })
  },
  
  'test array with<key>s()': function(assert, done){
    User.withRoles(['pet', 'dog']).all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 1);
      assert.equal('Raul', docs[0].name.first);
      done();
    })
  },
  
  'test array with<key>s() chaining': function(assert, done){
    User.awesome.withRole('admin').all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 2);
      assert.equal('Nathan', docs[0].name.first);
      assert.equal('TJ', docs[1].name.first);
      done();
    })
  },
  
  'test find() $all': function(assert, done){
    User.find({ roles: { $all: ['pet', 'dog'] }}).all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 1);
      assert.equal('Raul', docs[0].name.first);
      done();
    })
  },
  
  'test find()/all() query with one condition': function(assert, done){
    User.find({ age: 33 }).all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 1);
      assert.equal('Nathan', docs[0].name.first);
      assert.equal('nathan@learnboost.com', docs[0].contact.email);
      User.find({ 'name.first': 'TJ' }).all(function(err, docs){
        assert.ok(!err);
        assert.length(docs, 1);
        assert.equal('TJ', docs[0].name.first);
        done();
      })
    });
  },
  
  'test find() type casting': function(assert, done){
    User.find({ age: '33' }).all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 1);
      assert.equal('Nathan', docs[0].name.first);
      done();
    });
  },
  
  'test find()/all() query with several conditions': function(assert, done){
    User.find({ 'name.last': 'Holowaychuk' }).all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 2);
      assert.equal('TJ', docs[0].name.first);
      assert.equal('Tobi', docs[1].name.first);
      User.find({ 'name.last': 'Holowaychuk', 'name.first': 'TJ' }).all(function(err, docs){
        assert.ok(!err);
        assert.length(docs, 1);
        assert.equal('TJ', docs[0].name.first);
        done();
      })
    });
  },
  
  'test find() chaining': function(assert, done){
    User
      .find({ 'name.last': 'Holowaychuk' })
      .find({ 'name.first': 'TJ' })
      .all(function(err, docs){
        assert.ok(!err);
        assert.length(docs, 1);
        assert.equal('TJ', docs[0].name.first);
        done();
      });
  },
  
  'test find(key,val) chaining': function(assert, done){
    User
      .find('name.last', 'Holowaychuk')
      .find('name.first', 'TJ')
      .all(function(err, docs){
        assert.ok(!err);
        assert.length(docs, 1);
        assert.equal('TJ', docs[0].name.first);
        done();
      });
  },
  
  'test where() alias': function(assert, done){
    User
      .find()
      .where({ 'name.last': 'Holowaychuk' })
      .where({ 'name.first': 'TJ' })
      .all(function(err, docs){
        assert.ok(!err);
        assert.length(docs, 1);
        assert.equal('TJ', docs[0].name.first);
        done();
      });
  },
  
  'test several kickers': function(assert, done){
    var n = 2
      , a = 0
      , b = 0;
    User
      .find({ 'name.last': 'Holowaychuk' })
      .all(function(err, docs){
        assert.ok(!err);
        assert.equal(1, ++a);
        assert.length(docs, 2);
        assert.equal('TJ', docs[0].name.first);
        --n || done();
      })
      .find({ awesome: true })
      .all(function(err, docs){
        assert.ok(!err);
        assert.equal(1, ++b);
        assert.length(docs, 1);
        assert.equal('TJ', docs[0].name.first);
        --n || done();
      });
  },
  
  'test where() prop': function(assert, done){
    User
      .find()
      .where({ 'name.last': 'Holowaychuk' })
      .where('name.first', 'TJ')
      .all(function(err, docs){
        assert.ok(!err);
        assert.length(docs, 1);
        assert.equal('TJ', docs[0].name.first);
        done();
      });
  },
  
  'test find()/first() query with one condition': function(assert, done){
    User.find({ 'contact.email': 'nathan@learnboost.com' }).first(function(err, doc){
      assert.ok(!err);
      assert.equal('Nathan', doc.name.first);
      done();
    });
  },
  
  'test find() given an ObjectID': function(assert, done){
    User.find({ 'name.first': 'TJ' }).all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 1);
      User.find(docs[0]._id, function(err, doc){
        assert.ok(!err);
        assert.equal('TJ', doc.name.first);
        var query = User.find(docs[0]._id);
        query.first(function(err, doc){
          assert.ok(!err);
          assert.equal('TJ', doc.name.first);
          done();
        });
      });
    });
  },
  
  'test findById()': function(assert, done){
    User.find({ 'name.first': 'TJ' }).all(function(err, docs){
      assert.ok(!err);
      assert.length(docs, 1);
      User.findById(docs[0]._id, function(err, doc){
        assert.ok(!err);
        assert.equal('TJ', doc.name.first);
        done();
      });
    });
  },
  
  'test count()': function(assert, done){
    User.count(function(err, n){
      assert.equal(4, n);
      User.count({ 'name.last': 'White' }, function(err, n){
        assert.equal(1, n);
        User.count({ 'name.last': 'foobar' }, function(err, n){
          assert.equal(0, n);
          done();
        });
      });
    });
  },
  
  'test remove()': function(assert, done){
    User.remove({ 'name.first': 'TJ' }, function(err){
      assert.ok(!err);
      User.find({ 'name.first': 'TJ' }).all(function(err, docs){
        assert.ok(!err);
        assert.length(docs, 0);
        User.find().all(function(err, docs){
          assert.ok(!err);
          assert.length(docs, 3);
          done();
        });
      });
    });
  },
 
  // TODO Uncomment the lines below, and get this to pass. 
  'test invalid query': function(assert, done){
    var calls = 0;
    User.find({ name: { $in: 'invalid' }}).all(function(err, docs){
      assert.equal(++calls, 1);
//      assert.ok(err instanceof Error);
//      assert.equal('invalid query', err.message);
//      assert.ok(!docs);
      done();
    });
  },
  
  teardown: function(){
    mongoose.disconnect();
  }
};