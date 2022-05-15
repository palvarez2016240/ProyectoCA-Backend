'use strict'

var express = require("express");
var md_autorizacion = require("../Middlewares/authenticated");
var usuarioControlador = require("../Controladores/usuario.controlador");
var postControlador = require("../Controladores/post.controlador");
var commentControlador = require("../Controladores/comment.controlador");
var multiparty = require('connect-multiparty');

//RUTAS
var api = express.Router();
api.post('/registrarUsuario', md_autorizacion.ensureAuth, usuarioControlador.registrarUsuario);
api.post('/loginUsuario', usuarioControlador.loginUsuario);
api.put('/editarUsuario/:id', md_autorizacion.ensureAuth, usuarioControlador.editarUsuario);
api.delete('/eliminarUsuario/:id', md_autorizacion.ensureAuth, usuarioControlador.eliminarUsuario);
api.get('/mostrarPublicadores', usuarioControlador.mostrarPublicadores);
api.get('/buscarPublicador/:id', usuarioControlador.buscarPublicador);
api.post('/createPost', md_autorizacion.ensureAuth ,postControlador.createPost); 
api.put("/updatePost/:post", md_autorizacion.ensureAuth, postControlador.updatePost); 
api.delete("/deletePost/:idPost", md_autorizacion.ensureAuth, postControlador.deletePost); 
api.get('/mostrarPost', postControlador.mostrarPost); 
api.get('/postLive', postControlador.postLive); 
api.get('/autorPost/:idAutor', postControlador.postAutor);
api.get("/verPost/:idPost", postControlador.verPost); 
api.post("/createComment/:idPost", commentControlador.createComment); 
api.delete("/deleteComment/:idComment", md_autorizacion.ensureAuth ,commentControlador.deleteComment);
api.get("/readComment/:idComment", commentControlador.readComment); 
api.get("/commentPost/:idPost", commentControlador.commentPost); 
api.get("/comentarios", commentControlador.comentarios); 

module.exports = api;