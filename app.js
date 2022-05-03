'use strict'

// VARIABLES
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cors = require("cors")

// IMPORTACION DE RUTAS
var rutas = require("./src/rutas/rutas");

// MIDDLEWARES
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// APLICACION DE RUTAS
app.use('/api', rutas);
app.use(cors());

//EXPORTAR
module.exports = app;