/*
Author: Kyle Marshall
Project: StructureFinder Chrome Extension
Version: 1.0
*/

'use strict'; // enable strict mode

var CACTUS_PREFIX_URL = "http://cactus.nci.nih.gov/chemical/structure/",
    PUBCHEM_PREFIX_URL = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/";

var Structure = Structure || {};

// Public method,function appends Structure object to DOM
Structure.appendNewStructure = function(cmpdName,smile,articles,patents,cids,synonyms){

  function createSynonymText(synonyms){
    var newHeader = document.createElement('h5');
    newHeader.innerHTML = "Synonyms: ";
    if (!synonyms) {
      newHeader.innerHTML += "None Found";
      return newHeader;
    }
    synonyms = (synonyms.length > 10) ? synonyms.slice(0,10) : synonyms;
    for (var i in synonyms){
      newHeader.innerHTML += synonyms[i]+", ";
    }
    return newHeader;
  }

  function createPubMedLinks(articles){
    var newDiv = document.createElement('div');
    for (var i in articles){
      var a = document.createElement('a');
      a.href = "http://www.ncbi.nlm.nih.gov/pubmed/"+articles[i];
      a.innerHTML = articles[i]+' ';
      a.setAttribute('target','_blank');
      newDiv.appendChild(a);
    }
    return newDiv;
  }
  function createPatentLinks(patents){
    var newDiv = document.createElement('div');
    for (var i in patents){
      var a = document.createElement('a');
      a.href = patents[i]['patenturl'];
      a.innerHTML = patents[i]['patentid']+' ';
      a.setAttribute('target','_blank');
      newDiv.appendChild(a);
    }
    return newDiv;
  }

  function getPubChemImage(cids){
    if (cids){
      return "https://pubchem.ncbi.nlm.nih.gov/image/imagefly.cgi?cid="+cids+"&width=250&height=250";
      //return "http://www.pharmaceutical-bioinformatics.de/cil/71/draw_molecule_by_cid/"+cid[0]+"/";
    } else {
      return "img/warning.png";
    }
  }

  var cactusImageUrl = CACTUS_PREFIX_URL + smile.encodeSmilesUri() + "/image?width=250&height=250";
  var parentEl = document.querySelector(".result-body");
  var newSection = document.createElement('section');
  var newCmpdName = document.createElement('h5');
  var cmpdTextNode = document.createTextNode('Searched Compound: '+cmpdName.toUpperCase());
  newCmpdName.appendChild(cmpdTextNode);
  var newSmiles = document.createElement('h5');
  var smilesTextNode = document.createTextNode('SMILES: '+smile);
  newSmiles.appendChild(smilesTextNode);
  var newArticles = document.createElement('h5');
  var articleTextNode = (articles) ? document.createTextNode('PubMed:') : document.createTextNode('PubMed: None Found');
  newArticles.appendChild(articleTextNode);
  var newPatents = document.createElement('h5');
  var patentTextNode = (patents) ? document.createTextNode('Patents:'): document.createTextNode('Patents: None Found');
  newPatents.appendChild(patentTextNode);
  var newImg = document.createElement('img');
  newImg.setAttribute('src',cactusImageUrl);
  newImg.onerror = function (e){
    this.src = getPubChemImage(cids);
  }
  var pubChemNode = document.createElement('h5');
  pubChemNode.innerHTML = (cids) ? "PubChem: ":"PubChem: None Found";
  if (cids){
    var pcLink = document.createElement('a');
    pcLink.innerHTML = cids;
    pcLink.href = "https://pubchem.ncbi.nlm.nih.gov/compound/"+cids;
    pcLink.setAttribute('target','_blank');
    pubChemNode.appendChild(pcLink);
  }
  newSection.appendChild(newCmpdName);
  newSection.appendChild(createSynonymText(synonyms));
  newSection.appendChild(pubChemNode);
  newSection.appendChild(newSmiles);
  newSection.appendChild(newArticles);
  if (articles) newSection.appendChild(createPubMedLinks(articles));
  newSection.appendChild(newPatents);
  if (patents) newSection.appendChild(createPatentLinks(patents));
  newSection.appendChild(newImg);
  if (parentEl.hasChildNodes()){
    parentEl.insertBefore(newSection , parentEl.firstChild)
  } else {
    parentEl.appendChild(newSection);
  }
}

