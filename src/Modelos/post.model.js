'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var postSchema = Schema({
    title: String,
    picture: String,
    description: String,
    datePublication: Date,
    dateUpdate: Date,
    author: {type: Schema.Types.ObjectId, ref: 'usuario'},
    authorName: String,
    comments: Boolean
});

module.exports = mongoose.model('post', postSchema);