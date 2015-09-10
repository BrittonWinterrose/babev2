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
    po: {
        type: String,
        default: '',
        required: 'PO # HERE',
        trim: false
        },
    upc: {
        type: String,
        default: '',
        required: 'Please Enter the UPC',
        trim: false
    },
    item: {
        type: String,
        default: '',
        required: 'Please Enter the UPC',
        trim: false
    },
    carton: {
        type: String,
        default: '',
        required: 'Please Enter the Carton ID',
        trim: false
    },
    location: {
        type: String,
        default: '',
        required: 'Please Enter the UPC',
        trim: false
    },
    quantity: {
        type: Number,
        default: '',
        required: 'Quantity?',
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