// Public method,function appends error message when no smiles were returned
Structure.appendErrorMessage = function(cmpdName){
  var parentEl = document.querySelector(".result-body");
  var newSection = document.createElement('section');
  var newMessage = document.createElement('h5');
  var messageTextNode = document.createTextNode("No results found for: "+cmpdName);
  newMessage.appendChild(messageTextNode);
  var newImg = document.createElement('img');
  newImg.setAttribute('src',"img/warning.png");
  newImg.setAttribute('class','img-error-message');
  newSection.appendChild(newMessage);
  newSection.appendChild(newImg);
  if (parentEl.hasChildNodes()){
    //parentEl.insertBefore(newSection , parentEl.firstChild)
    return;
  } else {
    parentEl.appendChild(newSection);
  }
}

// Public method, removes all node elements from result-body
Structure.removeStructure = function(){
  var el = document.querySelector('.result-body');
  if (el.hasChildNodes()){
    while (el.firstChild){
      el.removeChild(el.firstChild);
    }
  }
}

Structure.getSmilesFromName = function(cmpdName){
  var url = "http://cactus.nci.nih.gov/chemical/structure/"+encodeURI(cmpdName)+"/smiles";
  var result = getSyncReq(url);
  if (result){
    return result;
  } else {
    return null;
  }
}

var PubChem = PubChem || {};

PubChem.getSmilesFromName = function(cmpdName){
  var url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/"+encodeURI(cmpdName)+"/property/CanonicalSMILES/TXT";
  var result = getSyncReq(url);
  if (result){
    return result;
  } else {
    return null;
  }
}

PubChem.getCidFromName = function(cmpdName){
  var url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/"+encodeURI(cmpdName)+"/property/CanonicalSMILES/JSON";
  var result = getSyncReq(url);
  if (result){
    var jsonResponse = JSON.parse(result);
    var cids = jsonResponse["PropertyTable"]["Properties"];
    console.dir(jsonResponse["PropertyTable"]);
    if (cids.length == 0 || cids[0] == 0){
      return null;
    } else {
      return cids[0];
    }
  } else {
    return null;
  }
}

PubChem.getCidFromSmiles = function(smiles){
  var url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/"+smiles.encodeSmilesUri()+"/cids/JSON";
  var result = getSyncReq(url);
  if (result){
    var jsonResponse = JSON.parse(result);
    var cids = jsonResponse["IdentifierList"]["CID"];
    console.log(cids);
    if (cids.length == 0 || cids[0] == 0){
      return null;
    } else {
      return cids[0];
    }
  } else {
    return null;
  }
}

PubChem.getSynonymsFromCid = function(cid){
  var url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/"+cid+"/synonyms/JSON";
  var result = getSyncReq(url);
  if (result){
    var jsonResponse = JSON.parse(result);
    var synonyms = jsonResponse["InformationList"]["Information"][0]["Synonym"];
    if (synonyms.length == 0 || synonyms[0] == 0){
      return null;
    } else{
      return synonyms;
    }
  } else {
    return null;
  }
}

PubChem.getPatentDetails = function(cid){
  var patents = [];
  var url = "https://pubchem.ncbi.nlm.nih.gov/datadicer/ddcontroller.cgi?_dc=1421875805880&cmd=query&query=%7B%22DDCompleteQuery%22%3A%7B%22queries%22%3A%5B%7B%22querytype%22%3A%22cid%22%2C%22list%22%3A%5B%22"+cid+"%22%5D%2C%22operator%22%3A%22and%22%2C%22childqueries%22%3A%5B%5D%7D%5D%2C%22columns%22%3A%5B%22cid%22%2C%22patentid%22%2C%22patenttitle%22%2C%22patentdate%22%2C%22patenturl%22%5D%7D%7D&page=1&start=0&limit=10&sort=%5B%7B%22property%22%3A%22patentdate%22%2C%22direction%22%3A%22DESC%22%7D%5D";
  var result = getSyncReq(url);
  if (result){
    try {
      // check if json response
      if (result.charAt(0) === '{'){
        var jsonResponse = JSON.parse(result);
        var patentArray = jsonResponse['DDOutput']['pages']['content'];
      } else { // else it is jsonp
        var jsonString = result.slice(result.indexOf('(') + 1, result.length - 2);
        var jsonResponse = JSON.parse(jsonString);
        var patentArray = jsonResponse['DDOutput']['pages']['content'];
      }
    } catch(err){
      console.log(err.message);
      return null;
    }
    if (patentArray.length == 0 || patentArray[0] == 0){
      return null;
    }
    patents.push.apply(patents,patentArray);
  }
  if (patents.length > 0){
    for (var j in patents){
      delete patents[j]['patentdate'];
      delete patents[j]['patenttitle'];
    }
    console.log(patents);
    return patents;
  } else{
    return null;
  }
}

