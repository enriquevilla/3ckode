var express = require("express");
var upload = require('express-fileupload');
var app = express();
var port = 3000;
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
app.use(upload())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
var mongoose = require("mongoose");
//Connect to mongodb
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/unidascontigo");
mongoose.connection.once('open', function(){
    console.log('Connection succesful!');
    }).on('error',function(error){
        console.log('Connection error!: ',error);
    });
//create Schema
//create model
var pacientes = new mongoose.Schema({
    nombre: String,
    edad: Number,
    estadoCivil: String,
    hijos: Number,
    telefono: String,
    calle: String,
    colonia: String,
    municipio: String,
    codigoPostal: Number,
    email: String,
    llenado: String,
    diagnostico: String,
    fechaCirugia: String,
    avanceTratamiento: String,
    familiarNombre: String,
    familiarTelefono: String,
    recomendada: String,
    servicioMedico: String,
    seguroMedico: String,
    medicoTratante: String,
    asistenciaPaciente: String,
    asistenciaImagen: String,
    folio: {type: Number, unique: true}
}, {timestaps: true});

var Paciente = mongoose.model("Paciente", pacientes);
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});
app.post("/agregarPaciente", (req, res) => {
    // definir myData con todos los datos que se llenaron en la forma
    var myData = new Paciente(req.body);
    myData.save()
        .then(item => {
            res.send(req.body.nombre + " guardad@");
        })
        .catch(err => {
            res.status(400).send("Error");
        });
        try {
            // generar csv agregando los campos y datos por comando (macOS, no se si windows funcione)
            var generaCSV = 'mongoexport --db unidascontigo --collection pacientes ' +
            '--fieldFile ./excel/fields.csv --type csv --out ./excel/Reporte.csv';
            exec(generaCSV);
        } catch (err) {
            console.error(err);
        }
        // mover la foto del INE a una carpeta donde se guardan las INE
        // se define el nombre del archivo con el folio y el nombre de la persona
        if (req.files.ine) {
            let ine = req.files.ine;
            ine.mv("./uploadINE/" + req.body.folio + ' ' + req.body.nombre, function(err) {
            if (err) 
                return res.status(500).send(err);
            });
        }
        // mover la foto del comprobante a una carpeta donde se guardan los comprobantes
        // se define el nombre del archivo con el folio y el nombre de la persona
        if (req.files.comprobante) {
            let comp = req.files.comprobante;
            comp.mv("./uploadComprobante/" + req.body.folio + ' ' + req.body.nombre, function(err) {
            if (err) 
                return res.status(500).send(err);
            }); 
        }
});

app.listen(port, () => {
    console.log("Server listening on port " + port);
});