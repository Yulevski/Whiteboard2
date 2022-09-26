'use strict';
//
(function() {
  //class is a template for js object.
  //document=> the html file, refer to the white board in the html file.
  //The getContext() is a built-in HTML object, with properties and methods for drawing:
  var socket = io(); //console.log(io(),"io");io()を任意の変数へ格納することでSocket.ioが提供するさまざまなAPIを利用することができる
  var canvas = document.getElementsByClassName('whiteboard')[0];//Get all elements with class="whiteboard":全部でなくて1つ
  var colors = document.getElementsByClassName('color');//Get all elements with class="color":in document(html)
  var context = canvas.getContext('2d');
  var current = {    color: 'black'  };
  var drawing = false;                                  // deciding the initial state of mouse drawing 
  console.log("canvasis",canvas);
  console.log("width is",canvas.width);
  var brushsize = 10;
  //var stroke_width_picker = select('#stroke-width-picker');

  // 太さ
  //var brushsize = document.getElementsIdName('size');
  //element.addEventListener(event, function, useCapture);
  //The onmousedown event occurs when a user presses a mouse button over an element.
  canvas.addEventListener('mousedown', onMouseDown, false);//true ok
  canvas.addEventListener('mouseup', onMouseUp, false);//true ok
  canvas.addEventListener('mouseout', onMouseUp, false);//true ok
  canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);//true ok//every 10ms demonstrate theonMouseMoves
  //Touch support for mobile devices
  canvas.addEventListener('touchstart', onMouseDown, false);//true no 線の始まり
  canvas.addEventListener('touchend', onMouseUp, false);//true no　線の途中
  canvas.addEventListener('touchcancel', onMouseUp, false);//true ok　線の終わり
  canvas.addEventListener('touchmove', throttle(onMouseMove, 1), false);//true ok
  
  for (var i = 0; i < colors.length; i++){//from class=colors on the index.html?　引数の数(length)
    colors[i].addEventListener('click', onColorUpdate, false);//.addeventlistener(event, object(function), options),colorsを配列的に
        //colors[i]にクリックイベントがあるとonColourUpdateを通してcolors[i]がcurent colorになる
    //console.log("colors is",colors);//=5 5 colors?
    //console.log("i is ",i);
    //console.log("colors[i] is",colors[i],i);
  }

  //受信した内容をondrawingeventで描画
  socket.on('drawing', onDrawingEvent);//drawing というイベントがあるとondrawingeventを発動. 受信した値を使う　'drawing'イベント検知
  //console.log("onsocket is",socket);
  //console.log("onsocketdevent is",onDrawingEvent);//data定義されず
  window.addEventListener('resize', onResize, false);//.addeventlistener(event, object(function), options)
  onResize();
  
  // 太さ変更時
  function sizeChange(num) {
    document.getElementById("size").innerHTML = num;
    brushsize = num;
  }
  //
  function drawLine(x0, y0, x1, y1, color,brushsize, emit){//brushsize追加
    context.beginPath();//線の始まり context = canvas.getContext('2d');
    context.moveTo(x0, y0);//move to position(x0, y0 線の座標確定
    context.lineTo(x1, y1);//Create a line to position x1, y1　線の座標確定
    context.strokeStyle = color; //色確定
    context.lineWidth = brushsize;
    context.stroke();//draw a path
    context.closePath();
    console.log("width is",context.lineWidth);
    console.log("color is",color);

        if (!emit) { return; }//ブール値 emitがtrue-受信
    var w = canvas.width;
    var h = canvas.height;
    //console.log("x0is",x0);
    //console.log("wis",w);
   
    //console.log("width is",canvas.width);

    socket.emit('drawing', {//Socket.ioサーバへ送信
      
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color,
      brushsize:brushsize

    });
    console.log("coloris",color);
  
  }
  //define starting point of line
  function onMouseDown(e){//なぜeという引数を与える？ canvas=e?
    drawing = true;
    current.x = e.offsetX||e.touches[0].offsetX;//左辺か右辺がTrueの場合にTrueを返す,最初の点？e.offset e.以下でeの中の取り出したいものをとる
    current.y = e.offsetY||e.touches[0].offsetY;
    //console.log("mouse down");
    console.log("mdown current.x is",current.x);
    console.log("mdown offsetX is",e.offsetX);
    console.log("mdown offsetY is",e.offsetY);
    //console.log("mdown .touches is",e.touches);
  }
  //Output the coordinates of the mouse pointer when the mouse button is clicked on an element:.offsetX
  //Find out how many fingers that touches the surface: .touches
  //毎回x0に渡してソケット通信

  function onMouseUp(e){
    if (!drawing) { return; }
    drawing = false;
    drawLine(current.x, current.y, e.offsetX||e.touches[0].offsetX, e.offsetY||e.touches[0].offsetY, current.color, true);
    //function drawlineから
    //console.log("mup current.x is",current.x);
    //console.log("mup offsetX is",e.offsetX);
    //console.log("mup .touches is",e.touches);
  
  }
  //毎回x0に渡してソケット通信

  function onMouseMove(e){
    //console.log("e-1 is",e);
    if (!drawing) { return; }//線が途切れなくなる
    //console.log("mmove-1 current.x is",current.x);
    //console.log("mmove-1 offsetx is",e.offsetX);
    //console.log("mmove-1 .touches is",e.touches);
    drawLine(current.x, current.y, e.offsetX||e.touches[0].offsetX, e.offsetY||e.touches[0].offsetY, current.color,true);// pass to io, 位置だけ
    current.x = e.offsetX||e.touches[0].offsetX;//次の点が最初の点になる。
    current.y = e.offsetY||e.touches[0].offsetY;
    current.width = context.lineWidth;
    //console.log("mmove current.x is",current.x);
    //console.log("mmove offsetx is",e.offsetX);
    //console.log("e is",e);
    //console.log("mmove .touches is",e.touches);
  }
  //.drawLine(startX, startY, endX, endY);
  //毎回x0に渡してソケット通信？ｔ

  function onColorUpdate(e){//_\??どうHtmlと繋がる？
    current.color = e.target.className.split(' ')[1];//blueなど'色'をとってくる Spaceを入れるところ e=canvas
    //console.log("e.target is",e.target.className.split(' '));
    //console.log(current,"current is");//色をクリックすると出る
    //console.log("e is",e);//click { target: div.color.yellow, buttons: 0, offsetX: 235, offsetY: 29, layerX: 235, layerY: 29 }
  }
  //毎回x0に渡してソケット通信

  // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();
      //console.log("throttle is",new Date(),delay, callback,time,previousCall);//delay=10 上で定義した
    
      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
        //console.log(arguments,"are nullthrottle");
      }
    };
  }

  function onDrawingEvent(data){//browser書き込み dataはSocketの情報？
    var w = canvas.width;
    var h = canvas.height;
    
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color,data.brushsize);//true入っていない
    //console.log("data is",data,data.x0,data.x0 * w);//data定義されず
    //console.log("DL is",drawLine);
  }
    
  // make the canvas fill its parent
  function onResize() {
    canvas.width = 1000;
    canvas.height = 1000;
    //canvas.width = window.innerWidth;
    //canvas.height = window.innerHeight;
  }

})();