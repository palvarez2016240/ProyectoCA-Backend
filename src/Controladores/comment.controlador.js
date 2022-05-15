'use strict'

var comment = require("../Modelos/comment.model");
var post = require("../Modelos/post.model");
var mes;
var today = new Date();

function createComment(req, res) {
    var commentModel = new comment();
    var params = req.body;
    var idPost = req.params.idPost;

    if (params.comment) {
        commentModel.comment = params.comment;
        commentModel.idPost = idPost;
        commentModel.fecha = today;
        commentModel.admin = params.admin;

        var fechas = today.toString()
        var fechaSplit = fechas.split(" ");
            
        switch (fechaSplit[1]) {
                case 'Jan':
                    mes = '01';
                    break;

                case 'Feb':
                    mes = '02';
                    break;
            
                case 'Mar':
                    mes = '03';
                    break;

                case 'Apr':
                    mes = '04';
                    break;
            
                case 'May':
                    mes = '05';
                    break;

                case 'Jun':
                    mes = '06';
                    break;

                case 'Jul':
                    mes = '07';
                    break;

                case 'Aug':
                    mes = '08';
                    break;

                case 'Sep':
                    mes = '09';
                    break;

                case 'Oct':
                    mes = '10';
                    break;

                case 'Nov':
                    mes = '11';
                    break;

                 case 'Dec':
                    mes = '12';
                    break;
        }
             
        var fechaC = `${fechaSplit[2]}/${mes}/${fechaSplit[3]} ${fechaSplit[4]}`;

        commentModel.datePublication = fechaC;
        console.log(commentModel.admin);
        post.findOne({ _id: idPost }).exec((err, postFound) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!postFound) return res.status(404).send({ mensaje: "El post no existe" });
            var name = postFound.title;

            if (postFound.comments === true) {

                commentModel.namePost = name;

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
            comment.find({ idPost: idPostComment }).sort({fecha: -1}).exec((err, commentFound) => {
                if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
                return res.status(200).send({ commentFound });
            })
        }
        else {
            return res.status(200).send({mensaje: "Los comentario estan desactivados"})
        }  
    })

}

function comentarios(req, res) {
    comment.find().sort({fecha: -1}).exec((err, comentFound)=>{
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (!comentFound) return res.status(404).send({ mensaje: "El comentario no existe" });
        return res.status(200).send({ comentFound })
    })
}

module.exports = {
    createComment,
    deleteComment,
    readComment,
    commentPost,
    comentarios
}