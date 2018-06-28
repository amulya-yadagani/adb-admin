var fs = require("fs");
var path = require("path");

function accountsData(req, res) {

    var filepath = "../data/groups.json";
    var options = {
        headers: {
            'Content-Type': "application/json"
        }
    }

    res.sendFile(path.join(__dirname,filepath),options);
}

function appData(req, res) {

    var filepath = "../data/applications.json";
    var options = {
        headers: {
            'Content-Type': "application/json"
        }
    }

    res.sendFile(path.join(__dirname,filepath),options);
}

function resourcesData(req, res) {

      var filepath = "../data/resource-tree.json";
      var options = {
          headers: {
              'Content-Type': "application/json"
          }
      }

      res.sendFile(path.join(__dirname,filepath),options);
  }

function rmResourceData(req, res) {
    var filepath = "../data/resources.json";
    var options = {
        headers: {
            'Content-Type': "application/json"
        }
    }

    res.sendFile(path.join(__dirname,filepath),options);
   
}

function rmResourceTypeData(req, res) {
    var filepath = "../data/resourceTypes.json";
    var options = {
        headers: {
            'Content-Type': "application/json"
        }
    }

    res.sendFile(path.join(__dirname,filepath),options);

}  

module.exports = {
    accountsData: accountsData,
    appData: appData,
    resourcesData: resourcesData,
    rmResourceData: rmResourceData,
    rmResourceTypeData: rmResourceTypeData
}
