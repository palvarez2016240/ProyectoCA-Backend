'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var commentsSchema = Schema({
    comment: String,
    idPost: {type: Schema.Types.ObjectId, ref: 'post'},
    datePublication: Date
});

module.exports = mongoose.model('comments', commentsSchema);