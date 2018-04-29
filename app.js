var express = require("express");
var upload = require('express-fileupload');
var app = express();
var port = 3000;
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');
app.use(upload())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
var mongoose = require("mongoose");
const Json2csvParser = require('json2csv').Parser;
//Connect to mongodb
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/unidasPacienteCopia");
mongoose.connection.once('open', function(){
    console.log('Connection succesfull!');
    }).on('error',function(error){
        console.log('Connection error!: ',error);
    });
//create Schema
//create model
//JSON to CSV
const fields = ['nombre', 'edad', 'estadoCivil', 'hijos','telefono', 'calle', 'colonia','municipio','codigoPostal','email','llenado',
'diagnostico','fechaCirugia','avanceTratamiento','familiarNombre','recomendada','seguroMedico','medicoTratante','asistenciaPaciente',
'folio'];
const opts = { fields };
var pacientes = new mongoose.Schema({
    nombre: String,
    edad: Number,
    estadoCivil: String,
    hijos: Number,
    telefono: Number,
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
    var myData = new Paciente(req.body);
    myData.save()
        .then(item => {
            res.send("Paciente guardada");
        })
        .catch(err => {
            res.status(400).send("Error");
        });
        try {
            var json2csvParser = new Json2csvParser(opts);
            const csv = json2csvParser.parse(myData);
            var path='./public/'+'ReporteUnidasC.csv';
            fs.appendFileSync(path, csv);
            console.log(csv);
        } catch (err) {
            console.error(err);
             }
             if (req.files.ine) {
        let ine = req.files.ine;
        ine.mv("./uploadINE/" + req.body.folio + ' ' + req.body.nombre, function(err) {
                if (err) 
                    return res.status(500).send(err);
            });
        }
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