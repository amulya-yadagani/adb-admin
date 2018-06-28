var path = require("path");
var cors = require("cors");
var express = require("express");
var app = express();
var dataCtrl = require("./controllers/data");

app.use(cors());

app.use(function(req,res,next){
    console.log(req.method + " request from -> " + req.ip + " to url -> " + req.url);
    next();
});

app.use(express.static(path.join(__dirname,"../dist")));

app.get("/api/account",dataCtrl.accountsData);
app.get("/api/application",dataCtrl.appData);
app.get("/api/resources",dataCtrl.resourcesData);
app.get("/api/rmResources/JobTrackerTAG",dataCtrl.rmResourceData);
app.get("/api/rmResourceTypes/JobTrackerTAG",dataCtrl.rmResourceTypeData)

app.listen(5000, function(){
    console.log("Server running at port 5000");
});
