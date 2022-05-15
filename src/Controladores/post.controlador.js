'use strict'

var post = require("../Modelos/post.model");
var comment = require("../Modelos/comment.model");
const { param } = require("express/lib/request");
var dateToday = new Date();
var  mes;

function createPost(req, res) {
    var postModel = new post();
    var params = req.body;

    if (req.user.rol != "ROL_Publicador") {
        return res.status(500).send({ mensaje: "Solo un publicador puede hacer posts" });
    }

    if (params.title && params.description && params.comments && params.review && params.picture) {

        postModel.title = params.title;
        postModel.description = params.description;
        postModel.dateUpdate = null;
        postModel.dateHoy = dateToday;
        postModel.author = req.user.sub;
        postModel.authorName = `${req.user.nombre} ${req.user.apellido}`;
        postModel.comments = params.comments;
        postModel.review = params.review;
        postModel.picture = params.picture;

        var fechas = dateToday.toString()
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
             
        var fecha = `${fechaSplit[2]}/${mes}/${fechaSplit[3]} ${fechaSplit[4]}`;

        postModel.datePublication = fecha; 

        if (params.linkVideo) {
            
            var link = params.linkVideo;
            var linkSplit = link.split('/');
            var video = linkSplit[3];

            postModel.linkVideo = video;
            postModel.live = params.live;


            postModel.save((err, postPublicado) => {
                if (err) return res.status(500).send({ mensaje: "Error al intentar publicar el post" });
                if (!postPublicado) return res.status(500).send({ mensaje: "Error al intentar publicar el post" });
                return res.status(200).send({ postPublicado });
            })

        } else {
            postModel.linkVideo = null;
            params.live = null;

            postModel.save((err, postPublicado) => {
                if (err) return res.status(500).send({ mensaje: "Error al intentar publicar el post" });
                if (!postPublicado) return res.status(500).send({ mensaje: "Error al intentar publicar el post" });
                return res.status(200).send({ postPublicado });
            })
        }

    }
    else {
        return res.status(500).send({ mensaje: "Algunos campos estan vacios" })
    }
}

function updatePost(req, res) {
    var idPost = req.params.post;
    var params = req.body;
    var idRequested = req.user.sub;

    if (!params.title && !params.description && !params.comments) {
        return res.status(500).send({ mensaje: 'No hay ningun parametro correcto para editar' });
    }

    post.findOne({ _id: idPost }).exec((err, postFound) => {
        if (err) return res.status(500).send({ mensaje: "Error al buscar el post" });
        var idAuthor = postFound.author;
        let linkAntiguo = postFound.linkVideo;

        if (idRequested == idAuthor || req.user.rol == "ROL_ADMIN") {

            var fechas = dateToday.toString()
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
             
        var fecha = `${fechaSplit[2]}/${mes}/${fechaSplit[3]} ${fechaSplit[4]}`;

        params.dateUpdate = fecha;

            if (params.linkVideo) {
                if (params.linkVideo === linkAntiguo) {

                    post.findByIdAndUpdate(idPost, params, { new: true }, (err, postUpdated) => {
                        if (err) return res.status(500).send({ mensaje: "Error en la peticion de actualizar" })
                        if (!postUpdated) return res.status(500).send({ mensaje: "Error en la peticion de actualizar" })
                        if (postUpdated) {
                            return res.status(200).send({ mensaje: "Post Actualizado" })
                        }
                    })
                }
                else {
                    var link = params.linkVideo;
                    var linkSplit = link.split('/');
                    var video = linkSplit[3];

                    params.linkVideo = video;

                    post.findByIdAndUpdate(idPost, params, { new: true }, (err, postUpdated) => {
                        if (err) return res.status(500).send({ mensaje: "Error en la peticion de actualizar" })
                        if (!postUpdated) return res.status(500).send({ mensaje: "Error en la peticion de actualizar" })
                        if (postUpdated) {
                            return res.status(200).send({ mensaje: "Post Actualizado" })
                        }
                    })
                }
            }
            else {

                params.linkVideo = null;
                params.live = null;

                post.findByIdAndUpdate(idPost, params, { new: true }, (err, postUpdated) => {
                    if (err) return res.status(500).send({ mensaje: "Error en la peticion de actualizar" })
                    if (!postUpdated) return res.status(500).send({ mensaje: "Error en la peticion de actualizar" })
                    if (postUpdated) {
                        return res.status(200).send({ mensaje: "Post Actualizado" })
                    }
                })
            }

        }
        else {
            return res.status(500).send({ mensaje: "El post no te pertenece" });
        }
    })
}

function deletePost(req, res) {
    var idPost = req.params.idPost;

    post.findById(idPost, (err, postFound) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (!postFound) return res.status(500).send({ mensaje: "El post no existe" });
        var idPoster = postFound.author;

        if (req.user.sub != idPoster) {
            if (req.user.rol != "ROL_ADMIN")
                return res.status(500).send({ mensaje: "Solo el ADMIN o el creador del post puede eliminar este post" });
        }

        post.findByIdAndDelete(idPost, (err, postDeleted) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!postDeleted) return res.status(500).send({ mensaje: "No se pudo eliminar el post" });
            var publicacion = idPost;

            comment.deleteMany({ idPost: publicacion }, { multi: true }, (err, commentDeleted) => {
                if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
                if (!commentDeleted) return res.status(500).send({ mensaje: "No se pudo eliminar los comentarios" })
                return res.status(200).send({ mensaje: "Post eliminado correctamente" });
            })
        })

    })
}

function mostrarPost(req, res) {

    post.find({}).sort({ dateHoy: -1 }).exec((err, postFound) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (postFound.length === 0) return res.status(404).send({ mensaje: "No hay posts" });
        if (!postFound) return res.status(404).send({ mensaje: 'No hay posts' });
        return res.status(200).send({ postFound });
    })
}

function postAutor(req, res) {
    var idAuthor = req.params.idAutor;

    post.find({ author: idAuthor }).sort({ dateHoy: -1 }).exec((err, postFound) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (postFound.length === 0) return res.status(404).send({ mensaje: "No hay posts" });
        if (!postFound) return res.status(404).send({ mensaje: 'No hay posts' });
        return res.status(200).send({ postFound });
    })
}

function verPost(req, res) {
    var idPost = req.params.idPost;

    post.findOne({ _id: idPost }).exec((err, postFound) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (!postFound) return res.status(404).send({ mensaje: 'El post no existe' });
        if (postFound.length === 0) return res.status(404).send({ mensaje: "El post no existe" });
        return res.status(200).send({ postFound });
    })
}

function postLive(req, res) {
    post.find({live: true}).sort({ dateHoy: -1}).exec((err, postFound) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (postFound.length === 0) return res.status(404).send({ mensaje: "No hay posts" });
        if (!postFound) return res.status(404).send({ mensaje: 'No hay posts' });
        return res.status(200).send({ postFound });
    })
}
module.exports = {
    createPost,
    updatePost,
    deletePost,
    mostrarPost,
    postAutor,
    verPost,
    postLive
}