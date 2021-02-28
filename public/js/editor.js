window.addEventListener('load', (e) => {

    document.querySelector('#messenger').addEventListener('paste', (e) => {
        e.preventDefault();
        document.execCommand('inserttext', false, e.clipboardData.getData('text/plain'));
    });

    var commands = [
        'bold',
        'italic',
        'underline',
        'strikeThrough',
        'insertOrderedList',
        'insertUnorderedList',
        'justifyLeft',
        'justifyCenter',
        'justifyRight',
        'createLink',
        'removeFormat',
        'insertParagraph'
    ];

    commands.forEach((command) => {
        document.getElementById(command).addEventListener('click', (e) => {
            
            if (command == 'createLink') {
                var url = prompt('Enter a URL:', 'http://');
                document.execCommand('insertHTML', false, '<a href="' + url + '" target="_blank">' + url + '</a>');
            } else {
                document.execCommand(command, false, document.getSelection().toString());
            }
            
        });
    });

    document.querySelector('#face_emojis').addEventListener('change', (e) => {
        document.querySelector('#send').disabled = false;
        document.querySelector('#messenger').innerHTML += e.target.selectedOptions[0].innerHTML;
        document.querySelector('#face_emojis').value = null;
    });

    document.querySelector('#messenger').addEventListener('keyup', (e) => {
        
        e.preventDefault();

        if (e.shiftKey && e.keyCode === 13) {
            e.preventDefault();
            document.execCommand("insertParagraph", false, document.getSelection().toString());
        }

    });
    
});