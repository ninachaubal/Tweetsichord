var Tweetsichord = function(){
    this.piano = new Piano();
}

Tweetsichord.prototype.getFeed = function (tag){
    var escapedTag = encodeURIComponent(tag);
    var response = getFromScript("/php/twitter.php?q="+ escapedTag);
    var responseObj = eval('('+response+')');
    return responseObj.results;
};

Tweetsichord.prototype.getNote = function(num){
    if(num == 0)
        return 'C';
    if(num == 1)
        return 'C#';
    if(num == 2)
        return 'D';
    if(num == 3)
        return 'D#';
    if(num == 4)
        return 'E';
    if(num == 5)
        return 'F';
    if(num == 6)
        return 'F#';
    if(num == 7)
        return 'G';
    if(num == 8)
        return 'G#';
    if(num == 9)
        return 'A';
    if(num == 10)
        return 'A#';
    if(num == 11)
        return 'B';
};

Tweetsichord.prototype.getScore = function(feed){
    var score = "{'tempo': '120', 'score': [";
    
    for(var index in feed){
        //get note duration and octave
        var userName = feed[index].from_user;
        var text = feed[index].text;
        
        for(var i = 0; i < text.length; i++){
            var chr = text.charCodeAt(i) % 36;
            var octave = Math.floor(chr/12) + 3;
            var note = this.getNote(chr%12);     
            score+= "{'note': '" + note + "', 'duration': '" +
                0.5 + "', 'octave': '" + octave + "'},";
        }    
    }
    score += "]}";
    
    console.log(score);
    
    return score
    
};

Tweetsichord.prototype.play = function(tag){
    var feed = this.getFeed(tag);
    var score = this.getScore(feed);
    this.piano.playScore(score);
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

function getList(){
    return instrument
}
