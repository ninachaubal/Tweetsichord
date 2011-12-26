var Tweetsichord = function(){
    this.instrumentList = ['Piano', 'TestInstrument'];
    this.instruments = [new Piano(), new TestInstrument()];
    this.playing = [false, false];
    this.notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
}

Tweetsichord.getInstrument = function(instrument){
    for(var index in this.instrumentList){
        if(this.instrumentList[index] == instrument){
            return index;
        }
    }
    return false;
}

Tweetsichord.prototype.getFeed = function (tag){
    var escapedTag = encodeURIComponent(tag);
    var response = getFromScript("/php/twitter.php?q="+ escapedTag);
    var responseObj = eval('('+response+')');
    return responseObj.results;
};

Tweetsichord.prototype.playFeed = function(feed, instrument, feedIndex, charIndex){
    
    if(!this.playing[instrument] || feedIndex >= feed.length){
        return;
    }
    
    if(charIndex >= feed[feedIndex].text.length){
        //go to the next line
        this.playFeed(feed, instrument, feedIndex+1, 0);
    }
    
    //get note duration and octave
    var userName = feed[feedIndex].from_user;
    var text = feed[feedIndex].text;
    
    //scale userName.length to a 60 - 240 range
    var tempo = 
    this.instruments[instrument].setTempo(tempo);
    
    var chr = text.charCodeAt(charIndex) % 
              (this.instruments[instrument].maxOctave - 
               this.instruments[instrument].minOctave);
    var octave = Math.floor(chr/this.notes.length) +
                 this.instruments[instrument].minOctave;
    var note = this.notes[chr%this.notes.length]; 
    var waitingTime = this.instruments[instrument].getNoteTime(1);
    this.instruments[instrument].playNote(note, octave, 1);
        
    
    //convert waiting time to milliseconds
    waitingTime *= 1000;
        
    //go to the next line after waiting for this line to complete
    var _this = this;
    setTimeout(function() { 
    _this..playFeed(feed, instrument, feedIndex, charIndex+1);
    }, waitingTime);
    
};

Tweetsichord.prototype.play = function(tag, instrument){
    var feed = this.getFeed(tag)
    var instrument = this.getInstrument(instrument);
    //reset stuff
    this.instruments[instrument].setTempo(120);
    this.instruments[instrument].setTimeSig('4/4');
    this.playing[instrument] = true;
    this.playFeed(feed, instrument, 0, 0);
};

Tweetsichord.prototype.stop = function(){
     this.piano.stopScore();
};

Tweetsichord.prototype.setTempo = function(tempo){
     this.piano.setTempo(tempo);
};

//AJAX stuff
//returns a XMLHttpRequest
function getXHR(){
    if (window.XMLHttpRequest){
        //for all modern browsers
        return new XMLHttpRequest();
    }
    else{
        //for IE6
        return new ActiveXObject("Microsoft.XMLHTTP");
    }
}

//does an HTTP GET on the given url (with parameters encoded)
function getFromScript(url){
    var response;
    //get the xhr and make a get request
    xhr = getXHR(); 
    xhr.open("GET",url,false);
    xhr.send();
    if(xhr.status==200){
        return xhr.responseText;
    }
}

