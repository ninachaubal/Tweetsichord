/**
ChromaticScale class
*/
var ChromaticScale = function() {
    Scale.call(this, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
};
extend(ChromaticScale, Scale);

/**
The Instrument class provides the interface to play notes, chords, etc.
*/
var Instrument = function() {
    this.audiolet = new Audiolet();
    this.scale = new ChromaticScale();
    this.baseFreq = 16.352; // thats a C0
    this.tempo = 120;
    this.timeSigUpper = 4;
    this.timeSigLower = 4;
    this.wholeNoteTime = 2;
    this.score = [];
    this.playing = false;
    this.minOctave = 0;
    this.maxOctave = 11;
    this.callback = false;
};

Instrument.prototype.synth = function(audiolet, frequency, duration) {
    // implemented by subclasses
};
extend(Instrument.prototype.synth, AudioletGroup);

/**
Calculates the time in seconds for a whole note
*/
Instrument.prototype.calculateNoteTime = function(){
    this.wholeNoteTime = 60 * this.timeSigLower / this.tempo;
};

/**
converts a note from its normal representation to its
numerical degree that can be used by the Scale class functions
(eg. C# returns 1)
*/
Instrument.prototype.getNoteDegree = function(note, octave){   
    var degree = -1;
    
    //detect note
    if(note.indexOf('C') > -1){
        degree = 0;
    } else if(note.indexOf('D') > -1){
        degree = 2;
    } else if(note.indexOf('E') > -1){
        degree = 4;
    } else if(note.indexOf('F') > -1){
        degree = 5;
    } else if(note.indexOf('G') > -1){
        degree = 7;
    } else if(note.indexOf('A') > -1){
        degree = 9;
    } else if(note.indexOf('B') > -1){
        degree = 11;
    }
    
    //check for sharps and flats
    if(note.indexOf('#') > -1){
        degree += 1;
    } else if(note.indexOf('b') > -1){
        degree -= 1;
    }
    
    //check octave limits
    if(octave < this.minOctave){
        octave = this.minOctave;
    }
    if(octave > this.maxOctave){
        octave = this.maxOctave;
    }
    
    //adjust for the octave
    degree += (12 * octave);
    
    if(degree > -1){
        return degree;
    }
};

/**
Parses the score line by line and plays it
*/
Instrument.prototype.actuallyPlayScore = function(line){
    //check for base conditions
    if(!this.playing || line >= this.score.length){
        return;
    }
    
    var waitingTime = 0;
    //check what kind of instruction the line contains
    if(this.score[line].note){
        this.playNote(this.score[line].note,
                      this.score[line].octave,
                      this.score[line].duration);
        waitingTime = this.wholeNoteTime * this.score[line].duration;
    } else if(this.score[line].chord){
        this.playChord(this.score[line].chord,this.score[line].duration);
        waitingTime = this.wholeNoteTime * this.score[line].duration;
    } else if(this.score[line].rest){
        waitingTime = this.wholeNoteTime * this.score[line].rest;
    } else if(this.score[line].tempo){
        this.setTempo(this.score[line].tempo);
    } else if(this.score[line].timeSignature){
        this.setTimeSig(this.score[line].timeSignature);
    } 
    
    //convert waiting time to milliseconds
    waitingTime *= 1000;
    
    if(this.callback){
    	this.callback(waitingTime);
    }
       
    //go to the next line after waiting for this line to complete
    var _this = this;
    setTimeout(function() { 
    _this.actuallyPlayScore(line + 1); 
    }, waitingTime);
};

//Public functions

/**
sets Tempo
the tempo parameter is in bpm 
instrument.setTempo(120) 
*/
Instrument.prototype.setTempo = function(tempo){
    this.tempo = tempo;
    this.calculateNoteTime();
};

/**
sets time signature
instrument.setTimeSig('3/4')
*/
Instrument.prototype.setTimeSig = function(timeSig){
    var splitTimeSig = timeSig.split('/');
    this.timeSigUpper = splitTimeSig[0];
    this.timeSigLower = splitTimeSig[1];
    this.calculateNoteTime();
};

/**
plays a single note
instrument.playNote("C",4,0.5) plays a half-note C4
*/
Instrument.prototype.playNote = function(note, octave, duration){
    var degree = this.getNoteDegree(note,octave);
    var frequency = this.scale.getFrequency(degree, this.baseFreq, 0);
    var synth =  new this.synth(this.audiolet, frequency, duration);
    synth.connect(this.audiolet.output);
};

/**
plays a chord
the parameter chord is an array of notes of the form
var chord = 
[
    {"note": "C", "octave": "5"},
    {"note": "Eb", "octave": "5"},
    {"note": "G", "octave": "5"}
];
instrument.playChord(chord, 1); 
*/

Instrument.prototype.playChord = function(chord, duration){
    
    for(var index in chord){
        var note = {
            "note": chord[index].note,
            "octave": chord[index].octave,
            "duration": duration,
        }
        this.playNote(note);
    }
};

/**
plays a score.
the score is represented by a object representing an array of instructions.
for eg. 

[
    {"tempo": "120"},
    {"timeSignature": "4/4"},
    {"note": "C", "octave": "4", "duration": "0.25"},
    {"chord": 
        [
            {"note": "C", "octave": "5"},
            {"note": "Eb", "octave": "5"},
            {"note": "G", "octave": "5"}
        ],
     "duration": "1"
    }
    {"rest": "0.125"}
]

callback is a function that will be called at each line of the score
with the waiting time
*/

Instrument.prototype.playScore = function(score, callback){
    this.playing = true;
    this.score = score
    if(callback){
        this.callback = callback;
    }
    //start with the first instruction
    this.actuallyPlayScore(0);
};

/**
stops the score if it is playing
*/
Instrument.prototype.stopScore = function(){
    this.playing = false;
    this.score = {};
};

/**
returns the time (in secs) a note of the given duration lasts
*/
Instrument.prototype.getNoteTime = function(duration){
    return this.wholeNoteTime * duration;
};

///////////////////////////////////////////////////////////////////////////////
////                  The Instruments Themselves                           ////
///////////////////////////////////////////////////////////////////////////////

var Piano = function(){
    this.audiolet = new Audiolet();
    this.scale = new ChromaticScale();
    this.baseFreq = 16.352; // thats a C0
    this.tempo = 120;
    this.timeSigUpper = 4;
    this.timeSigLower = 4;
    this.wholeNoteTime = 2;
    this.score = [];
    this.playing = false;
    this.minOctave = 0;
    this.maxOctave = 8;
    this.callback = false;
};
extend(Piano,Instrument);

//override Instrument.synth to make it sound like a Piano
//Note:this is a sample implementation which fails to sound like a Piano
Piano.prototype.synth = function(audiolet, frequency, duration) {
    AudioletGroup.apply(this, [audiolet, 0, 1]);
    //Basic Wave
    this.sine = new Sine(this.audiolet, frequency);
    
    //Modulator
    this.modulator = new Saw(this.audiolet, frequency * 2);
    this.modulatorMulAdd = new MulAdd(this.audiolet, frequency / 2,
                                      frequency);

    //Gain envelope
    this.gain = new Gain(this.audiolet);
    this.envelope = new PercussiveEnvelope(this.audiolet, 1,
                                           0.2, duration,
        function() {
            this.audiolet.scheduler.addRelative(0,
                                                this.remove.bind(this));
        }.bind(this)
    );

    //Main Signal Path
    this.modulator.connect(this.modulatorMulAdd);
    this.modulatorMulAdd.connect(this.sine);

    this.envelope.connect(this.gain, 0, 1);
    this.sine.connect(this.gain);

    this.gain.connect(this.outputs[0]);
};
extend(Piano.prototype.synth, AudioletGroup);

var TestInstrument = function(){
    this.audiolet = new Audiolet();
    this.scale = new ChromaticScale();
    this.baseFreq = 16.352; // thats a C0
    this.tempo = 120;
    this.timeSigUpper = 4;
    this.timeSigLower = 4;
    this.wholeNoteTime = 2;
    this.score = [];
    this.playing = false;
    this.minOctave = 3;
    this.maxOctave = 7;
    this.callback = false;
};
extend(TestInstrument,Instrument);

//test instrument
TestInstrument.prototype.synth = function(audiolet, frequency, duration) {
    AudioletGroup.call(this, audiolet, 0, 1);
    // Basic wave
    this.saw = new Saw(audiolet, frequency, duration);

    // Gain envelope
    this.gain = new Gain(audiolet);
    this.env = new PercussiveEnvelope(audiolet, 1, 0.1, duration,
        function() {
            this.audiolet.scheduler.addRelative(0, this.remove.bind(this));
        }.bind(this)
    );
    this.envMulAdd = new MulAdd(audiolet, 0.3, 0);

    // Main signal path
    this.saw.connect(this.gain);
    this.gain.connect(this.outputs[0]);

    // Envelope
    this.env.connect(this.envMulAdd);
    this.envMulAdd.connect(this.gain, 0, 1);
};
extend(TestInstrument.prototype.synth, AudioletGroup);
