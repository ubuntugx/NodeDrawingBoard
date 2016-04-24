var express = require('express')
  , morgan = require('morgan')
  , fs = require('fs')
  , path = require('path')
  , cv = require('opencv')
  , multipart = require('connect-multiparty');

var app = express();
// app.use([path], function) 使用中间件 function
// express.static(静态资源文件所在的根目录) express 唯一一个中间件
app.use(express.static('./public'));
// morgan 是一个 node.js 关于 http 请求的日志中间件，默认的格式是 dev
app.use(morgan('dev'));
// 在给定主机和端口上监听请求
app.listen(process.env.PORT || 3000);
console.log('Node.js Ajax Upload File running at: http://0.0.0.0:3000');
// app.post(path, callback[, callback...])
app.post('/upload', multipart(), function(req, res){
  //get filename
  var filename = req.files.files.originalFilename || path.basename(req.files.files.path);
  //copy file to a public directory
  var targetPath = path.dirname(__filename) + '/public/' + filename;
  //copy file
  console.log(req.files.files);
  fs.createReadStream(req.files.files.path).pipe(fs.createWriteStream(targetPath));

  cv.readImage(targetPath, function(err, im){
    console.log(cv.FACE_CASCADE);
    console.log(targetPath);
  im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
    for (var i=0;i<faces.length; i++){
      var x = faces[i]
      im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
    }
    im.save('./out.jpg');
  });
})
  //return file url
  res.json({code: 200, msg: {url: 'http://' + req.headers.host + '/' + filename}});
});

app.get('/env', function(req, res){
  console.log("process.env.VCAP_SERVICES: ", process.env.VCAP_SERVICES);
  console.log("process.env.DATABASE_URL: ", process.env.DATABASE_URL);
  console.log("process.env.VCAP_APPLICATION: ", process.env.VCAP_APPLICATION);
  res.json({
    code: 200
    , msg: {
      VCAP_SERVICES: process.env.VCAP_SERVICES
      , DATABASE_URL: process.env.DATABASE_URL
    }
  });
});
