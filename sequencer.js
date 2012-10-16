const SAMPLE_RATE = 44100;
const LENGTH_PATTERN = 32;
const ratio = 1.05946309;
const scale = {
        "IONIAN": [0,2,4,5,7,9,11,12,14,16],
        "DORIAN": [0,2,3,5,7,9,10,12,14,15],
        "PHRYGIAN": [0,1,3,5,7,8,10,12,13,15],
        "LYDIAN": [0,2,4,6,7,9,11,12,14,16],
        "MIXOLYDIAN": [0,2,4,5,7,9,10,12,14,16],
        "AEOLIAN": [0,2,3,5,7,8,10,12,14,15],
        "LOCRIAN": [0,1,3,5,6,8,10,12,13,15]
};


function Track(){
    this.shape = "SINE";
    this.pan = 0;
    this.vol = 50.0;
    this.octave = 2;
    this.pattern = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    
    this.setParam = function(i){
        var form = document.forms["wave" + i];
        this.shape = form.shape.value;
        this.pan = form.pan.value;
        this.vol = form.vol.value;
        this.octave = form.octave.value;
    };

    this.getPattern = function(){
        return this.pattern;
    };

    this.putPattern = function(time, note){
        this.pattern[time] = note;
    };
    this.removePattern = function(time){
        this.pattern[time] = 0;
    };

    this.getFreq = function(mode){
        var freq = [];
        for(var i=0; i<this.pattern.length; i++){
            if(this.pattern[i]){
                freq[i] = Math.floor(110 * Math.pow(2,this.octave) * Math.pow(ratio, scale[mode][this.pattern[i]-1]));
            }else{
                freq[i] = 0;
            }
        }
        return freq;
    };

    this.getParam = function(){
        return {
            "shape" : this.shape,
            "pan" : this.pan,
            "vol" : this.vol,
            "octave" : this.octave
        };
    };
}


var Sequencer = function(){
    this.riff = new Riff();
    this.mode = "IONIAN";
    this.bpm = 120;
    this.onka = 22050;
    this.track = [new Track(), new Track(), new Track()];

    // デモ用パターン
    this.track[0].pattern = [1,1,2,2,3,3,4,4,5,4,3,2,1,0,0,0,4,4,5,5,6,6,7,7,8,0,1,0,8,0,0,0];
    this.track[1].pattern = [10,9,8,7,9,8,7,6,8,7,6,5,1,0,3,5,1,2,3,4,5,6,7,8,10,0,9,0,8,0,0,0];
    this.track[2].pattern = [8,0,6,0,7,0,5,0,6,0,4,0,5,0,3,0,4,0,2,0,3,0,1,0,2,0,8,0,1,0,0,0];


    
    this.setParam =  function(){
        this.mode = document.control.mode.value;    
        this.bpm = document.control.bpm.value;
        this.onka = Math.floor((60.0 / (this.bpm * 4.0) * SAMPLE_RATE))// ここのfloorがないと、lrが入れ替わる
        for(var i=0; i<this.track.length; i++){
            this.track[i].setParam(i);
        }
    };
    
    this.putPattern = function(track_num, time, note){
        this.track[track_num].putPattern(time, note);
    };
    this.removePattern = function(track_num, time){
        this.track[track_num].removePattern(time);
    };
    this.getPattern = function(track_num){
        return this.track[track_num].getPattern();
    };
    
    this.synth = function(){
        for(var i=0; i<this.track.length; i++){
            var freq = this.track[i].getFreq(this.mode);
            var param = this.track[i].getParam();
            for(var j=0; j<freq.length; j++){
                if(freq[j]){
                    this.riff.record(param["shape"],
                                     freq[j],
                                     param["pan"],
                                     param["vol"],
                                     this.onka * j,
                                     this.onka * (j+1)
                                    );
                }
            }

        }
    };
/*
    //web audio API
    this.context = new webkitAudioContext();
    this.node = this.context.createJavaScriptNode(1024, 1, 2);
    var self = this;
    this.node.onaudioprocess = function(event){
        var data = event.outputBuffer.getChannelData(0);
        for(var i=0;i<data.length;i++){
            data[i] = self.data[i];
        }
    };
*/
    this.play =  function(){
        this.riff.clear();
        
        this.setParam();
        this.riff.setLength(this.onka * LENGTH_PATTERN * 2);
        this.synth();
        this.riff.play();
//        this.data = this.riff.getData();
//        this.node.connect(this.context.destination);
    };
    
};








////////////////////////////////

$(function(){
var seq = new Sequencer();

    var note = 0;
var time = 0;
var current_track = 0;

$("#track").change(function(){
    current_track = $(this).val() - 1;
    $("td").removeClass().addClass("off");

    // restore table by track pattern
    restore();
});

$("td").each(function(){
    $(this).addClass("off");
});
    
$("tr").bind("mouseenter", function(event){
    note = $(this).attr("note");
});

$("td").bind("click", function(){
    time = $(this).text();

    if($(this).hasClass("on")){
        $(this).removeClass().addClass("off");
        seq.removePattern(current_track, time);
    }else{
        seq.putPattern(current_track, time, note);
        // 同じ列でクリックされた以外のセルをonクラスをremove
        $("tr").each(function(){
            $(this).children().eq(time).removeClass().addClass("off");
        });
        $(this).removeClass().addClass("on");
    }
});

    
$("#play").bind("click", function play(){
    seq.play();
});



function restore(){
    var pattern = seq.getPattern(current_track);
    for(var i=0; i<pattern.length; i++){
        if(pattern[i]){
            $("tr").eq(10-pattern[i]).children().eq(i).removeClass().addClass("on");
        }
    }
}
    //デモ用
    restore();    
});