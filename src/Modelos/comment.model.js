'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var commentsSchema = Schema({
    comment: String,
    idPost: {type: Schema.Types.ObjectId, ref: 'post'},
    namePost: String,
    datePublication: Date
});

module.exports = mongoose.model('comments', commentsSchema);