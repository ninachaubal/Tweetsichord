var noOfChannels = 0;
var tc;

function getRandomHashTag(){
    var arr =["#beatles","#random","#dreamtheater","#music","#lolcats",
              "#tag","#funny","#something","#haiku","#xkcd"];
    
    var rnd = Math.floor(Math.random()*arr.length);
    return arr[rnd];
}

function newChannel(){
    var channels = document.getElementById('channels');
    var channel = document.createElement('div');
    channel.className = "channel";
    
    var tagInput = document.createElement('input');
    tagInput.type = "text";
    tagInput.value = getRandomHashTag();
    tagInput.id = "channel"+noOfChannels;
    tagInput.title = "enter a hashtag or username";
    
    var inst = document.createElement('select');
    inst.id = 'instrument'+noOfChannels;
    //ist.class = 'undocumented';
    for (var index in tc.instrumentList){
        inst.innerHTML += "<option value='" + tc.instrumentList[index] + 
                          "'>" +tc.instrumentList[index] + "</option>";
    }
    
    var play = document.createElement('input');
    play.type = "button";
    play.value = "play";
    play.onclick = function(){
        var tag = document.getElementById(tagInput.id);
        var instrument = document.getElementById(inst.id);
        tc.play(tag.value, instrument.value);
    };
    
    
    
    channel.appendChild(tagInput);
    channel.appendChild(inst);
    channel.appendChild(play);
    channels.appendChild(channel);
    noOfChannels++;
}

//event listeners
window.onload = function(){
    
    try{
        tc = new Tweetsichord();
    }
    catch(err){
        document.getElementById('main').innerHTML="<p>"+
        "Sorry. Your browser is not supported (yet). <br>"+ 
        "Currently Tweetsichord has been tested on Chrome and Firefox. <br/>"+
        "If you are using one of those, and you are still getting this message"+
        "please make sure you are on the latest version.</p>"
    }
    //add one channel to start with
    newChannel();
    //add a new node as required
    document.getElementById('addtag').onclick = function(){
        newChannel();
    };
    
    //stop
    document.getElementById('stop').onclick = function(){
        tc.stop();
    };
   
    //playAll
    document.getElementById('playAll').onclick = function(){
        for(var i=0; i< noOfChannels; i++){
            var input = document.getElementById('channel'+i);
            tc.play(input.value);
        }
    };
    
    //g+
    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
    po.src = 'https://apis.google.com/js/plusone.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s); 
}