PubChem.getJournalDetails = function(cid){
  var articles = [];
  var url = "https://pubchem.ncbi.nlm.nih.gov/datadicer/ddcontroller.cgi?_dc=1421875657558&cmd=query&query=%7B%22DDCompleteQuery%22%3A%7B%22queries%22%3A%5B%7B%22querytype%22%3A%22cid%22%2C%22list%22%3A%5B%22"+cid+"%22%5D%2C%22operator%22%3A%22and%22%2C%22childqueries%22%3A%5B%5D%7D%5D%2C%22columns%22%3A%5B%22pmid%22%2C%22articlepubdate%22%2C%22articletitle%22%2C%22articleabstract%22%2C%22articlejourname%22%2C%22articlejourabbr%22%5D%7D%7D&page=1&start=0&limit=10&sort=%5B%7B%22property%22%3A%22articlepubdate%22%2C%22direction%22%3A%22DESC%22%7D%5D";
  var result = getSyncReq(url);
  if (result){
    try {
      // check if json response
      if (result.charAt(0) === '{'){
        var jsonResponse = JSON.parse(result);
        var articleArray = jsonResponse['DDOutput']['pages']['content'];
      } else { // else it is jsonp
        var jsonString = result.slice(result.indexOf('(') + 1, result.length - 2);
        var jsonResponse = JSON.parse(jsonString);
        var articleArray = jsonResponse['DDOutput']['pages']['content'];
      }
    } catch(err){
      console.log(err.message);
      return null;
    }
    
    if (articleArray.length == 0 || articleArray[0] == 0){
      return null;
    }
    for (var k in articleArray){
      articles.push(articleArray[k]['pmid']);
    }
  }
  if (articles.length > 0){
    console.log(articles);
    return articles;
  } else {
    return null;
  }
}

PubChem.getPubmedCids = function(pubmedID){
  var url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/xref/PubMedID/"+pubmedID+"/cids/JSON";
  var result = getSyncReq(url);
  if (result){
    var jsonResponse = JSON.parse(result);
    var cidArray = jsonResponse["IdentifierList"]["CID"];
    console.log(cidArray);
    if (cidArray.length == 1 && cidArray[0] == 0){
      return null;
    } else {
      return cidArray;
    }
  } else {
    return null;
  }
}

var Patent = Patent || {};

