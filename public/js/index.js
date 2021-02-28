window.addEventListener('load', (e) => {

    var cookie = document.cookie.split('; ').filter((cook) => (/user_name=*/).test(cook))[0] || null;
    var user_name;

    if (cookie && cookie.split('=')[1]) {
        user_name = cookie.split('=')[1];
        user_name = prompt("Welcome back " + user_name + '. Please reenter your name');
    } else {
        user_name = prompt("Please enter your name");
    }

    window.grillo_chat = {
        user: user_name,
        msgs: [],
        fileList: []
    }

    document.querySelector('#messenger').focus();

    var HOST = location.origin.replace(/^http/, 'ws')
    const socket = new WebSocket(HOST);

    socket.addEventListener('open', function (e) {
        
        let msg = {
            user: user_name,
        }

        document.cookie = 'user_name=' + user_name;
        window.grillo_chat.msgs.push(msg);

        socket.send(JSON.stringify(msg));

    });

    socket.addEventListener('message', function (e) {
        
        var msg = JSON.parse(e.data.replace(': undefined', ''));
        
        window.grillo_chat.user_id = msg._id;
        
        var node = document.createElement("div");
        node.className = 'msg';
        node.innerHTML = msg.msg;

        var avatar = document.createElement("div");
        avatar.className = 'avatar';
        avatar.innerText = msg.user.concat(': ', new Date(msg.date).toLocaleTimeString());
        
        var msg_scroll = document.querySelector('#msg-container');
        
        var div = document.createElement("div");
        div.style.margin = "0 auto";
        div.style.width = '100%';
        div.style.display = 'flex';
        div.style.justifyContent = 'center';

        if (msg.files && msg.files.length) {

            msg.files.forEach((file) => {

                if ((/image*/i).test(file.type)) {
                    var image = new Image();
                    image.src = file.url;
                    image.className = 'asset-img';
                    div.append(image);
                    node.prepend(div);
                }
        
                if ((/audio*/i).test(file.type)) {
                    var audio = document.createElement("audio");
        
                    audio.src = file.url;
                    audio.controls = true;
                    audio.className = 'asset-audio';
                    
                    div.append(audio);
                    node.prepend(div);
                }
        
                if ((/video*/i).test(file.type)) {
                    
                    var video = document.createElement("video");
                    var source = document.createElement("source");
                   
                    source.src = file.url;
                    source.type = file.type;
                    video.controls = true;
                    video.autoplay = true;
                    video.className = 'asset-video';
                    video.style.width = '100%';
                    video.style.height = '500px';
        
                    video.appendChild(source);
                    div.append(video);
                    node.prepend(div);
        
                }
        
                if ((/pdf*/i).test(file.type) || (/doc*/i).test(file.type) ||  (/text*/i).test(file.type)) {
                    var iframe = document.createElement("iframe");
                    iframe.src = file.url;
                    iframe.style.width = '100%';
                    iframe.style.height = '500px';
                    iframe.className = 'asset-iframe';
                    node.prepend(iframe);
                }

            });

        }

        if (!msg.online && !msg.offline) {
            node.prepend(avatar);
        } else {
            var status = document.createElement('div');
            var style = {
                display: 'inline-block',
                width: '25px',
                height: '25px',
                borderRadius: '50%',
                marginRight: '0.5em',
            }
            Object.assign(status.style, style);
            if (msg.online) {
                status.style.background = '#00ff00';
            } else {
                status.style.background = '#ff0000';
            }
            
            style = {
                display: 'flex',
                alignItems: 'center'
            }
            Object.assign(node.style, style);
            node.prepend(status);
        }
        
        msg_scroll.appendChild(node);

        //- scroll through el overflow for latest
        msg_scroll.scrollTop = msg_scroll.scrollHeight;

    });

    document.querySelector('#file-input').addEventListener('change', (e) => {
        
        //- Assign file to prop & clear input
        var file = document.querySelector('#file-input').files[0];

        var div = document.createElement("div");
        div.innerHTML = file.name + '<br>' + file.type;
        div.className = 'file-preview';
        div.height = 50;
        div.fileName = file.name;
        var rm = document.createElement("span");
        rm.innerHTML = '✖';
        rm.className = 'remove';
        rm.addEventListener('click', rm_file_preview);
        div.prepend(rm);
        document.querySelector('form').appendChild(div);
        
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            
            var new_file = {
                type: file.type,
                url: reader.result,
                name: file.name
            };
            window.grillo_chat.fileList.push(new_file);
            document.querySelector('#file-input').value = '';
            document.querySelector('#send').disabled = false;

        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
        
    });

    document.querySelector('#messenger').addEventListener('input', (e) => {
        
        e.preventDefault();
        var messenger = document.querySelector('#messenger');

        if (messenger.innerHTML) {
            document.querySelector('#send').disabled = false;
        } else {
            document.querySelector('#send').disabled = true;
        }

    });

    document.querySelector('#messenger').addEventListener('keypress', (e) => {

        var disabled = document.querySelector('#send').disabled;

        if (e.key == 'Enter' && !e.shiftKey && !disabled) {
            e.preventDefault();
            prep_msg(messenger.innerHTML);
        }   

    });

    document.querySelector('#send').addEventListener('click', (e) => {
        
        let messenger =  document.querySelector('#messenger');

        if (messenger.innerHTML) {
            prep_msg(messenger.innerHTML);
            messenger.innerHTML = '';
        }   

    });

    function prep_msg(html) {

        var msg = {
            msg: html,
            files: window.grillo_chat.fileList || null
        }

        socket.send(JSON.stringify(msg));
        
        //-house cleaning
        window.grillo_chat.fileList = [];
        window.grillo_chat.msgs.push(msg);
        rm_all_file_previews();
        document.querySelector('#messenger').innerHTML = '';
        document.querySelector('#send').disabled = true;
    }

    function rm_file_preview(e) {
        
        e.target.parentElement.remove();
        window.grillo_chat.fileList.forEach((file, i) => {
            if (file.name === e.target.parentElement.fileName) {
                window.grillo_chat.fileList.splice(i, 1)
            }
        });

    }

    function rm_all_file_previews() {
        document.querySelectorAll('.file-preview').forEach((el) => {
            el.remove();
        });
    }

    
    
});