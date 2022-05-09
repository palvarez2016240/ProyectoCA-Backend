'use strict'

var post = require("../Modelos/post.model");
var comment = require("../Modelos/comment.model");
const { param } = require("express/lib/request");
var dateToday = new Date();
var fs = require('fs');
var path = require('path');
const { Console } = require("console");

function createPost(req, res) {
    var idPost;
    var postModel = new post();
    var params = req.body;

    if (req.user.rol != "ROL_Publicador") {
        return res.status(500).send({ mensaje: "Solo un publicador puede hacer posts" });
    }

    if (params.title && params.description && params.comments) {

        postModel.title = params.title;
        postModel.description = params.description;
        postModel.datePublication = dateToday;
        postModel.dateUpdate = null;
        postModel.author = req.user.sub;
        postModel.authorName = `${req.user.nombre} ${req.user.apellido}`;
        postModel.comments = params.comments;


        postModel.save((err, postPublicado) => {
            if (err) return res.status(500).send({ mensaje: "Error al intentar publicar el post" });
            if (!postPublicado) return res.status(500).send({ mensaje: "Error al intentar publicar el post" });
            return res.status(200).send({postPublicado});
        })


    }
    else {
        return res.status(500).send({ mensaje: "Algunos campos estan vacios" })
    }
}

