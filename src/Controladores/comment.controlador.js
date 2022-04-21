'use strict'

var comment = require("../Modelos/comment.model");
var post = require("../Modelos/post.model");
const { param } = require("express/lib/request");
var fs = require('fs');
var path = require('path');
const res = require("express/lib/response");

function createComment(req, res) {
    var commentModel = new comment();
    var params = req.body;
    var idPost = req.params.idPost;

    if (params.comment) {
        commentModel.comment = params.comment;
        commentModel.idPost = idPost;

        post.findOne({ _id: idPost }).exec((err, postFound) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!postFound) return res.status(404).send({ mensaje: "El post no existe" });

            if (postFound.comments === true) {
                commentModel.save((err, commentSaved) => {
                    if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
                    if (!commentSaved) return res.status(500).send({ mensaje: "No se pudo guardar el comentario" });
                    return res.status(200).send({ mensaje: "Comentario publicado" });
                })
            }
            else {
                return res.status(500).send({ mensaje: "No se puede comentar en este post" });
            }
        })
    }
    else {
        return res.status(500).send({ mensaje: "No ha comentado nada" });
    }
}

function deleteComment(req, res) {
    var idComment = req.params.idComment;

    if (req.user.rol != "ROL_ADMIN" && req.user.rol != "ROL_Publicador") {
        return res.status(500).send({ mensaje: "Solo el ADMIN o un publicador puede eliminar un comentario" });
    }

    comment.findOne({ _id: idComment }).exec((err, commentFound) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (!commentFound) return res.status(500).send({ mensaje: "El comentario no existe" });

        comment.findByIdAndDelete(idComment, (err, commentDeleted) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!commentDeleted) return res.status(500).send({ mensaje: "El comentario no se pudo eliminar" });
            return res.status(200).send({ mensaje: "Comentario eliminado correctamente" });
        })
    })
}

function readComment(req, res) {
    var idComment = req.params.idComment;

    comment.findOne({ _id: idComment }).exec((err, commentFound) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (!commentFound) return res.status(404).send({ mensaje: "El comentario no existe" });
        return res.status(200).send({ commentFound })
    })
}

function commentPost(req, res) {
    var idPostComment = req.params.idPost;

    post.findOne({ _id: idPostComment }).exec((err, postFound) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (!postFound) return res.status(404).send({ mensaje: "El post no existe" });
        var allowComments = postFound.comments;

        if (allowComments === true) {
            comment.find({ idPost: idPostComment }).exec((err, commentFound) => {
                if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
                return res.status(200).send({ commentFound });
            })
        }
        else {
            return res.status(500).send({mensaje: "Los comentario estan desactivados"})
        }  
    })

}

module.exports = {
    createComment,
    deleteComment,
    readComment,
    commentPost
}