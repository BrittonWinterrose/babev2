'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Location = mongoose.model('Location'),
	_ = require('lodash');

/**
 * Create a Location
 */
exports.create = function(req, res) {
	var location = new Location(req.body);
	location.user = req.user;

	location.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(location);
		}
	});
};

/**
 * Show the current Location
 */
exports.read = function(req, res) {
	res.jsonp(req.location);
};

/**
 * Update a Location
 */
exports.update = function(req, res) {
	var location = req.location ;

	location = _.extend(location , req.body);

	location.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(location);
		}
	});
};

/**
 * Delete an Location
 */
exports.delete = function(req, res) {
	var location = req.location ;

	location.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(location);
		}
	});
};

/**
 * List of Locations
 */
exports.list = function(req, res) {

	var sort;
	var sortObject = {};
	var count = req.query.count || 5;
	var page = req.query.page || 1;


	var filter = {
		filters : {
			mandatory : {
				contains: req.query.filter
			}
		}
	};

	var pagination = {
		start: (page - 1) * count,
		count: count
	};

	if (req.query.sorting) {
		var sortKey = Object.keys(req.query.sorting)[0];
		var sortValue = req.query.sorting[sortKey];
		sortObject[sortValue] = sortKey;
	}
	else {
		sortObject.desc = '_id';
	}

	sort = {
		sort: sortObject
	};


	Location
		.find()
		.filter(filter)
		.order(sort)
		.page(pagination, function(err, locations){
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(locations);
			}
		});

};

/**
 * Location middleware
 */
exports.locationByID = function(req, res, next, id) {
	Location.findById(id).populate('user', 'displayName').exec(function(err, location) {
		if (err) return next(err);
		if (! location) return next(new Error('Failed to load Location ' + id));
		req.location = location ;
		next();
	});
};

/**
 * Location authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.location.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