function createPostImg(req, res) {
    var idPost;
    var postModel = new post();
    var params = req.body;

    if (req.user.rol != "ROL_Publicador") {
        return res.status(500).send({ mensaje: "Solo un publicador puede hacer posts" });
    }

    if (params.title && params.description && params.comments) {

        postModel.title = params.title;
        postModel.description = params.description;
        postModel.datePublication = dateToday;
        postModel.dateUpdate = null;
        postModel.author = req.user.sub;
        postModel.authorName = `${req.user.nombre} ${req.user.apellido}`;
        postModel.comments = params.comments;

        if (req.files) {

            //En esta variable se guardara la ruta de la imagen
            var direccionArchivo = req.files.imagen.path;

            //Se elimina las diagonales invertidas de la ruta
            var direccion_split = direccionArchivo.split('\\');

            //En esta variable se guarda el nombre del archivo
            var nombre_archivo = direccion_split[3];

            //En esta variable se separa el nombre del archivo de su extension  
            var extension_archivo = nombre_archivo.split('.');

            //Se guarda el nombre de la extension
            var nombre_extension = extension_archivo[1].toLowerCase();

            //Se valida que la extasion del archivo sea correcta
            if (nombre_extension === 'png' || nombre_extension === 'jpg' || nombre_extension === 'gif' || nombre_extension === 'tiff' || nombre_extension === 'psd' || nombre_extension === 'bmp' || nombre_extension === 'eps' || nombre_extension === 'svg' || nombre_extension === 'jpeg') {

                postModel.save((err, postPublicado) => {
                    if (err) return res.status(500).send({ mensaje: "Error al intentar publicar el post" });
                    if (!postPublicado) return res.status(500).send({ mensaje: "Error al intentar publicar el post" });
                    idPost = postPublicado._id;

                    //Se sube la imagen del equipo
                    post.findByIdAndUpdate(idPost, { picture: nombre_archivo }, { new: true }, (err, pictureUpload) => {
                        if (err) return res.status(500).send({ mensaje: "Error al subir la imagen" });
                        if (!pictureUpload) return res.status(500).send({ mensaje: "Error al subir la imagen" })
                        return res.status(200).send({ mensaje: "Publicacion hecha" });
                    })
                })

            } else {

                //Se elimina el archivo subido no permitido
                return eliminarArchivo(res, direccionArchivo, 'Tipo de imagen no permitida');
            }
        } else {
            return res.status(500).send({ mensaje: "No se ha subido ningun archivo" })
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

    params.dateUpdate = dateToday;

    post.findOne({ _id: idPost }).exec((err, postFound) => {
        if (err) return res.status(500).send({ mensaje: "Error al buscar el post" });
        var idAuthor = postFound.author;

        if (idRequested == idAuthor || req.user.rol == "ROL_ADMIN") {
            post.findByIdAndUpdate(idPost, params, { new: true }, (err, postUpdated) => {
                if (err) return res.status(500).send({ mensaje: "Error en la peticion de actualizar" })
                if (!postUpdated) return res.status(500).send({ mensaje: "Error en la peticion de actualizar" })
                if (postUpdated) {
                    return res.status(200).send({ mensaje: "Post Actualizado" })
                }
            })
        }
        else {
            return res.status(500).send({ mensaje: "El post no te pertenece" });
        }
    })
}

function updatePicture(req, res) {
    var idPost = req.params.idPost;
    var idRequested = req.user.sub;

    post.findOne({ _id: idPost }).exec((err, postFound) => {
        if (err) return res.status(500).send({ mensaje: "Error al buscar el post" });
        var idAuthor = postFound.author;

        if (idRequested == idAuthor) {

            if (req.files) {
                //En esta variable se guardara la ruta de la imagen
                var direccionArchivo = req.files.imagen.path;

                //Se elimina las diagonales invertidas de la ruta
                var direccion_split = direccionArchivo.split('\\');

                //En esta variable se guarda el nombre del archivo
                var nombre_archivo = direccion_split[3];

                //En esta variable se separa el nombre del archivo de su extension  
                var extension_archivo = nombre_archivo.split('.');

                //Se guarda el nombre de la extension
                var nombre_extension = extension_archivo[1].toLowerCase();

                //Se valida que la extasion del archivo sea correcta
                if (nombre_extension === 'png' || nombre_extension === 'jpg' || nombre_extension === 'gif' || nombre_extension === 'tiff' || nombre_extension === 'psd' || nombre_extension === 'bmp' || nombre_extension === 'eps' || nombre_extension === 'svg' || nombre_extension === 'jpeg') {

                    //Se sube la imagen del equipo
                    post.findByIdAndUpdate(idPost, { picture: nombre_archivo }, { new: true }, (err, imageUpload) => {
                        if (err) return res.status(500).send({ mensaje: "Error al cambiar la imagen" });
                        return res.status(200).send({ mensaje: "Nueva imagen colocada" });
                    })
                } else {

                    //Se elimina el archivo subido no permitido
                    return eliminarArchivo(res, direccionArchivo, 'Tipo de imagen no permitida');
                }
            } else {
                return res.status(500).send({ mensaje: "No se ha subido ningun archivo" })
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

    post.find({}).sort({datePublication: -1}).exec((err, postFound) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (postFound.length === 0) return res.status(404).send({ mensaje: "No hay posts" });
        if (!postFound) return res.status(404).send({ mensaje: 'No hay posts' });
        return res.status(200).send({ postFound });
    })
}

function postAutor(req, res) {
    var idAuthor = req.params.idAutor;

    post.find({ author: idAuthor }).sort({datePublication: -1}).exec((err, postFound) => {
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

function eliminarArchivo(res, rutaArchivo, mensaje) {

    //Elimina el archivo no apto 
    fs.unlink(rutaArchivo, (err) => {
        return res.status(500).send({ mensaje: mensaje })
    })
}

function obtenerImagen(req, res) {
    var nombreImagen = req.params.imagen;
    var rutaArchivo = `./src/Imagenes/Post/${nombreImagen}`;

    //Funcion para obtener la imagen en archivo
    fs.access(rutaArchivo, ((err) => {
        if (err) {
            return res.status(500).send({ mensaje: "No existe la imagen" });
        } else {
            return res.sendFile(path.resolve(rutaArchivo));
        }
    }))
}

module.exports = {
    createPost,
    obtenerImagen,
    updatePost,
    updatePicture,
    deletePost,
    mostrarPost,
    postAutor,
    verPost
}