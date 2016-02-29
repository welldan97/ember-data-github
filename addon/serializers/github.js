import DS from 'ember-data';
import Ember from 'ember';

export default DS.RESTSerializer.extend({
  normalizeArrayResponse: function(store, primaryModelClass, payload) {
    var pluralTypeKey = Ember.Inflector.inflector.pluralize(primaryModelClass.modelName);
    var wrappedPayload = {};
    wrappedPayload[pluralTypeKey] = payload;
    return this._super(store, primaryModelClass, wrappedPayload);
  },
  normalizeSingleResponse: function(store, primaryModelClass, payload, recordId) {
    var pluralTypeKey = Ember.Inflector.inflector.pluralize(primaryModelClass.modelName);
    payload.recordId = recordId;
    var wrappedPayload = {};
    wrappedPayload[pluralTypeKey] = payload;
    return this._super(store, primaryModelClass, wrappedPayload, recordId);
  }
});
