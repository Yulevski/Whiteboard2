'use strict';
//
(function() {
 
  var socket = io(); 
  var canvas = document.getElementsByClassName('whiteboard')[0];
  var colors = document.getElementsByClassName('color');
  const toolbar = document.getElementById('toolbar');
  var context = canvas.getContext('2d');
  var current = {    color: 'black'  };
  var drawing = false;
  console.log("canvasis",canvas);
  console.log("width is",canvas.width);
  let lineWidth = 10;
  //var stroke_width_picker = select('#stroke-width-picker');

  // 太さ
  //var brushsize = document.getElementsIdName('size');
  //element.addEventListener(event, function, useCapture);
  
  canvas.addEventListener('mousedown', onMouseDown, false);
  canvas.addEventListener('mouseup', onMouseUp, false);
  canvas.addEventListener('mouseout', onMouseUp, false);
  canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);
  //Touch support for mobile devices
  canvas.addEventListener('touchstart', onMouseDown, false);//線の始まり
  canvas.addEventListener('touchend', onMouseUp, false);//線の途中
  canvas.addEventListener('touchcancel', onMouseUp, false);//線の終わり
  canvas.addEventListener('touchmove', throttle(onMouseMove, 1), false);
  toolbar.addEventListener('change', e => {
    if(e.target.id === 'stroke') {
        ctx.strokeStyle = e.target.value;
    }

    if(e.target.id === 'lineWidth') {
        lineWidth = e.target.value;
    }
  
  for (var i = 0; i < colors.length; i++){
    colors[i].addEventListener('click', onColorUpdate, false);
   
    //console.log("colors is",colors);//=5 5 colors?
    //console.log("i is ",i);
    //console.log("colors[i] is",colors[i],i);
  }

  //受信した内容をondrawingeventで描画
  socket.on('drawing', onDrawingEvent);//drawing というイベントがあるとondrawingeventを発動. 受信した値を使う　'drawing'イベント検知
  //console.log("onsocket is",socket);
  //console.log("onsocketdevent is",onDrawingEvent);
  window.addEventListener('resize', onResize, false);
  onResize();
  
  // 太さ変更時
  function sizeChange(num) {
    document.getElementById("size").innerHTML = num;
    brushsize = num;
  }
  //
  function drawLine(x0, y0, x1, y1, color,lineWidth, emit){//brushsize追加
    context.beginPath();//線の始まり context = canvas.getContext('2d');
    context.moveTo(x0, y0);//move to position(x0, y0 線の座標確定
    context.lineTo(x1, y1);//Create a line to position x1, y1　線の座標確定
    //context.strokeStyle = color; //色確定
    context.strokeStyle = color;//色
    context.lineWidth = lineWidth;
    context.stroke();//draw a path
    context.closePath();
    
        if (!emit) { return; }//ブール値 emitがtrue-受信
    var w = canvas.width;
    var h = canvas.height;
    //console.log("x0is",x0);
    //console.log("wis",w);
    //console.log("width is",canvas.width);

    socket.emit('drawing', {
      
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color:  color,
      lineWidth:lineWidth

    });
    

  }
  //define starting point of line
  function onMouseDown(e){
    drawing = true;
    current.x = e.offsetX||e.touches[0].offsetX;
    current.y = e.offsetY||e.touches[0].offsetY;
    //console.log("mouse down");
    console.log("mdown current.x is",current.x);
    console.log("mdown offsetX is",e.offsetX);
    console.log("mdown offsetY is",e.offsetY);
    //console.log("mdown .touches is",e.touches);
  }

  function onMouseUp(e){
    if (!drawing) { return; }
    drawing = false;
    drawLine(current.x, current.y, e.offsetX||e.touches[0].offsetX, e.offsetY||e.touches[0].offsetY, ctx.strokeStyle,lineWidth, true);//current.color
    //function drawlineから
    //console.log("mup current.x is",current.x);
    //console.log("mup offsetX is",e.offsetX);
    //console.log("mup .touches is",e.touches);
  
  }
  //毎回x0に渡してソケット通信

  function onMouseMove(e){
    //console.log("e-1 is",e);
    if (!drawing) { return; };
  
    drawLine(current.x, current.y, e.offsetX||e.touches[0].offsetX, e.offsetY||e.touches[0].offsetY,ctx.strokeStyle,lineWidth,true);//current.color
    current.x = e.offsetX||e.touches[0].offsetX;//次の点が最初の点になる。
    current.y = e.offsetY||e.touches[0].offsetY;
    current.width = context.lineWidth;
    console.log("mmove current.x is",current.x);
    console.log("mmove offsetx is",e.offsetX);
  
  }

  function onColorUpdate(e){
    current.color = e.target.className.split(' ')[1];
    //console.log("e.target is",e.target.className.split(' '));
    //console.log(current,"current is");//色をクリックすると出る
  
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

  function onDrawingEvent(data){
    var w = canvas.width;
    var h = canvas.height;
    
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.ctx.strokeStyle,data.lineWidth);
    //drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color,data.brushsize);//true入っていない
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