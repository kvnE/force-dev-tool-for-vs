exports.buildAddRemote = function(name,username,password,url) {
  return "force-dev-tool remote add "+name+" "+username+" "+password+" -u "+url+" --default";
};

exports.buildLogin = function(remote="") {
    return "force-dev-tool login " + remote;
};

exports.buildChangeDefaultRemote = function(remote="") {
  return "force-dev-tool remote default " + remote;
};

exports.buildFetch = function(remote="") {
  return "force-dev-tool fetch " + remote;
};

exports.buildRetrieve = function(remote="") {
  return "force-dev-tool retrieve " + remote;
};

exports.buildPackageAll = function() {
  return "force-dev-tool package -a";
};

exports.buildTestAll = function(remote="") {
  return "force-dev-tool test " + remote;
};

exports.buildSOQL = function(query) {
  return 'force-dev-tool query "'+query+'"';
};

exports.buildAnonymousApex = function(code) {
  return 'echo "'+code+'" | force-dev-tool execute';
};

exports.buildTestClass = function(file, remote=""){
  return "force-dev-tool test  --classNames " + file + " " + remote; 
}

exports.buildCreateDesChangeSet = function(name, file){
  return 'echo "" | force-dev-tool changeset create ' + name + ' -f --destructive ' + file;
}

exports.buildCreateChangeSet = function(name, file){
  return 'echo "" | force-dev-tool changeset create ' + name + ' -f ' + file;
}

exports.buildCheckClass = function(file, remote=""){
  return 'echo "" | force-dev-tool changeset create tempChangeSet -f ' + file + ' && force-dev-tool deploy -d config/deployments/tempChangeSet/ -c ' + remote ;                                                         
};

exports.buildDeploy = function(file, remote=""){
  return 'echo "" | force-dev-tool changeset create tempChangeSet -f ' + file +' && force-dev-tool deploy -d config/deployments/tempChangeSet/ ' +remote;                                                         
};

exports.buildCheckUncommitted = function(){
  return 'echo "" | force-dev-tool changeset create tempChangeSet -f $(git diff --name-only | xargs printf "%04s ") && force-dev-tool deploy -d config/deployments/tempChangeSet/ -c';
}