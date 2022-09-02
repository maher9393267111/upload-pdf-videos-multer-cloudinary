const router = require("express").Router();
const cloudinary = require("../utils/cloudinary");
const multer  = require('multer')
const uuid=require('uuid').v4;

const User = require("../model/user");
const unlinkAsync = require('../utils/unlinkAsync');
const fs = require('fs');
const path = require('path');

const directory = 'uploads';

const files=[];
const fileInArray=[]


const storage=multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,"uploads")
},
  filename:(req,file,cb)=>{
      let filePath=[];
      console.log("MULTER ENTRY ",file.originalname)
      console.log("files",req.files)
      
      const ext = path.extname(file.originalname);
      const id = uuid();
      filePath = `${id}${ext}`;
   //  filePath = req.file
      fileInArray.push([(filePath)])  
      console.log("IN ARRAY ",filePath)        
      files.push(fileInArray)
      console.log("PUSHED MAIN ARRAY", fileInArray)    
      cb(null,filePath)       
      console.log("current length",files.length)
  }
})



const upload=multer({
    
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "video/mp4" || file.mimetype == "application/pdf") {
        cb(null, true);
    } else {
        cb(null, false);
        return cb(new Error('Only .png, .jpg, .jpeg .mp4 and .pdf format allowed!'));
    }
},
storage:storage,
})
  

router.post("/", upload.array('uploaded_Image', 10), async (req, res) => {
  try {
 
    console.log(req.files.length)
     console.log("Files",fileInArray)
     let img;
     let vid;
     let pdff;
     console.log('fileInArray------>  🛢️ 🛢️ 🛢️' , fileInArray)
 

   for(let i=0;i<fileInArray.length;i++){
     let fileext = fileInArray[i][0].split('.')[1];
     console.log(path.resolve(__dirname, "../uploads"))
     if(fileext=='jpg' || fileext=='png' || fileext=='jpeg') {
     img = await cloudinary.uploader.upload(`${path.resolve(__dirname, "../uploads")}/${fileInArray[i][0]}`);

console.log('delete PPPPPPATHH ✅☑✅☑' ,path.resolve(__dirname, `../uploads/${fileInArray[i][0]}`))


     }
     else if(fileext=="mp4") {
     vid = await cloudinary.uploader.upload(`${path.resolve(__dirname, "../uploads")}/${fileInArray[i][0]}`,{ resource_type: "video" });
     console.log('delete PPPPPPATHH ✅☑✅☑' , path.resolve(__dirname, `../uploads/${fileInArray[i][0]}`) )
    
     }
     else if(fileext=="pdf") {

     pdff = await cloudinary.uploader.upload(`${path.resolve(__dirname, "../uploads")}/${fileInArray[i][0]}`,{ pages: true });
     console.log('delete PPPPPPATHH ✅☑✅☑'  , path.resolve(__dirname, `../uploads/${fileInArray[i][0]}`) )
   
     }
   }
 

   fs.readdir(directory, (err, files) => {
    if (err) throw err;
  
    for (const file of files) {
      console.log('uploads Files--?? 🚦' , files)
     fs.unlink(path.join(directory, file), err => {
        if (err) throw err;
      });
    }
  });




    let user = new User({
      name: req.body.name,
      avatar: img.secure_url,
      video : vid.secure_url,
      pdf : pdff.secure_url,
      cloudinary_id_img: img.public_id,
      cloudinary_id_vid: vid.public_id,
      cloudinary_id_pdf: pdff.public_id,
    });
    
    await user.save();



   




    res.json(user);
  } catch (err) {
    console.log(err);
  }
});

router.get("/", async (req, res) => {
  try {
    let user = await User.find();
    res.json(user);
  } catch (err) {
    console.log(err);
  }
});


module.exports = router;
