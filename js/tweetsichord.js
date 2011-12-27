var Tweetsichord = function(){
    this.instrumentList = ['Treble', 'Bass']; //Placeholders till instrument.js gets real instruments
    this.instruments = [new Piano(), new Piano()];
    
    this.instruments[0].minOctave=3;
    this.instruments[0].maxOctave=5;
    this.instruments[1].minOctave=1;
    this.instruments[1].maxOctave=3;
    
    this.playing = [false, false];
    this.notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
};

Tweetsichord.prototype.setNotesArray = function(arr){

    if(arr.length <= 0){
    	return;
    }
    
    for(var i in arr){
        if(arr[i] != 'C'  && arr[i] != 'C#' && arr[i] != 'D' && 
           arr[i] != 'D#' && arr[i] != 'E'  && arr[i] != 'F' && 
           arr[i] != 'F#' && arr[i] != 'G'  && arr[i] != 'G#'&& 
           arr[i] != 'A'  && arr[i] != 'A#' && arr[i] != 'B'){
               return;
           }
    }
    
    this.notes = arr;
}

Tweetsichord.prototype.getInstrument = function(instrument){
    for(var index in this.instrumentList){
        if(this.instrumentList[index] == instrument){
            return index;
        }
    }
    return false;
};

Tweetsichord.prototype.getFeed = function (tag){
    var escapedTag = encodeURIComponent(tag);
    var response = getFromScript("http://www.tweetsichord.com/Tweetsichord/php/twitter.php?q="+ escapedTag);
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
    if(!feed[feedIndex].text.charCodeAt(charIndex)){
    	this.playFeed(feed, instrument, feedIndex, charIndex+1);
    }
    
    //get note and octave
    
    var userName = feed[feedIndex].from_user;
    var text = feed[feedIndex].text; 
    //scale userName.length (1 - 15) to a 60 - 240 range
    var tempo = (12.857142857 * (userName.length-1)) + 60;  
    this.instruments[instrument].setTempo(tempo);
    
    var chr = text.charCodeAt(charIndex);
    var octave = Math.floor(chr/this.notes.length) % 
                 (this.instruments[instrument].maxOctave - 
                 this.instruments[instrument].minOctave)+
                 this.instruments[instrument].minOctave;
    var note = this.notes[chr%this.notes.length]; 
    var waitingTime = this.instruments[instrument].getNoteTime(1);
    this.instruments[instrument].playNote(note, octave, 1);
        
    
    //convert waiting time to milliseconds
    waitingTime *= 800; //this should be 1000, but its sounding nicer if it waits a bit less...
                        //ideally set this to 1000, and make this function faster...
        
    //go to the next line after waiting for this line to complete
    var _this = this;
    setTimeout(function() { 
    _this.playFeed(feed, instrument, feedIndex, charIndex+1);
    }, waitingTime);
    
};

Tweetsichord.prototype.play = function(tag, instrument){
    var feed = this.getFeed(tag)

    var inst = this.getInstrument(instrument);
    //reset stuff
    this.instruments[inst].setTempo(120);
    this.instruments[inst].setTimeSig('4/4');
    
    this.playing[inst] = true;
    this.playFeed(feed, inst, 0, 0);
};

Tweetsichord.prototype.stop = function(instrument){
    var inst = this.getInstrument(instrument);
    this.playing[inst] = false;
};

Tweetsichord.prototype.stopAll = function(){
     for(var i in this.playing){
         this.playing[i] = false;
     }
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

