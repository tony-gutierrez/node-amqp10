'use strict';
var Link = require('../../../lib/link'),
    SenderLink = require('../../../lib/sender_link'),
    Policy = require('../../../lib/policies/policy'),
    putils = require('../../../lib/policies/policy_utilities'),
    util = require('util');

function MockSenderLink(session, options, policyOverrides) {
  var linkPolicy = putils.Merge(policyOverrides, (new Policy()).senderLink);
  MockSenderLink.super_.call(this, session, null, linkPolicy);

  this._created = 0;
  this.options = options;
  this._clearState();
}

util.inherits(MockSenderLink, SenderLink);

MockSenderLink.prototype.canSend = function() {
  this.emit('canSend-called', this);
  return this.capacity > 0;
};

MockSenderLink.prototype._sendMessage = function(msg, options) {
  var self = this;
  self.curId++;
  self.messages.push({ id: self.curId, message: msg.body, options: options });
  self.emit('sendMessage-called', self, self.curId, msg, options);
  return self.curId;
};

MockSenderLink.prototype._clearState = function() {
  this.name = this.options.name;
  this.isSender = this.options.isSender || false;
  this.capacity = this.options.capacity || 0;
  this.messages = [];
  this.curId = 0;
};

MockSenderLink.prototype.simulateAttaching = function() {
  this.sm.sendAttach();
  this.sm.attachReceived();
  this.emit(Link.Attached, this);
  this._resolveAttachPromises(null, this);
};

module.exports = MockSenderLink;
