'use strict'

var usuario = require("../modelos/usuario.model");
var bcrypt = require('bcrypt-nodejs');
var jwt = require("../Servicios/jwt");
const { param } = require("express/lib/request");

function registrarUsuario(req, res) {
    var usuarioModel = new usuario();
    var params = req.body;

    if (params.usuario === 'Admin' || params.usuario === 'ADMIN') {
        return res.status(500).send({ mensaje: 'No puedes utilizar este usuario' })
    }

    if (req.user.rol != "ROL_ADMIN") {
        return res.status(500).send({ mensaje: "Solo el Administrador puede crear publicadores" })
    }

    if (params.nombre && params.password && params.apellido && params.usuario) {
        usuarioModel.nombre = params.nombre;
        usuarioModel.rol = 'ROL_Publicador';
        usuarioModel.usuario = params.usuario.toLowerCase();
        usuarioModel.apellido = params.apellido;

        usuario.find({
            $or: [
                { usuario: usuarioModel.usuario },
            ]
        }).exec((err, usuarioEncontrado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion del usuario" });
            if (usuarioEncontrado && usuarioEncontrado.length >= 1) {
                return res.status(500).send({ mensaje: "El nombre de usuario ya existe" });
            } else {
                bcrypt.hash(params.password, null, null, (err, passwordEncriptada) => {
                    usuarioModel.password = passwordEncriptada;

                    usuarioModel.save((err, usuarioGuardado) => {
                        if (err) return res.status(500).send({ mensaje: "Error en la peticion del usuario" });
                        if (usuarioGuardado) {
                            res.status(200).send({ mensaje: "Ha sido registrado correctamente" })
                        } else {
                            res.status(404).send({ mensaje: "No se a podido guardar el usuario" })
                        }
                    })
                })
            }
        })
    } else {
        return res.status(500).send({ mensaje: 'Faltan algunos campos por llenar' });
    }
}

function loginUsuario(req, res) {
    var params = req.body;

    params.usuario = params.usuario.toLowerCase();

    if (params.usuario && params.password) {
        usuario.findOne({ usuario: params.usuario }, (err, userEncontrado) => {
            if (err) return res.status(500).send({ mensaje: "Error al intentar confirmar las credenciales" });
            if (userEncontrado) {
                bcrypt.compare(params.password, userEncontrado.password, (err, passwordVerificado) => {
                    if (passwordVerificado) {
                        if (params.getToken === 'true') {
                            return res.status(200).send({
                                token: jwt.createToken(userEncontrado)
                            })
                        } else {
                            userEncontrado.password = undefined;
                            return res.status(200).send({ userEncontrado });
                        }
                    } else {
                        return res.status(500).send({ mensaje: "Contraseña incorrecta" });
                    }
                })
            } else {
                return res.status(500).send({ mensaje: "El usuario no esta registrado" });
            }
        })
    } else {
        return res.status(500).send({ mensaj: 'Parametro incompletos o incorrectos' });
    }
}

function editarUsuario(req, res) {
    var idUsuario = req.params.id;
    var params = req.body;

    if (!params.nombre && !params.apellido && !params.usuario) {
        return res.status(500).send({ mensaje: 'No hay ningun parametro correcto para editar' });
    }

    if (req.user.sub != idUsuario) {
        if (req.user.rol != "ROL_ADMIN")
            return res.status(500).send({ mensaje: "Solo el ADMIN o la misma puede editar el usuario" })
    }

    if (params.usuario) { params.usuario = params.usuario.toLowerCase(); }

    delete params.password;

    usuario.find({ usuario: params.usuario })
        .exec((err, usuarioEncontrado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion de usuario" });
            if (usuarioEncontrado && usuarioEncontrado.length >= 1) {
                return res.status(500).send({ mensaje: "El nombre de usuario ya existe" });
            } else {
                usuario.findOne({ _id: idUsuario }).exec((err, usuarioEncontrado) => {
                    if (err) return res.status(500).send({ mensaje: "Error en la peticion obtener la usuario, talvez no existe la usuario" });
                    if (!usuarioEncontrado) return res.status(500).send({ mensaje: "Error en la peticion, no existe el usuario" });
                    usuario.findByIdAndUpdate(idUsuario, params, { new: true }, (err, usuarioactualizada) => {
                        if (err) return res.status(500).send({ mensaje: "Error en la peticion de actualizar" })
                        if (!usuarioactualizada) return res.status(500).send({ mensaje: "No se ha podido editar al usuario" });
                        if (usuarioactualizada) {
                            return res.status(200).send({ mensaje: "Usuario editado correctamente" });
                        }
                    }
                    )
                }
                )
            }
        })
}

function eliminarUsuario(req, res) {
    var idUsuario = req.params.id;

    if (req.user.sub != idUsuario) {
        if (req.user.rol != "ROL_ADMIN")
            return res.status(500).send({ mensaje: "Solo el admin o la misma puede elimnar el publicador" })
    }

    usuario.findOne({ _id: idUsuario }).exec((err, usuarioEncontrado) => {
        if (err)
            return res.status(500).send({ mensaje: "Error en la peticion de elimnar al usuario, posiblemte datos incorrectos" });
        if (!usuarioEncontrado)
            return res.status(500).send({ mensaje: "Eror en la perticion, el usuario no existe" });
        if (usuarioEncontrado.rol === 'ROL_ADMIN') return res.status(500).send({ mensaje: 'El usuario no se puede eliminar porque es un ADMIN' })

        usuario.findByIdAndDelete(idUsuario, (err, usuarioEliminado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
            if (!usuarioEliminado) return res.status(500).send({ mensaje: "No se ha podido eliminar el usuario" });
            if (usuarioEliminado) {
                return res.status(200).send({ mensaje: "El usuario fue eliminado" });
            }
        }
        )
    })
}

function admin(res) {
    var usuarioModel = new usuario();

    usuario.findOne({ nombre: 'ADMIN' }).exec((err, adminEncontrado) => {
        if (!adminEncontrado) {
            usuarioModel.nombre = 'ADMIN';
            usuarioModel.apellido = 'ADMIN';
            usuarioModel.usuario = 'admin';
            usuarioModel.password = '123456';
            usuarioModel.rol = 'ROL_ADMIN'

            bcrypt.hash('123', null, null, (err, passwordEncriptada) => {
                usuarioModel.password = passwordEncriptada;

                usuarioModel.save((err, usuarioGuardado) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion de guardar el administrador' });
                    if (usuarioGuardado) {
                    } else {
                        res.status(404).send({ mensaje: 'No se ha podido registrar al administrador' })
                    }
                })
            })
        }
    })

}

function mostrarPublicadores(req, res) {
    
    usuario.find({ rol: "ROL_Publicador" }).exec((err, publicadores) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de obtener los publicadores' });
        if (publicadores.length === 0) return res.status(404).send({ mensaje: "No hay publicadores" });
        if (!publicadores) return res.status(404).send({ mensaje: 'No hay publicadores' });
        return res.status(200).send({ publicadores });
    })
}

function buscarPublicador(req, res) {
    var idPublicador = req.params.id;

    usuario.findOne({ _id: idPublicador }).exec((err, publicadorEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error al buscar el publicador" });
        if (!publicadorEncontrado) return res.status(404).send({ mensaje: "El publicador no existe" });
        return res.status(200).send({ publicadorEncontrado })
    })
}

module.exports = {
    registrarUsuario,
    loginUsuario,
    editarUsuario,
    eliminarUsuario,
    admin,
    mostrarPublicadores,
    buscarPublicador
}