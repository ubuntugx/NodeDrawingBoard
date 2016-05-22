/**
 * Created by ThinkPad on 2016/1/17.
 */
;(function() {
    var $modalIndicator = $(".modal-indicator"); // 主菜单
    var $subMenuItem = $(".sub-menu").find(".menu-item"); // 子菜单项
    var fileInput = document.getElementById("fileInput");
    var content = document.getElementById("content");
    var imgObjArr = []; // 上传图片数组
    var startDraw = true; // 是否开始画图
    var isEraser = false; // 橡皮
    var isTextArea = false;
    var $imagesEffect = $(".imagesEffect");  // 图片特效图标

    // canvas 部分
    var canvasWrapper = document.getElementsByClassName("canvas-wrapper")[0];
    var canvas = document.getElementById("canvas");
    var context = null;
    canvas.width = window.innerWidth; // 定义画板大小（是不是应该是减去菜单栏的大小！！！）
    canvas.height = window.innerHeight;
    var position = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    }; // 初始的画笔位置，中心
    var mouse = {
        x: 0,
        y: 0,
        down: false
    }; // 初始移动后位置 0 0
    //document.body.classList.add('pointer');             // html5 新特性，加一个类，对应 jQuery 中的 addClass

    // 记录历史
    var historyArray = new Array();
    var step = -1;
    if (canvas.getContext) {
        // 判断浏览器是否支持 canvas
        context = canvas.getContext("2d");

        canvas.addEventListener("mousedown", mousedown, false);
        canvas.addEventListener("mousemove", mousemove, false);
        canvas.addEventListener("mouseup", mouseup, false);

        //监听可视窗口尺寸
        //    window.onresize = function (event) {
        //        console.log(window.innerWidth+" "+window.innerHeight)
        //        canvas.width = window.innerWidth;
        //        canvas.height = window.innerHeight;
        //    };

        function distance(pt, pt2) {
            var xs = 0;
            var ys = 0;
            xs = pt2.x - pt.x;
            ys = pt2.y - pt.y;
            xs = xs * xs;
            ys = ys * ys;
            return Math.sqrt(xs + ys);
        }

        // 可能不需要 scroll 的偏移，元素的位置区别！！！
        var $colorItem = $(".modal-indicator.colors");
        var $chosenSvg = $(".sizes").find("svg").get(0); // 选中的画笔
        var chosenWidth = 0; // 选中的画笔大小
        var $offest = $(canvas).offset(); // canvas 偏移值
        var docScrollLeft = document.documentElement.scrollLeft;
        var docScrollTop = document.documentElement.scrollTop;
        var moveLeft = docScrollLeft - $offest.left; // 最终偏移x
        var moveTop = docScrollTop - $offest.top; // 最终偏移y

        function draw() {
            if (mouse.down) {
                var d = distance(position, mouse);
                if (d >= 1) {
                    context.beginPath();
                    context.lineCap = "round";
                    context.strokeStyle = isEraser ? '#FFF' : $colorItem.css("background-color");
                    //console.log(chosenSvg.getBoundingClientRect().width);
                    context.lineWidth = chosenWidth;
                    context.moveTo(position.x + moveLeft, position.y + moveTop);
                    context.lineTo(mouse.x + moveLeft, mouse.y + moveTop);
                    context.stroke();
                    context.closePath();
                    position.x = mouse.x;
                    position.y = mouse.y;
                }
            }
        }

        function mousemove(event) {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
            draw();
        }

        function mousedown(event) {
            console.log("enter canvas mousedown");
            mouse.down = true;
            position.x = event.clientX;
            position.y = event.clientY;
            chosenWidth = $chosenSvg.getBoundingClientRect().width;
            context.beginPath();
            context.fillStyle = $colorItem.css("background-color"); // 合并！
            context.arc(position.x + moveLeft, position.y + moveTop, chosenWidth / 2, 0, 2 * Math.PI);
            context.fill();
            context.closePath();
        }

        function mouseup() {
            // context.save();  // save 保存的是画笔当前的状态，粗细大小，和画布的旋转等，不是画的线
            historyPush();
            mouse.down = false;
        }
    }

    function historyPush() {
        step++;
        historyArray.push(canvas.toDataURL("image/png"));
        console.log(historyArray);
    }

    function undo() {
        if(historyArray.length > 0){
            step--;
            var tempImage = new Image();
            historyArray.pop();
            if(step < 0){
                context.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }
            tempImage.src = historyArray[step];
            console.log(historyArray);
            console.log(tempImage);
            console.log(canvas.width);
            // context.fillText('happy', 20, 20);
            tempImage.onload = function() {
              context.clearRect(0, 0, canvas.width, canvas.height);
              context.drawImage(tempImage, 0, 0);
            }
        }
    }

    fileInput.addEventListener('change', handleFiles, false);

    $modalIndicator.fastClick(function() {
        var that = $(this);
        that.toggleClass("menu-open");
        that.siblings(".menu-open").removeClass("menu-open");
    });

    var handleImage;
    var imageFigure;
    var array = {};  // 存储坐标数据
    var croppingBtn;
    var img;
    var imageChosenBtn;
    var imageCancelBtn;
    // 点击上传图片按钮
    function handleFiles() {
        var file = this.files[0];
        var imageType = /^image\//;
        if (!imageType.test(file.type)) {
            return false;
        }

        handleImage = document.createElement('div');
        handleImage.classList.add('handleImage');
        canvasWrapper.appendChild(handleImage);
        handleImage.addEventListener("mousedown", onMouseDown, false);
        handleImage.addEventListener("mousemove", onMouseMove, false);
        handleImage.addEventListener("mouseup", onMouseUp, false);

        imageFigure = document.createElement('figure');
        handleImage.appendChild(imageFigure);

        img = document.createElement('img');
        img.style.cursor = 'move';
        img.classList.add('theImage');
        img.file = file;
        imageFigure.appendChild(img);

        var reader = new FileReader();
        reader.onload = (function(aImg) {
            return function(e) {
                aImg.src = e.target.result;

                $imagesEffect.css("display", "block");
                $imagesEffect.find("img").attr("src", aImg.src);
            };
        })(img);
        reader.readAsDataURL(file);

        // 显示图片特效按钮
        // console.log(img.src);
        // $imagesEffect.css("display", "block");
        // // $imagesEffect.find("img").attr("src", "");
        // $imagesEffect.find("img").file = file;
        // console.log($imagesEffect.find("img").get(0).file);

        croppingBtn = document.createElement('div');
        croppingBtn.classList.add('croppingBtn');
        croppingBtn.innerHTML = '前景提取';
        handleImage.appendChild(croppingBtn);
        croppingBtn.addEventListener('click', function () {
          croppingBtnClick(file)
        }, false);

        imageChosenBtn = document.createElement('div');
        imageChosenBtn.classList.add('imageChosenBtn');
        imageChosenBtn.innerHTML = '完成';
        handleImage.appendChild(imageChosenBtn);
        imageChosenBtn.addEventListener('click', imageChosenBtnClick, false);

        imageCancelBtn = document.createElement('div');
        imageCancelBtn.classList.add('imageCancelBtn');
        imageCancelBtn.innerHTML = '取消';
        handleImage.appendChild(imageCancelBtn);
        imageCancelBtn.addEventListener('click', imageCancelBtnClick, false);
    }

    var disX = 0;
    var disY = 0;
    function onMouseDown(event) {
      console.log(this.nodeName);
      if(this.nodeName !== 'TEXTAREA'){
        console.log('enter')
        event.preventDefault();
      }
      mouse.down = true;
      position.x = event.clientX;
      position.y = event.clientY;
      disX = position.x - this.offsetLeft;    //鼠标横坐标点到div的offsetLeft距离
      disY = position.y - this.offsetTop;     //鼠标纵坐标点到div的offsetTop距离
    }

    function onMouseMove(event) {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      if(mouse.down){
        this.style.left = position.x - disX  + "px";
        this.style.top = position.y - disY  + "px";
        position.x = mouse.x;
        position.y = mouse.y;
      }
    }

    function onMouseUp(event){
      mouse.down = false;
    }

    // 点击完成按钮
    function imageChosenBtnClick(){
      // console.log(handleImage.offsetLeft);
      // console.log(imageFigure.outerHTML);
      // var data = '<svg xmlns="http://www.w3.org/2000/svg">' +
      //      '<foreignObject width="100%" height="100%">' +
      //      '<div xmlns="http://www.w3.org/1999/xhtml">' +
      //      imageFigure.outerHTML +
      //      '</div>' +
      //     '</foreignObject>' +
      //     '</svg>';
      // console.log(data);
      // var DOMURL = window.URL || window.webkitURL || window;
      // var imgCanvas = new Image();
      // var svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
      // var url = DOMURL.createObjectURL(svg);
      //
      // imgCanvas.onload = function () {
      //   context.drawImage(imgCanvas, handleImage.offsetLeft, handleImage.offsetTop);
      //   DOMURL.revokeObjectURL(url);
      // }
      //
      // imgCanvas.src = url;
      context.drawImage(img, handleImage.offsetLeft, handleImage.offsetTop);
      // rasterizeHTML.drawHTML(imageFigure.outerHTML, canvas, handleImage.offsetLeft, handleImage.offsetTop);
      // console.log(handleImage.offsetLeft);
      // rasterizeHTML.drawHTML(imageFigure.outerHTML).then(function (renderResult) {
      //   console.log(renderResult);
      //   console.log(handleImage.offsetLeft);
      //   context.drawImage(renderResult.image, handleImage.offsetLeft, handleImage.offsetTop);
      // });
      historyPush();
      canvasWrapper.removeChild(handleImage);
    }

    function imageCancelBtnClick(){
      canvasWrapper.removeChild(handleImage);
    }

    var jcrop_api;
    var chosenBtn;
    var cancelBtn;
    var textArea;
    // 点击前景提取按钮
    function croppingBtnClick(file) {
      $('.theImage').Jcrop({
            onSelect: showCoords
        },function(){
          jcrop_api = this;
        });
        handleImage.removeChild(croppingBtn);
        handleImage.removeChild(imageCancelBtn);
        handleImage.removeChild(imageChosenBtn);

        chosenBtn = document.createElement('div');
        chosenBtn.classList.add('chosenBtn');
        chosenBtn.innerHTML = '确定'
        handleImage.appendChild(chosenBtn);

        cancelBtn = document.createElement('div');
        cancelBtn.classList.add('cancelBtn');
        cancelBtn.innerHTML = '取消'
        handleImage.appendChild(cancelBtn);

        chosenBtn.addEventListener('click', function(){
          chosenBtnClick(file);
        }, false)

        cancelBtn.addEventListener('click', cancelBtnClick, false);
    }

    // 获取当前矩形框坐标
    function showCoords(c) {
        array = {
            'x1': c.x,
            'y1': c.y,
            'x2': c.x2,
            'y2': c.y2,
            'w': c.w,
            'h': c.h
        };
        console.log('x: '+ array['x1']+',y:  '+array['y1']+',width: '+ array['w'] + ',height: '+array['h']);
    }

    // 点击确认前景提取框按钮
    function chosenBtnClick(file) {
        if(array['x1']===undefined){
            alert('请先用矩形框选目标');
        }else {
          jcrop_api.destroy();

          var loadingImg = document.createElement('img');
          loadingImg.classList.add('loadingImg');
          loadingImg.src = './images/loading.gif';
          handleImage.appendChild(loadingImg);

          // var croppingBtn = document.getElementsByClassName("croppingBtn")[0];
          var formData = new FormData();
          formData.append('imageFile', file);
          // console.log($("#formUploadFile")[0].files.path);
          formData.append('x1', array['x1']);
          formData.append('y1', array['y1']);
          formData.append('x2', array['x2']);
          formData.append('y2', array['y2']);
          formData.append('w', array['w']);
          formData.append('h', array['h']);

          $.ajax({
              url: '/upload',
              type: 'POST',
              data: formData,
              async: true,
              cache: false,
              contentType: false,
              processData: false,
              success: function(data) {
                  if (200 === data.code) {
                      // var img = document.createElement('img');
                      console.log('success!');
                      handleImage.removeChild(loadingImg);
                      img.src = data.msg.url;
                      // img.setAttribute('class', 'theImage');
                      // handleImage.appendChild(img);
                      handleImage.appendChild(croppingBtn);
                      handleImage.appendChild(imageCancelBtn);
                      handleImage.appendChild(imageChosenBtn);
                      handleImage.removeChild(chosenBtn);
                      handleImage.removeChild(cancelBtn);
                  } else {
                      console.log("上传失败")
                  }
                  console.log('imgUploader upload success, data:', data);
              },
              error: function() {
                  console.log("与服务器通信发生错误");
              }
          })
        }
    }

    // 点击取消前景提取框按钮
    function cancelBtnClick(){
      console.log('enter cancelBtn')
      jcrop_api.destroy();
      handleImage.appendChild(croppingBtn);
      handleImage.appendChild(imageCancelBtn);
      handleImage.appendChild(imageChosenBtn);
      handleImage.removeChild(chosenBtn);
      handleImage.removeChild(cancelBtn);
    }

    function onKeydown(event){
      if(event.keyCode === 13){
        console.log($chosenSvg.getBoundingClientRect().width*1.2);
        event.preventDefault();
        event.returnValue = false;
        context.font = this.style.fontSize + " " + this.style.fontFamily;
        context.fillStyle = this.style.color;
        // TODO 位置 top 的计算方法不对
        context.fillText(this.value, this.offsetLeft,  this.offsetTop + $chosenSvg.getBoundingClientRect().width);

        canvasWrapper.removeChild(textArea);
        canvas.addEventListener("click", click, false);
      }
    }

    function click(){
      isTextArea = true;
      textArea = document.createElement('textarea');
      canvasWrapper.appendChild(textArea);
      textArea.classList.add("textArea");
      textArea.setAttribute("placeholder", "在这里写下文字...")
      textArea.setAttribute("rows", "1")
      textArea.setAttribute("autofocus", true);

      textArea.style.left = event.clientX - $offest.left + "px";
      textArea.style.top = event.clientY - $offest.top + "px";
      textArea.style.fontSize = $chosenSvg.getBoundingClientRect().width + "px";
      textArea.style.lineHeight = "1.2em";
      console.log(textArea.style.lineHeight)
      textArea.style.fontFamily = 'Comic Sans MS, serif';
      textArea.style.color = $colorItem.css("background-color");

      textArea.addEventListener("mousedown", onMouseDown, false);
      textArea.addEventListener("mousemove", onMouseMove, false);
      textArea.addEventListener("mouseup", onMouseUp, false);
      textArea.addEventListener("keydown", onKeydown, false);
      canvas.removeEventListener("click", click, false);
      // console.log($offest.top)
      // console.log(textArea.style.top)
    }

    var $download = $("#download");

    $download.fastClick(function(){
        this.href = canvas.toDataURL("image/png");
        this.download = 'drawingBoard.png';
    });

    $subMenuItem.fastClick(function() {
        var that = $(this); // 当前子菜单项
        var $MenuItem = that.parents(".modal-indicator"); // 当前父菜单项
        if ($MenuItem.hasClass("colors")) {
            // 更改颜色为子菜单选中颜色
            $MenuItem.css("background-color", that.children().css("background-color"));
            // size 部分也可以只改变类名，不复制全部的 html
            if(isTextArea === true){
                textArea.style.color = that.children().css("background-color");
            }
        } else if ($MenuItem.hasClass("sizes")) {
            $MenuItem.children("div:first-child")
                .attr("class", "")
                .addClass(that.find("div:first-child").attr("class"));
            if(isTextArea === true){
                textArea.style.fontSize = $chosenSvg.getBoundingClientRect().width + "px";
                // textArea.style.lineHeight = $chosenSvg.getBoundingClientRect().width + "px";
            }
        } else if($MenuItem.hasClass("lines")){
            $MenuItem.children("div:first-child").html(that.html());
        }
        // else if ($MenuItem.hasClass("imagesEffect")) {
        //     var $chosenEffect = $MenuItem.children("figure:first-child");
        //         $chosenEffect.attr("class", "")
        //                      .addClass(that.find("figure:first-child").attr("class"));
        //         imageFigure.className = "";
        //         imageFigure.classList.add($chosenEffect.attr("class"));
        // }
        else {
            console.log("第几个元素：" + that.index());
            var toolsIndex = that.index();
            if (toolsIndex < 4) {
                $MenuItem.children("div:first-child").html(that.html());
            }
            switch (toolsIndex) {
                case 0:
                    // 笔
                    document.body.classList.add('crosshair');
                    canvas.addEventListener("mousedown", mousedown, false);
                    canvas.addEventListener("mousemove", mousemove, false);
                    canvas.addEventListener("mouseup", mouseup, false);
                    canvas.removeEventListener("click", click, false);
                    isEraser = false;
                    startDraw = true;
                    isTextArea = false;
                    break;
                case 1:
                    // 橡皮
                    document.body.classList.add('crosshair');
                    canvas.addEventListener("mousedown", mousedown, false);
                    canvas.addEventListener("mousemove", mousemove, false);
                    canvas.addEventListener("mouseup", mouseup, false);
                    canvas.removeEventListener("click", click, false);
                    isEraser = true;
                    startDraw = true;
                    isTextArea = false;
                    break;
                case 2:
                    // 文字
                    document.body.classList.remove('crosshair');
                    canvas.addEventListener("click", click, false);
                    canvas.removeEventListener("mousedown", mousedown, false);
                    canvas.removeEventListener("mousemove", mousemove, false);
                    canvas.removeEventListener("mouseup", mouseup, false);
                    isEraser = false;
                    startDraw = false;
                    break;
                case 3:
                    // 图片
                    document.body.classList.remove('crosshair');
                    canvas.removeEventListener("mousedown", mousedown, false);
                    canvas.removeEventListener("mousemove", mousemove, false);
                    canvas.removeEventListener("mouseup", mouseup, false);
                    canvas.removeEventListener("click", click, false);
                    isEraser = false;
                    startDraw = false;
                    isTextArea = false;
                    fileInput.click();
                    break;
                case 4:
                    // 撤销
                    undo();
                    break;
                case 5:
                    // 删除
                    historyArray = [];
                    step = -1;
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    break;
                default:
                    break;
            }

        }
        $MenuItem.removeClass("menu-open");
    });
})();
