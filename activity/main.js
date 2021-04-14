let fs= require("fs");
let path=require("path");
let indent="";
let types = {
    media: ["mp4", "mkv","mp3"],
    archives: ['zip', '7z', 'rar', 'tar', 'gz', 'ar', 'iso', "xz"],
    documents: ['docx', 'doc', 'pdf', 'xlsx', 'xls', 'odt', 'ods', 'odp', 'odg', 'odf', 'txt', 'ps', 'tex'],
    app: ['exe', 'dmg', 'pkg', "deb"]
}

function isFileorNot(dirpath){
    return fs.lstatSync(dirpath).isFile();
}
function listContent(dirpath){
    return fs.readdirSync(dirpath);
}
function viewFlat(dirpath,toPrint){
    let isFile=isFileorNot(dirpath) 
    if(isFile==true) console.log(toPrint + "*");
    else{
        console.log(toPrint);
        let content=listContent(dirpath);
        for(let i=0;i<content.length;i++){
            let childPath=path.join(dirpath,content[i]);
            viewFlat(childPath, toPrint + "\\" + content[i])
        }

    }
}
function viewTree(dirpath, indent){
    if(isFileorNot(dirpath)) {
        let toprint=path.basename(dirpath) + "*";
        console.log(indent + toprint);
    }
    else{
        let toprint=indent + path.basename(dirpath);
        console.log(toprint);
        let content=listContent(dirpath);
        for(let i=0;i<content.length;i++){
            let childPath=path.join(dirpath,content[i]);
            viewTree(childPath, indent + "\t");
        }
    }

}
function viewFlatdriver(dirpath){
    let toPrint=path.basename(dirpath)
    viewFlat(dirpath,toPrint);
}
function organizedriver(dirpath){
    //creating main folder "organized folder"
    fs.mkdirSync(path.join(dirpath, 'organized folder'));
    //updating dirpath
    let sourcepath=path.join(dirpath,"organized folder")

    //creating sub folders 
    let subfolder=["media", "archives", "documents", "app", "others"]
    for(let i=0;i<subfolder.length;i++){
         fs.mkdirSync(path.join(sourcepath, subfolder[i]));     
    }
    //creating a structure.txt file that will store structure of our changes
    fs.open(path.join(sourcepath,"others",'structure.txt'), 'w', function (err, file) {
        if (err) throw err;
        console.log('Structure.txt file created in organized folder-->others');
    });

    let txtpath=path.join(sourcepath,"others","structure.txt");
    function organize(dirpath,indent){
        if(isFileorNot(dirpath)){
            let filename=path.basename(dirpath);
            let temparr=filename.split(".");
            let extension=temparr.pop();
            var found=false;
            for(let keys in types){
                for(let i=0;i<types[keys].length;i++){
                    if(types[keys][i]==extension) {
                        found=true;
                        let destpath=path.join(sourcepath, keys,filename);
                        fs.renameSync(dirpath, destpath)
                    }
                }
            }
            if(found==false){
                let destpath=path.join(sourcepath, "others",filename);
                fs.renameSync(dirpath, destpath)
            }
            fs.appendFileSync(txtpath, indent + filename + "*" + "\n", function (err) {
                if (err) throw err;
              });
        }
        else{
            let bname=path.basename(dirpath);
            if(bname!="organized folder") {
                fs.appendFileSync(txtpath, indent + bname + "\n", function (err) {
                    if (err) throw err;
                  });
                let subdir=listContent(dirpath);
                
                for(let i=0;i<subdir.length;i++){
                    organize(path.join(dirpath,subdir[i]),indent + "\t");
                }
                fs.rmdir(dirpath,cb);
                function cb(err){
                    if(err) console.log("Folder organized.");
                }
            }        
        }
    }
organize(dirpath,indent);

}
module.exports={
    
    viewF: viewFlatdriver,
    viewT: viewTree,
    organizeF: organizedriver
}