Patent.getPatentFamily = function(patentID){
  function rankPatents(patArr){
    var tracker = {
                    "US": [],
                    "WO": [],
                    "EP": [],
                    "JP": [],
                    "CA": [],
                    "AU": []
                },
        other = [],
        sortedArr = [];
    for (var i in patArr){
      var type = patArr[i].slice(0,2);
      if (tracker.hasOwnProperty(type)){
        tracker[type].push(patArr[i]);
      } else{
        other.push(patArr[i]);
      }
    }
    for (var k in tracker){
      sortedArr.push.apply(sortedArr,tracker[k]);
    }
    sortedArr.push.apply(sortedArr,other);
    return sortedArr;
  }

  var sanitized = patentID.toUpperCase().replace(/\//g,'0');
  sanitized = (sanitized.charAt(sanitized.length-2) === 'A') ? sanitized.slice(0,sanitized.length-2) : sanitized;
  var url = "http://ops.epo.org/rest-services/published-data/publication/epodoc/"+sanitized+"/equivalents";
  var result = getSyncReq(url);
  if (result){
    var patentArr = [];
    var oParser = new DOMParser();
    var xmlDoc = oParser.parseFromString(result, "text/xml");
    var nList = xmlDoc.getElementsByTagName("doc-number");
    for (var i in nList){
      var patent = nList[i].innerHTML;
      if (typeof patent === 'string') patentArr.push(patent);
    }
    if (patentArr.length == 0) return [sanitized];
    return rankPatents(patentArr);
  } else {
    return [sanitized];
  }
}

// ASYNC patent family search
Patent.getPatentFamilyAsync = function(patentID, callback){
  function rankPatents(patArr){
    var tracker = {
                    "US": [],
                    "WO": [],
                    "EP": [],
                    "JP": [],
                    "CA": [],
                    "AU": []
                },
        other = [],
        sortedArr = [];
    for (var i in patArr){
      var type = patArr[i].slice(0,2);
      if (tracker.hasOwnProperty(type)){
        tracker[type].push(patArr[i]);
      } else{
        other.push(patArr[i]);
      }
    }
    for (var k in tracker){
      sortedArr.push.apply(sortedArr,tracker[k]);
    }
    sortedArr.push.apply(sortedArr,other);
    return sortedArr;
  }
  loadSpinner();
  var sanitized = patentID.toUpperCase().replace(/\//g,'0');
  sanitized = (sanitized.charAt(sanitized.length-2) === 'A') ? sanitized.slice(0,sanitized.length-2) : sanitized;
  var url = "http://ops.epo.org/rest-services/published-data/publication/epodoc/"+sanitized+"/equivalents";
  getReqPatent(url, function(req,url){
    if (req.status < 400){
      var patentArr = [];
      var oParser = new DOMParser();
      var xmlDoc = oParser.parseFromString(req.responseText, "text/xml");
      var nList = xmlDoc.getElementsByTagName("doc-number");
      for (var i in nList){
        var patent = nList[i].innerHTML;
        if (typeof patent === 'string') patentArr.push(patent);
      }
      if (patentArr.length == 0) return callback([sanitized]);
      return callback(rankPatents(patentArr));
    } else {
      throw new RequestException("Request failed for patent family search: "+req.responseText);
      callback([sanitized]);
    }
  }, function(req,url){
    Structure.appendErrorMessage(sessionStorage.getItem('fileHeader'));
    removeSpinner();
  });
}

Patent.appendNewStructure = function(cmpdName,smiles,cid){

  function getPubChemImage(cids){
    return "https://pubchem.ncbi.nlm.nih.gov/image/imagefly.cgi?cid="+cids+"&width=250&height=250";
  }
  var imageUrl = getPubChemImage(cid);
  var parentEl = document.querySelector(".result-body");
  var newSection = document.createElement('section');
  var newCmpdName = document.createElement('h5');
  var cmpdTextNode = document.createTextNode('Compound: '+cmpdName);
  newCmpdName.appendChild(cmpdTextNode);
  var newSmiles = document.createElement('h5');
  var smilesTextNode = document.createTextNode('SMILES: '+smiles);
  newSmiles.appendChild(smilesTextNode);
  var newImg = document.createElement('img');
  newImg.setAttribute('src',imageUrl);
  newImg.onerror = function (e){
    try {
      //this.src = getPubChemImage(cid);
      this.src = CACTUS_PREFIX_URL + smiles.encodeSmilesUri() + "/image?width=250&height=250";
      // this.src = "http://www.pharmaceutical-bioinformatics.de/cil/71/draw_molecule_by_cid/"+cid+"/";
    } catch(e){
      this.src = "img/warning.png";
    }
  }
  var pubChemNode = document.createElement('h5');
  pubChemNode.innerHTML = "PubChem: ";
  var pcLink = document.createElement('a');
  pcLink.innerHTML = cid;
  pcLink.href = "https://pubchem.ncbi.nlm.nih.gov/compound/"+cid;
  pcLink.setAttribute('target','_blank');
  pubChemNode.appendChild(pcLink);
  newSection.appendChild(newCmpdName);
  newSection.appendChild(newSmiles);
  newSection.appendChild(pubChemNode);
  newSection.appendChild(newImg);
  if (parentEl.hasChildNodes()){
    parentEl.insertBefore(newSection , parentEl.firstChild)
  } else {
    parentEl.appendChild(newSection);
  }
}

Patent.getPatentCids = function(patentID){
  var patentFam = Patent.getPatentFamily(patentID);
  console.log(patentFam);
  for (var i in patentFam){
    var cids = getCids(patentFam[i]);
    if (cids){
      return cids;
    }
  }
  return null;
  function getCids(patent){
    var url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/xref/PatentID/"+patent+"/cids/JSON";
    var result = getSyncReq(url);
    if (result){
      var jsonResponse = JSON.parse(result);
      var cidArray = jsonResponse["IdentifierList"]["CID"];
      console.log(cidArray);
      if (cidArray.length == 1 && cidArray[0] == 0){
        return null;
      } else {
        return cidArray;
      }
    } else {
      return null;
    }
  }
}

//ASYNC Patent search
Patent.getPatentCidsAsync = function(patentID, callback){
  Patent.getPatentFamilyAsync(patentID, function(patentArr){
    console.dir(patentArr);
    var checks = {
                'extendedPatentArr' : [],
                'lastPatent': patentArr[patentArr.length - 1]
            };
    console.log("LAST PATENT OF ARRAY: "+checks.lastPatent);
    for (var i=0; i < patentArr.length; i++){
      var url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/xref/PatentID/"+patentArr[i]+"/cids/JSON";
      getReqPatent(url, function(req,url){
        var patents = url.split('/');
        var currentPatent = patents[patents.length - 3];
        if (req.status < 400){
          var jsonResponse = JSON.parse(req.responseText);
          var cidArray = jsonResponse["IdentifierList"]["CID"];
          if (cidArray.length == 1 && cidArray[0] == 0){
            console.log('no results for '+url);
          } else {
            for (var j in cidArray){
              if (checks.extendedPatentArr.indexOf(cidArray[j]) == -1) checks.extendedPatentArr.push.apply(checks.extendedPatentArr,cidArray);
            }
          }
        } else{
            throw new RequestException("Request failed for patent url: "+url);
        }

        if (currentPatent == checks.lastPatent){
          console.log("Success callback: current patent is: "+currentPatent+" last patent is: "+checks.lastPatent);
          if (checks.extendedPatentArr.length > 0){
            callback(checks.extendedPatentArr);
          } else {
            callback(null);
          }
        }
      }, function(req,url){
        var patents = url.split('/');
        var currentPatent = patents[patents.length - 3];
        if (currentPatent == checks.lastPatent){
          console.log("Callback error: current patent is: "+currentPatent+" last patent is: "+checks.lastPatent);
          if (checks.extendedPatentArr.length > 0){
            callback(checks.extendedPatentArr);
          } else {
            callback(null);
          }
        }
      });
    }
  });
}

Patent.getDataFromCid = function(cid){
  var url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/"+cid+"/JSON";
  var result = getSyncReq(url);
  var canonSmiles,
      isoSmiles = null,
      iupac = [];

  if (result){
    var jsonResponse = JSON.parse(result);
    var dataDict = jsonResponse['PC_Compounds'][0]['props'];
    for (var i in dataDict){
      if (dataDict[i]['urn']['label'] == 'SMILES') {
        if (dataDict[i]['urn']['name'] == 'Canonical'){
          canonSmiles = dataDict[i]['value']['sval'];
        } else if (dataDict[i]['urn']['name'] == 'Isomeric'){
          isoSmiles = dataDict[i]['value']['sval'];
        }
      } else if (dataDict[i]['urn']['label'] == 'IUPAC Name'){
        iupac.push(dataDict[i]['value']['sval']);
      }
    }

    return {
            'canonSmiles': canonSmiles,
            'isoSmiles': isoSmiles,
            'iupac':iupac
              };
  } else {
    return null;
  }
}

//Async main literature search
Patent.runLitSearchBody = function(cidArr){
  if (cidArr){
    var CSV = [];
    CSV.push('SMILES,IUPAC\n');
    for (var i in cidArr){
      getReqPatent("https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/"+cidArr[i]+"/JSON",function(req,url){
        var urlArr = url.split('/');
        var cid = urlArr[urlArr.length - 2];
        if (req.status < 400){
          var canonSmiles,
              isoSmiles = null,
              iupac = [];
          var jsonResponse = JSON.parse(req.responseText);
          var dataDict = jsonResponse['PC_Compounds'][0]['props'];
          for (var i in dataDict){
            if (dataDict[i]['urn']['label'] == 'SMILES') {
              if (dataDict[i]['urn']['name'] == 'Canonical'){
                canonSmiles = dataDict[i]['value']['sval'];
              } else if (dataDict[i]['urn']['name'] == 'Isomeric'){
                isoSmiles = dataDict[i]['value']['sval'];
              }
            } else if (dataDict[i]['urn']['label'] == 'IUPAC Name'){
              iupac.push(dataDict[i]['value']['sval']);
            }
          }
          var data = {
                      'canonSmiles': canonSmiles,
                      'isoSmiles': isoSmiles,
                      'iupac':iupac
                        };
          Patent.appendNewStructure(data['iupac'][0],data['canonSmiles'],cid);
          CSV.push(data['canonSmiles']+','+'"'+data['iupac'][0]+'"\n');
          if (CSV.length === cidArr.length+1){
            removeSpinner();
            console.log("CSV should be "+(cidArr.length+1)+" lines long");
            sessionStorage.setItem('csv',CSV.join(''));
          }
        } else{
          throw new RequestException("Request failed for cid: "+cidArr[i]);
          removeSpinner();
        }
      }, function(req,url){
        var urlArr = url.split('/');
        var cid = urlArr[urlArr.length - 2];
        CSV.push('ERROR NO RESULTS FOUND FOR PUBCHEM CID'+','+cid+'\n');
        if (CSV.length === cidArr.length+1){
          removeSpinner();
          console.log("CSV should be "+(cidArr.length+1)+" lines long");
          sessionStorage.setItem('csv',CSV.join(''));
          }
      });
    }
  } else {
    Structure.appendErrorMessage(sessionStorage.getItem('fileHeader'));
    removeSpinner();
  }
}

String.prototype.encodeSmilesUri = function(){
  var self = this;
  self = self.replace(/\[/g,'%5B');
  self = self.replace(/\]/g,'%5D');
  self = self.replace(/#/g,'%23');
  self = self.replace(/\\/g,'%5C');
  return self;
}

// Exception object to handle bad HTTP request error messages
function RequestException(message){
    this.message = message;
    this.name = "RequestException";
}

// Asynchronous HTTP GET request w/ callback
function getReq(url, callback){
  var req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.addEventListener("load", function(){
    try {
      callback(req,url);
    } catch (err){
      console.error(err.name+" "+err.message);
    }
  });
  req.send(null);
}

// Asynchronous HTTP patent GET request w/ callback
function getReqPatent(url, callback, callbackerror){
  var req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.addEventListener("load", function(){
    try {
      callback(req,url);
    } catch (err){
      console.error(err.name+" "+err.message);
      callbackerror(req,url);
    }
  });
  req.send(null);
}

// Synchronous HTTP GET request w/o callback
function getSyncReq(url){
  var request = new XMLHttpRequest();
  request.open('GET',url, false);
  request.send(null);
  if (request.status === 200){
    return request.responseText;
  } else {
    return null;
  }
}

// Loading spinner code for patent search
function loadSpinner(){
  var loaderDiv = document.createElement('div');
  loaderDiv.setAttribute('class', 'loader');
  document.body.appendChild(loaderDiv);
}

// Remove spinner when results are returned
function removeSpinner(){
  var loader = document.querySelector('.loader');
  if (loader) loader.parentNode.removeChild(loader);
}

function downloadPatentFile(fileName,data){
  window.URL = window.webkitURL || window.URL;
  var contentType = 'text/csv';
  var csvFile = new Blob([data], {type: contentType});
  var a = document.getElementById('patent-download-link');
  a.download = fileName+'.csv';
  a.href = window.URL.createObjectURL(csvFile);
  a.dataset.downloadurl = [contentType, a.download, a.href].join(':');
}

//On document ready
document.addEventListener('DOMContentLoaded', function(){

  //Setup tab switching
  var tabs = document.querySelectorAll('.navigation a');
  for (var i = 0; i < tabs.length; i++){
    tabs[i].addEventListener('click', function(e){
      var currentAttrValue = e.target.getAttribute('href');
      var clickedTab = document.querySelector(currentAttrValue);
      if (clickedTab){
        clickedTab.classList.add('active');
      }
      if (currentAttrValue == '#tab1'){
        document.getElementById('tab2').classList.remove('active');
        document.getElementById('patent-tab').classList.add('inactive-tab');
        document.getElementById('compound-tab').classList.remove('inactive-tab');
      } else {
        document.getElementById('tab1').classList.remove('active');
        document.getElementById('patent-tab').classList.remove('inactive-tab');
        document.getElementById('compound-tab').classList.add('inactive-tab');
      }
    });
  }

  // Event listener for the download button click
  var downloadBtn = document.getElementById('patent-search-download');
  if (downloadBtn){
    downloadBtn.addEventListener('click', function(e){
      if (sessionStorage.getItem('csv') == null) {
          alert("Not Yet Ready For Download");
      } else{
        var fileName = sessionStorage.getItem('fileHeader');
        var fileData = sessionStorage.getItem('csv');
        downloadPatentFile(fileName,fileData);
      }
    });
  }

  // Event listener for clicking patent search button
  var patentBtn = document.getElementById('patent-search-button');
  if (patentBtn){
    patentBtn.addEventListener('click', function(){
      litSearch();
    }, false);
  }

  // Event listener for enter key press patent search
  var patentInput = document.getElementById('patent-search-input');
  if (patentInput){
    patentInput.addEventListener("keypress", function(e) {
        if (e.keyCode === 13) {
            litSearch();
            e.preventDefault();
        }
    }, false);
  }

  function litSearch(){
    Structure.removeStructure();
    var searchText = document.getElementById('patent-search-input');
    var inputValue = (arguments.length > 0) ? arguments[0] : searchText.value;
    inputValue = inputValue.replace(/ /g,'');
    sessionStorage.clear();
    sessionStorage.setItem('fileHeader',inputValue.toUpperCase());
    var regex = /^\d+$/;
    var pubmedSearch = (regex.test(inputValue)) ? true : false;
    if (pubmedSearch){
      var cidArray = PubChem.getPubmedCids(inputValue);
      Patent.runLitSearchBody(cidArray);
    } else {
      Patent.getPatentCidsAsync(inputValue, function(cidArr){
        Patent.runLitSearchBody(cidArr);
      });
    }
    searchText.value = '';
  }

  // Event listener for clicking compound search button
  var cmpdBtn = document.getElementById('compound-search-button');
  if(cmpdBtn){
    cmpdBtn.addEventListener('click',  function(e) {
            compoundSearch();
    }, false);
  }

  // Event listener for enter key press compound search
  var cmpdInput = document.getElementById('compound-search-input');
  if (cmpdInput){
    cmpdInput.addEventListener("keypress", function(e) {
        if (e.keyCode === 13) {
            compoundSearch();
            e.preventDefault();
        }
    }, false);
  }

  function compoundSearch(){
    Structure.removeStructure();
    var searchText = document.getElementById('compound-search-input');
    var inputValue = (arguments.length > 0) ? arguments[0] : searchText.value;
    // inputValue = inputValue.replace(/ /g,'');
    inputValue = inputValue.trim();
    var cactusSmiles = Structure.getSmilesFromName(inputValue);
    if (cactusSmiles){
      var cids = PubChem.getCidFromName(inputValue);
      if (!cids){
        var id = PubChem.getCidFromSmiles(cactusSmiles);
        cids = {'CID':id};
      }
      if (cids){
        var patents = PubChem.getPatentDetails(cids['CID']);
        var articles = PubChem.getJournalDetails(cids['CID']);
        var synonyms = PubChem.getSynonymsFromCid(cids['CID']);
      } else {
        var patents = null;
        var articles = null;
        var synonyms = null;
      }
      Structure.appendNewStructure(inputValue,cactusSmiles,articles,patents,cids['CID'],synonyms);
    } else {
      var pubchemCid = PubChem.getCidFromName(inputValue);
      if (pubchemCid){
        var cids = pubchemCid['CID'];
        var pubchemSmiles = pubchemCid['CanonicalSMILES'];
        if (cids){
          var patents = PubChem.getPatentDetails(cids);
          var articles = PubChem.getJournalDetails(cids);
          var synonyms = PubChem.getSynonymsFromCid(cids);
        } else {
          var patents = null;
          var articles = null;
          var synonyms = null;
        }
        Structure.appendNewStructure(inputValue,pubchemSmiles,articles,patents,cids,synonyms);
      } else {
        Structure.appendErrorMessage(inputValue);
      }
    }
    searchText.value = '';
  }

}); //End document ready
