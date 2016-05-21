var express = require('express')
  , morgan = require('morgan')
  , fs = require('fs')
  , path = require('path')
  , PythonShell = require('python-shell')
  , bodyParser = require('body-parser')
  , multipart = require('connect-multiparty');

var app = express();
// app.use([path], function) 使用中间件 function
// express.static(静态资源文件所在的根目录) express 唯一一个中间件
app.use(express.static('./public'));
// morgan 是一个 node.js 关于 http 请求的日志中间件，默认的格式是 dev
app.use(morgan('dev'));
// app.use(bodyParser.urlencoded({
//     extended: false
// }));
// app.use(bodyParser.json());

// 在给定主机和端口上监听请求
app.listen(process.env.PORT || 3000);
console.log('Node.js Ajax Upload File running at: http://0.0.0.0:3000');
// app.post(path, callback[, callback...])
app.post('/upload', multipart(), function(req, res){
  //get filename
  // console.log(req);

  var filename = req.files.imageFile.originalFilename || path.basename(req.files.imageFile.path);

  var args = req.body;
  // console.log(args.x1+" "+args.y1);

  //copy file to a public directory
  var handleFileName = filename.substring(filename.lastIndexOf('/'), filename.lastIndexOf('.')) + '.png';
  console.log(handleFileName);
  var targetPath = path.dirname(__filename) + '/public/uploadImages/' + handleFileName;
  console.log(targetPath);
  //copy file
  // fs.createReadStream(req.files.imageFile.path).pipe(fs.createWriteStream());
  fs.createReadStream(req.files.imageFile.path).pipe(fs.createWriteStream(targetPath));
  // console.log(imageFileName);
  var shell = new PythonShell('test.py', { mode: 'json'});
  shell.send(
    {
      "path": './public/uploadImages/'+handleFileName,
      "args": [~~args.x1, ~~args.y1, ~~args.w, ~~args.h],
      "handleFileName": handleFileName
    }
  );

  shell.on('message', function (message) {
    // 异步处理！！！
    // fs.createReadStream(req.files.files.path).pipe(fs.createWriteStream(targetPath));

    // received a message sent from the Python script (a simple "print" statement)
    console.log(message);
  });

  // end the input stream and allow the process to exit
  shell.end(function (err) {
    if (err) throw err;
    // fs.createReadStream(req.files.imageFile.path).pipe(fs.createWriteStream(targetPath));
    res.json({code: 200, msg: {url: 'http://' + req.headers.host + '/uploadImages/' + handleFileName}});
    console.log('finished');
  });

  //return file url
  // res.json({code: 200, msg: {url: targetPath}});
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
