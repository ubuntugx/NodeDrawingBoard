var content = document.getElementById("content");
var fileInput = document.getElementById("fileInput");

fileInput.addEventListener("change", uploadFile, false);

function uploadFile(){
  var formData = new FormData($("#formUploadFile")[0]);
  $.ajax({
    url: '/upload',
    type: 'POST',
    data: formData,
    async: false,
    cache: false,
    contentType: false,
    processData: false,
    success: function(data){
      if(200 === data.code) {
        var img = document.createElement('img');
        img.src = data.msg.url;
        content.appendChild(img);
      } else {
        console.log("上传失败")
      }
      console.log('imgUploader upload success, data:', data);
    },
    error: function(){
      console.log("与服务器通信发生错误");
    }
  });
}
