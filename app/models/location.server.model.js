'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Location Schema
 */
var LocationSchema = new Schema({
    shipment: {
        type: String,
        default: '',
        required: 'PO # HERE',
        trim: false
        },
    type: {
        type: String,
        default: '',
        required: 'Please Enter the UPC',
        trim: false
        },
    length: {
        type: String,
        default: '',
        required: 'Please Enter the UPC',
        trim: false
        },
    color: {
        type: String,
        default: '',
        required: 'Please Enter the UPC',
        trim: false
        },
    location: {
        type: String,
        default: '',
        required: 'RACK LOCATION HERE',
        trim: false
        },
    quantity: {
        type: Number,
        default: '',
        required: 'QTY?',
        trim: false
    },
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

mongoose.model('Location', LocationSchema);
