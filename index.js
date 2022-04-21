const mongoose = require("mongoose")
const app = require("./app")
var controladorAdmin = require("./src/Controladores/usuario.controlador");

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/dbColoniaCA', { useNewUrlParser: true , useUnifiedTopology: true }).then(()=>{
    console.log('Bienvenido!');

    controladorAdmin.admin();

    app.listen(3000, function (){
        console.log("Proyecto Fomentar el Cuidado del Medio Ambiente Corriendo");
    })
}).catch(err => console.log(err))