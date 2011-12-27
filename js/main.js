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
    
    var instrument = document.createElement('select');
    instrument.id = "instrument"+noOfChannels;
    instrument.innerHTML = getSelectInnerHTML();

    var play = document.createElement('input');
    play.type = "button";
    play.value = "play";
    play.onclick = function(){
    	setNotesArr();
        var tag = document.getElementById(tagInput.id);
        var inst =  document.getElementById(instrument.id);
        tc.play(tag.value,inst.value);
    };
    
    var stop = document.createElement('input');
    stop.type = "button";
    stop.value = "stop";
    stop.onclick = function(){
        var inst =  document.getElementById(instrument.id);
        tc.stop(inst.value);
    };
    
    channel.appendChild(tagInput);
    channel.appendChild(instrument);
    channel.appendChild(play);
    channel.appendChild(stop);
    channels.appendChild(channel);
    noOfChannels++;
}

function getSelectInnerHTML(){
    var sel = "";
    
    for(var i in tc.instrumentList){
    	sel += "<option value='" + tc.instrumentList[i] + 
    	       "'>" + tc.instrumentList[i] + "</option>";
    }
    return sel;
}

function setNotesArr(){
    var arr= [];
    if(document.getElementById('C').checked){
    	arr.push('C');
    }
    if(document.getElementById('C#').checked){
    	arr.push('C#');
    }
    if(document.getElementById('D').checked){
    	arr.push('D');
    }
    if(document.getElementById('D#').checked){
    	arr.push('D#');
    }
    if(document.getElementById('E').checked){
    	arr.push('E');
    }
    if(document.getElementById('F').checked){
    	arr.push('F');
    }
    if(document.getElementById('F#').checked){
    	arr.push('F#');
    }
    if(document.getElementById('G').checked){
    	arr.push('G');
    }
    if(document.getElementById('G#').checked){
    	arr.push('G#');
    }
    if(document.getElementById('A').checked){
    	arr.push('A');
    }
    if(document.getElementById('A#').checked){
    	arr.push('A#');
    }
    if(document.getElementById('B').checked){
    	arr.push('B');
    }
    
    tc.setNotesArray(arr);
}

//event listeners
window.onload = function(){
    
    try{
        tc = new Tweetsichord();
    }
    catch(err){
        document.getElementById('main').innerHTML="<p>"+
        "Sorry. Your browser is not supported (yet). <br/>"+ 
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
    document.getElementById('stopAll').onclick = function(){
        tc.stopAll();
    };
   
    //playAll
    document.getElementById('playAll').onclick = function(){
        for(var i=0; i< noOfChannels; i++){
            var input = document.getElementById('channel'+i);
            var inst = document.getElementById('instrument'+i);
            tc.play(input.value,inst.value);
        }
    };
    
    //g+
    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
    po.src = 'https://apis.google.com/js/plusone.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s); 
}

