'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var postSchema = Schema({
    title: String,
    picture: String,
    description: String,
    datePublication: String,
    dateUpdate: String,
    author: {type: Schema.Types.ObjectId, ref: 'usuario'},
    authorName: String,
    comments: Boolean,
    linkVideo: String,
    review: String,
    live: Boolean,
    dateHoy: Date
});

module.exports = mongoose.model('post', postSchema);