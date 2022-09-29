var socket = io();
var name = prompt('ニックネームを入力してください', '');
joinUser(name);

socket.on("server_to_client", function (data) {
    appendOtherMsg(data.otherMsg, data.name, data.img);
});

socket.on("server_to_client_join", function (data) {
    appendJoinMsg(data.join);
});

function appendJoinMsg(message) {
    $(".line").append('<div class="joincomment">' + message + '</div><br>');
    $('.line').animate({ scrollTop: $('.line')[0].scrollHeight }, 'fast');
}

function appendOtherMsg(message, name, img) {
    $(".line").append('<div class="others"><img src="' + img + '" class="icon"><span class="name">' + name + '</span><div class="othercomment"><p>' + message + '</p></div></div><br><br>');
    $('.line').animate({ scrollTop: $('.line')[0].scrollHeight }, 'fast');
}

function appendMyMsg(message) {
    $(".line").append('<div class="mycomment"><p>' + message + '</p></div><br>');
    $('.line').animate({ scrollTop: $('.line')[0].scrollHeight }, 'fast');
}

function message() {
    if ($("#msgForm").val() != '') {
        var message = $("#msgForm").val();
        appendMyMsg(message);
        $("#msgForm").val('');
        socket.emit("client_to_server", { message: message, name: name });
    }
}

function joinUser(name) {
    var selectRoom = 1;
    socket.emit("client_to_server_join", { room: selectRoom, name: name });
}

function upload() {
    var img = $("#upfile").val().split("\\");
    socket.emit("client_to_sever_upload", { img: './image/' + img.pop() });
}

$('#msgForm').keypress(function (e) {
    if (e.which == 13 && $("#msgForm").val() != ' ') {
        message();
        return false;
    }
});
// var messages = document.getElementById('messages');
// var form = document.getElementById('form');
// var input = document.getElementById('input');//text?

// form.addEventListener('submit', function(e) {
//   e.preventDefault();
//   if (input.value) {
//     socket.emit('chat message', input.value);
//     input.value = '';
//   }
// });

// socket.on('chat message', function(msg) {
//   var item = document.createElement('li');
//   item.textContent = msg;
//   messages.appendChild(item);
//   window.scrollTo(0, document.body.scrollHeight);
// });