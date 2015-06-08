/**
 *
 * @module model/master
 * @description master model
 * @author Greg Babula
 * @todo implement polling
 *
 */

'use strict';

const _             = require('lodash');
const util          = require('util');
const http          = require('http');
const EventEmitter  = require('events').EventEmitter;

/**
 *
 * @constructor MasterModel
 * @param {Object} opts
 *
 */
function MasterModel(opts) {

    if (!(this instanceof MasterModel)) {
        return new MasterModel(opts);
    }

    this.opts = _.extend({
        interval: 40000
    }, opts);

    this.instance = false;
    this.dataCache = {};

    EventEmitter.call(this);

}

util.inherits(MasterModel, EventEmitter);

/**
 *
 * @method init
 * @description initiates master model, begins initial data fetch
 * @returns {Object} this
 *
 */
MasterModel.prototype.init = function() {

    if (!this.instance) {

        this.instance = true;
        this.fetch();

    }

    return this;

};

/**
 *
 * @method fetch
 * @param {Object} opts options Object passed to request
 * @description makes a GET request to specified path, emits data event, expecting JSON by default
 * @todo implement polling, cleanup
 * @returns {Object} this
 *
 */
MasterModel.prototype.fetch = function(opts) {

    let _this = this;
    let options = _.extend({
        interval: undefined,
        path: ''
    }, this.opts, opts);

    util.log('g5-knockout : fetch master model data');
    util.log(options);

    /**
     *
     * @method get
     * @param {Object} options
     * @param {Function} callback
     *
     */
    http.get(options, function(res) {

        if (res.statusCode === 404) {
            _this.emit('data-error', 404);
        }

        /**
         *
         * @event data
         * @param {Object} buf
         *
         */
        res.on('data', function(buf) {

            let _data = JSON.parse(buf);

            _this.dataCache = _data;
            _this.emit('data', _data);

        });

        /**
         *
         * @event error
         * @param {Object} err
         *
         */
        res.on('error', function(err) {

            _this.emit('data-error', err);

        });

    });

    return this;

};

exports.MasterModel = MasterModel;