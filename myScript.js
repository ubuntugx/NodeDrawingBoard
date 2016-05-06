/**
 * Created by ThinkPad on 2016/1/17.
 */
;
(function() {
        var $modalIndicator = $(".modal-indicator"); // 主菜单
        var $subMenuItem = $(".sub-menu").find(".menu-item"); // 子菜单项
        // var $fileInput = $("#fileInput");                     // 隐藏的图片上传框
        var fileInput = document.getElementById("fileInput");
        var content = document.getElementById("content");
        var imgObjArr = []; // 上传图片数组
        var startDraw = true; // 是否开始画图
        var isEraser = false;
        var array = {};


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
                        //draw();
                    }
                }
            }

            function mousemove(event) {
                mouse.x = event.clientX;
                mouse.y = event.clientY;
                draw();
            }

            function mousedown(event) {
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
                mouse.down = false;
            }
        }

        fileInput.addEventListener('change', handleFiles, false);

        $modalIndicator.fastClick(function() {
            var that = $(this);
            that.toggleClass("menu-open");
            that.siblings(".menu-open").removeClass("menu-open");
        });

        function handleFiles() {
            var file = this.files[0];
            var imageType = /^image\//;
            if (!imageType.test(file.type)) {
                return false;
            }

            var img = document.createElement('img');
            img.classList.add('theImage');
            img.file = file;
            content.appendChild(img);
            var reader = new FileReader();
            reader.onload = (function(aImg) {
                return function(e) {
                    aImg.src = e.target.result;
                };
            })(img);
            reader.readAsDataURL(file);
            $('.theImage').Jcrop({
                onSelect: showCoords
            });

            function showCoords(c) {
                array = {
                    'x1': c.x,
                    'y1': c.y,
                    'x2': c.x2,
                    'y2': c.y2,
                    'w': c.w,
                    'h': c.h
                };
            }

            var chosenBtn = document.createElement('div');
            chosenBtn.classList.add('chosenBtn');
            chosenBtn.innerHTML = '就是它了！'
            content.appendChild(chosenBtn);

            chosenBtn.addEventListener('click', function() {
                console.log(array['x1']);
                // var formData = new FormData($("#formUploadFile")[0]);
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
                    async: false,
                    cache: false,
                    contentType: false,
                    processData: false,
                    success: function(data) {
                        if (200 === data.code) {
                            var img = document.createElement('img');
                            img.src = data.msg.url;
                            img.setAttribute('class', 'theImage');
                            content.appendChild(img);
                        } else {
                            console.log("上传失败")
                        }
                        console.log('imgUploader upload success, data:', data);
                    },
                    error: function() {
                        console.log("与服务器通信发生错误");
                    }
                })
            })
          }

            $('.chosenBtn').fastClick(function() {
                console.log('enter')
            })

            $subMenuItem.fastClick(function() {
                var that = $(this); // 当前子菜单项
                var $MenuItem = that.parents(".modal-indicator"); // 当前父菜单项
                if ($MenuItem.hasClass("colors")) {
                    // 更改颜色为子菜单选中颜色
                    $MenuItem.css("background-color", that.children().css("background-color"));
                    // size 部分也可以只改变类名，不复制全部的 html
                } else if ($MenuItem.hasClass("sizes")) {
                    $MenuItem.children("div:first-child")
                        .attr("class", "")
                        .addClass(that.find("div:first-child").attr("class"))
                } else {
                    console.log("第几个元素：" + that.index());
                    var toolsIndex = that.index();
                    if (toolsIndex < 4) {
                        $MenuItem.children("div:first-child").html(that.html());
                    }
                    switch (toolsIndex) {
                        case 0:
                            // 笔
                            document.body.classList.add('pointer');
                            canvas.addEventListener("mousedown", mousedown, false);
                            canvas.addEventListener("mousemove", mousemove, false);
                            canvas.addEventListener("mouseup", mouseup, false);
                            isEraser = false;
                            startDraw = true;
                            break;
                        case 1:
                            // 橡皮
                            document.body.classList.add('pointer');
                            canvas.addEventListener("mousedown", mousedown, false);
                            canvas.addEventListener("mousemove", mousemove, false);
                            canvas.addEventListener("mouseup", mouseup, false);
                            isEraser = true;
                            startDraw = true;
                            break;
                        case 2:
                            // 文字
                            break;
                        case 3:
                            // 图片
                            document.body.classList.remove('pointer');
                            canvas.removeEventListener("mousedown", mousedown, false);
                            canvas.removeEventListener("mousemove", mousemove, false);
                            canvas.removeEventListener("mouseup", mouseup, false);
                            startDraw = false;
                            fileInput.click();
                            break;
                        case 4:
                            // 撤销
                            break;
                        case 5:
                            // 删除
                            break;
                        default:
                            break;
                    }

                }
                $MenuItem.removeClass("menu-open");
            });
        })();
