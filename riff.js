// tone generator
// author: fand
// 2012/10/09
// license: public domain


var Riff = function(){

    this.audio = new Audio();
    this.wave = new RIFFWAVE();
    this.data = [];

    this.wave.header.sampleRate = 44100;
    this.wave.header.numChannels = 2;

    this.context = new webkitAudioContext();
    this.source = this.context.createBufferSource(); // BufferSourceNode を生成

    
    this.setWaveShape = function(name){
        switch(name){
            case "sine": break;
        }
    };

    this.setLength = function(len){
        var target_length = len * this.wave.header.sampleRate * 2;
        if(this.data.length < target_length){
            var length_before = this.data.length;
            this.data.length = target_length;
            for(var i=length_before; i<target_length; i++){
                this.data[i] = 128;
            }
        }else{
            this.data.length = target_length;
        }
    };

    this.clear = function(){
        for(var i=0; i<this.data.length; i++){
            this.data[i] = 128;
        };
    };
    
    // @param freq 周波数. [0, 10000]
    // @param pan 左右のパン. [-127, 128]
    // @param vol 音量. [0, 99](内部で[0.0,1.0]に変換)
    // @param length 長さ(sec). [0, 10000]


    this.record = function(shape,freq, pan, vol, start, end){
        var rate = this.wave.header.sampleRate;
        var num_sample = rate * length;

        var pan_l = (127 - pan) / 256.0;
        var pan_r = 1.0 - pan_l;
        var volume = vol/100.0;
        
        // t=iでの波の高さ
        var value = 0;
        var func_wave = this.getWave(shape);
        
        // 角速度(?) = (freq / sampleRate) * 2PI
        for(var i=start;i<end;i++){
            value = func_wave(freq,i, rate);
            this.data[i*2] += Math.round(127 * volume * pan_l * value); // left speakern
            this.data[i*2+1] += Math.round(127 * volume * pan_r * value); // right speaker
        }
    };


    this.getWave = function(shape){
        switch(shape){
            case "SINE": return this.sine; break;
            case "SAW": return this.saw; break;
            case "RECT": return this.rect; break;
            case "NOISE": return this.noise; break;
            default: return this.sine;
        }
    };
    
    this.sine = function(freq, i, rate){
        return Math.sin(2*Math.PI*freq*i/rate);
    };
    this.saw = function(freq, i, rate){
        // rate/freq = number of samples per T
        return (2.0/(rate/freq))*i%2.0 - 1.0;
    };
    this.rect = function(freq, i, rate){
        if(i%(rate/freq) < (rate/freq)/2){
            return 1.0;
        }else{
            return -1.0;
        }
    };
    this.noise = function(freq, i, rate){
        return Math.random();
    };

    this.play = function(){
        this.wave.Make(this.data);
        this.audio.src = this.wave.dataURI;
        this.audio.play();
    };

};



