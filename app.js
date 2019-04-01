const express =require('express');
const bodyParser = require('body-parser');
var mongo = require('mongodb');
var multer  =   require('multer');
var path = require('path');


const app = express();
app.set('view engine','ejs');

app.use(bodyParser.urlencoded({ extended: false }))
app.use('/assets',express.static('assets'));
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.get('/',function(req,res){
    res.render(__dirname+'/views/home.ejs');
});

app.post('/validate',urlencodedParser,function(req,res){
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";

    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("Agriculture");
      var query = { email:req.body.email,password:req.body.password};
      if(req.body.role == "Admin"){
        dbo.collection("admin").find(query).toArray(function(err, result) {
          if (err) throw err;
          //console.log(result);
          if(result.length > 0){
              console.log("Login Successfull");
          }
          else{
            console.log("Login Failed");
          }
          db.close();
        });
      }
      else{
        dbo.collection("user").find(query).toArray(function(err, result) {
          if (err) throw err;
          if(result.length > 0){
              console.log("Login Successfull");
              res.render(__dirname+'/views/main');
          }
          else{
            console.log("Login Failed");
          }
          db.close();
        });
      }
    });
});

app.post('/upload',urlencodedParser,(req,res) => {
  upload(req,res,(err)=>{
    if(err)
    {
      res.render(__dirname+'/views/main.ejs',{
        msg:err
      });
    } else{
        if(req.file == undefined){
          res.render(__dirname+'/views/main.ejs',{
            msg:'Error: No file selected'
          });
        }
        else{
          console.log(req.file);
          res.send('test');
      }
    }
  })
});

const storage = multer.diskStorage({
  destination:'./assets/uploads/',
  filename:function (req,file,cb) {
    cb(null,file.fieldname+'-'+Date.now()+".jpg");
  }
});

const upload=multer({
  storage:storage,
  limits:{filesize:1000000},
  fileFilter:function(req,file,cb){
    checkFileType(file,cb);
  }
}).array('file',3);

function checkFileType(file,cb){
  //allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  //check ext
  const extname=filetypes.test(path.extname(file.originalname).toLowerCase());
  //check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else{
    cb("Error: Inages Only");
  }

}


app.listen(4000);
