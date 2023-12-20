var wskazanie0=0;
var wskazanie1=0;
var wskazanie2=0;
var meter1;

function LightenDarkenColor(col, amt) {
    var usePound = false;
    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }
    var num = parseInt(col,16);
    var r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;
    var b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;
    var g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);  
}


// **** Class AnalogInstrument  ****
class AnalogInstrument{

  constructor(divName, settings) {

    //Default settings
    this.minVal_ = 0;
    this.maxVal_ = 100;
    this.angleMin_ = -120;
    this.angleMax_ = 120;
    this.unit_ = "Unit";
    this.type_ = "squer";
    
    this.range1_min_ = 0;
    this.range1_max_ = 0;
    this.range1_color_ = "#ffd34e";
    this.range2_min_ = 0;
    this.range2_max_ = 0;
    this.range2_color_ = "#43a047";
    this.range3_min_ = 0;
    this.range3_max_ = 0;
    this.range3_color_ = "#fa4a0f";

    this.pointer_count_ = 1;
    this.dialLineStep_ = 1;
    this.dialNumbersStep_ = 10;
    this.dd_ = 1;
    
    this.divDIGs_ = new Array();
    this.array_pointers_ = new Array();
    this.array_lastRotation_ = new Array(0, 0, 0);
    this.array_valPrefix_ = new Array("", "", "");
    
    //                             L1 yelow   L2 green   L3 violet
    this.array_colors_ = new Array("#ada803", "#03ad11", "#9103ad");
    
    if (typeof settings !== 'undefined'){
      if (typeof settings.minVal   !== 'undefined') this.minVal_   = settings.minVal;
      if (typeof settings.maxVal   !== 'undefined') this.maxVal_   = settings.maxVal;
      if (typeof settings.angleMin !== 'undefined') this.angleMin_ = settings.angleMin;
      if (typeof settings.angleMax !== 'undefined') this.angleMax_ = settings.angleMax;
      if (typeof settings.angleMax !== 'undefined') this.angleMax_ = settings.angleMax;
      if (typeof settings.unit     !== 'undefined') this.unit_     = settings.unit;
      if (typeof settings.type     !== 'undefined') this.type_     = settings.type;
      if (typeof settings.dd       !== 'undefined') this.dd_       = settings.dd;

      if (typeof settings.range1_min   !== 'undefined') this.range1_min_   = settings.range1_min;
      if (typeof settings.range1_max   !== 'undefined') this.range1_max_   = settings.range1_max;
      if (typeof settings.range1_color !== 'undefined') this.range1_color_ = settings.range1_color;
      
      if (typeof settings.range2_min   !== 'undefined') this.range2_min_   = settings.range2_min;
      if (typeof settings.range2_max   !== 'undefined') this.range2_max_   = settings.range2_max;
      if (typeof settings.range2_color !== 'undefined') this.range2_color_ = settings.range2_color;
      
      if (typeof settings.range3_min   !== 'undefined') this.range3_min_   = settings.range3_min;
      if (typeof settings.range3_max   !== 'undefined') this.range3_max_   = settings.range3_max;      
      if (typeof settings.range3_color !== 'undefined') this.range3_color_ = settings.range3_color;

      if (typeof settings.pointer0_color !== 'undefined') this.array_colors_[0] = settings.pointer0_color;
      if (typeof settings.pointer1_color !== 'undefined') this.array_colors_[1] = settings.pointer1_color;
      if (typeof settings.pointer2_color !== 'undefined') this.array_colors_[2] = settings.pointer2_color;

      if (typeof settings.pointer_count   !== 'undefined') this.pointer_count_   = settings.pointer_count;
      if (typeof settings.dialLineStep    !== 'undefined') this.dialLineStep_    = settings.dialLineStep;
      if (typeof settings.dialNumbersStep !== 'undefined') this.dialNumbersStep_ = settings.dialNumbersStep;

      if (typeof settings.valPrefix0 !== 'undefined') this.array_valPrefix_[0] = settings.valPrefix0;
      if (typeof settings.valPrefix1 !== 'undefined') this.array_valPrefix_[1] = settings.valPrefix1;
      if (typeof settings.valPrefix2 !== 'undefined') this.array_valPrefix_[2] = settings.valPrefix2;
    }

    this.t_ = (this.type_ == "squer"); //is squer type?
    if (this.t_){                      //Set angle range
      this.angleMin_= -90;
      this.angleMax_= 0;
    }

    if (this.pointer_count_ == 1)        //Is is only 1 pointer than
      this.array_colors_[0] = "#000000"; //set default black pointer.
    
    if ( (this.pointer_count_ > 3) || (this.pointer_count_ < 1)) //Max of pointers is 3
      this.pointer_count_=1;

    //Create graphics elemets
    
    //HTML div
    this.divName = document.getElementById(divName);
    if (!this.divName){
      throw new Error('div id: "'+divName+'" is not exiests!');
    }
    this.divName.classList.add("meterFrame");
    if (this.t_ == false) this.divName.classList.add("meterRound");

    //divMain
    this.divMain = document.createElement("div");
    this.divMain.classList.add("meterMain");
    if (this.t_ == false) this.divMain.classList.add("meterRound");
    this.divName.appendChild(this.divMain);

    //Dial with scale
    this.divMeterScale = document.createElement("canvas");
    this.divMeterScale.classList.add("meterCanvas");
    this.divMeterScale.width = this.divMain.clientWidth;
    this.divMeterScale.height = this.divMain.clientHeight;
    this.divMain.appendChild(this.divMeterScale);

    //Unit
    this.divUnit = document.createElement("div");
    this.divUnit.classList.add("meterUnit");
    this.divUnit.style.fontSize= (this.divMain.clientWidth/10)+"px";
    if (this.t_ == false) this.divUnit.classList.add("meterUnitR");
    this.divUnit.innerHTML = this.unit_;
    this.divMain.appendChild(this.divUnit);

    //Pointers
    for (var i = 0; i < this.pointer_count_; i++) {
      var divPointer = document.createElement("div");

      let opacity = "77";
      if (this.t_ == false){
        divPointer.classList.add("meterPointerR"+i);
      }
      else
        divPointer.classList.add("meterPointerS"+i);

      let color2 = LightenDarkenColor(this.array_colors_[i], 80);
      
      divPointer.innerHTML = 
        '<svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 45 4">'+
      //                             1    2    3    4
      /*1A*/     '<polygon points=" 7,0 13,0 13,2  0,2" style="fill:' + color2 + ';"/>'+
      /*1B*/     '<polygon points=" 0,2 13,2 13,4  7,4" style="fill:' + this.array_colors_[i] + ';"/>'+        
  
      /*2A*/     '<polygon points="13,0 30,0 30,2 13,2" style="fill:' + color2 + opacity+ ';"/>'+
      /*2B*/     '<polygon points="13,2 30,2 30,4 13,4" style="fill:' + this.array_colors_[i]+ opacity + ';"/>'+
  
      /*3A*/     '<polygon points=" 30,0 45,0 45,2 30,2" style="fill:' + color2 + ';"/>'+
      /*3B*/     '<polygon points=" 30,2 45,2 45,4 30,4" style="fill:' + this.array_colors_[i] + ';"/>'+   
         '</svg>';

      /*  Pointer svg
         1 /------------+2  1+-------------+2  1+-------------+2
          /      1A     |    |     2A      |    |     3A      |
       4 +--------------+3  4+-------------+3  4+-------------+3
       1 +--------------+2  1+-------------+2  1+-------------+2
          \      1B     |    |     2B      |    |     3B      |
         4 \------------+3  4+-------------+3  4+-------------+3
      */
      this.divMain.appendChild(divPointer);
      this.array_pointers_.push(divPointer);
    }

    //Cover at end of pointers
    let divPrzykrywka = document.createElement("div");
    divPrzykrywka.classList.add("divPrzykrywka");
    if (this.t_ == false) divPrzykrywka.classList.add("divPrzykrywkaR");
    this.divMain.appendChild(divPrzykrywka);
    

    //Digital values
    for (var i = 0; i < this.pointer_count_; i++){
      this.divDIGs_[i] = document.createElement("div");
      this.divDIGs_[i].classList.add("meterDIG"+i);
      this.divDIGs_[i].style.background = LightenDarkenColor(this.array_colors_[i], 150);
      this.divDIGs_[i].style.fontSize= (this.divMain.clientWidth/15)+"px";
      if (this.t_ == false) this.divDIGs_[i].classList.add("meterDIGR");
      this.divMain.appendChild(this.divDIGs_[i]);
    }

    
    //Drawing scale
    this.skala();


    //Set pointer at 0
    for (var i = 0; i < this.pointer_count_; i++)
       this.setValue(0, i);
  }



  
  // ***** Draw norm *****  
  rangeValDraw(ctx, min_, max_, color){

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = ctx.canvas.height/70;
     
    let s1 = this.angleMin_ + ((this.angleMax_ - this.angleMin_)/( this.maxVal_ - this.minVal_)) * (min_ - this.minVal_);
    let s2 = this.angleMin_ + ((this.angleMax_ - this.angleMin_)/( this.maxVal_ - this.minVal_)) * (max_ - this.minVal_);
    
    let w = Math.PI*2; //360deg
    let r = (w * (s1-90))/360;
    let q = (w * (s2-90))/360;


    //drawing arc on the scale
    if (this.t_ == false){ //Round
      
      ctx.arc(
        ctx.canvas.width/2,
        ctx.canvas.height/2,
        ctx.canvas.height/2 * 0.73, //Shift <-> from dial
        r,
        q);
      
    } else { //Squer

      ctx.arc(
        ctx.canvas.width*0.95,
        ctx.canvas.height*0.95,
        ctx.canvas.height*0.71, //Shift <-> from dial
        r,
        q);
      
    }
 
    ctx.stroke();
  } 



  
  // ***** Create dial with scale *****
  skala(){

    //Draw norm
    var ctx = this.divMeterScale.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.rangeValDraw(ctx, this.range1_min_, this.range1_max_, this.range1_color_);
    this.rangeValDraw(ctx, this.range2_min_, this.range2_max_, this.range2_color_);
    this.rangeValDraw(ctx, this.range3_min_, this.range3_max_, this.range3_color_);


    //Draw a scaled line
    let L = this.dialNumbersStep_;
    let x = 0;
    
    for (var i = this.minVal_; i <= this.maxVal_; i+=this.dialLineStep_)
    {
      //Calculation of the rotation angle
      let sec_rotation = this.angleMin_
         + ((this.angleMax_ - this.angleMin_)/( this.maxVal_ - this.minVal_))
         * (i - this.minVal_);

      var dialDigits = document.createElement("div");
      dialDigits.classList.add("dialDiv");

      dialDigits.innerHTML = '<div class="dialline"></div>';
      if (L >= this.dialNumbersStep_){ 
        L=0;      
        dialDigits.innerHTML = '<div class="dialline diallineL"></div><div class="digit">'+(i/this.dd_)+'</div>';
        dialDigits.children[1].style.transform = `rotate(${-sec_rotation-90}deg)`;
      } else 
        dialDigits.innerHTML = '<div class="dialline"></div>';
        
      if (this.t_ == false) dialDigits.classList.add("dialDivR");  //ORound
          
      dialDigits.style.transform = `rotate(${sec_rotation+90}deg)`;         
      this.divMain.appendChild(dialDigits);
      dialDigits.style.fontSize = (dialDigits.clientHeight)+"px";
      L+=this.dialLineStep_;
    }
    
  }




  // ***** Setting the indicator based on the value *****
  setValue(val, index){
    
    //console.log("val:" + val + " index:" + index);
    if (typeof index == 'undefined') index=0;
    if ( (index >= this.pointer_count_) || index < 0 ) return;
    
    let valLim = val;
    if (valLim < (this.minVal_)) valLim = this.minVal_;
    if (valLim > this.maxVal_*1.03) valLim = this.maxVal_*1.03;

    let sec_rotation = 90 + this.angleMin_ 
      + ((this.angleMax_ - this.angleMin_)/( this.maxVal_ - this.minVal_))
      * (valLim - this.minVal_);

    let timing_options = {
            duration: 2000,
            iterations: 1,
            easing: "cubic-bezier(.21,.06,0,1.1)"};
      
    if (this.t_ == false) { //Round

      this.array_pointers_[index].style.transform = `rotate(${sec_rotation}deg)`;
      this.array_pointers_[index].animate( //Pointer animation
          [ // keyframes
            { transform: `rotate(${this.array_lastRotation_[index]}deg`},
            { transform: `rotate(${sec_rotation}deg` }
          ], timing_options
       );    

    } else { //Squre
      
       let p = 0.445; 
       this.array_pointers_[index].style.transform = `translate(${this.divMain.clientWidth*p}px) rotate(${sec_rotation}deg)`;
       this.array_pointers_[index].animate(
          [ // keyframes
            { transform: `translate(${this.divMain.clientWidth*p}px) rotate(${this.array_lastRotation_[index]}deg`},
            { transform: `translate(${this.divMain.clientWidth*p}px) rotate(${sec_rotation}deg` }
          ], timing_options
       );
      
    }
    val= val / this.dd_;
    this.divDIGs_[index].innerHTML = this.array_valPrefix_[index] +  val.toFixed(1);
    this.array_lastRotation_[index]=sec_rotation;
  }





  // ***** Dynamic settngs *****
  
  //Minimal value
  set minVal(value){
    this.minVal_ = value;
    this.setVal(this.val);
    this.skala();
  }
  get minVal(){return this.minVal_;}

  //Maximal value
  set maxVal(value){
    this.maxVal_ = value;
    this.setVal(this.val);
    this.skala();
  }
  get maxVal(){return this.maxVal_;}
  
  //Minimal angle of pointer
  set angleMin(value){
    this.angleMin_ = value;
    this.setVal(this.val);
    this.skala();
  } 
  get angleMin(){return this.angleMin_;}

  //Maximal angle of pointer 
  set angleMax(value){
    this.angleMax_ = value;
    this.setVal(this.val);
    this.skala();
  } 
  get angleMax(){return this.angleMax_;}

  //Unit
  set unit(value){
    this.divUnit.innerHTML = value
    this.unit_ = value;
  }
  get unit(){return this.unit_;}

  //Minimal range 1 min
  set range1_min(value){
    this.range1_min_ = value
    this.skala();
  }
  get range1_min(){return this.range1_min_;}

  //Maximal range 1 max
  set range1_max(value){
    this.range1_max_ = value
    this.skala();
  }
  get range1_max(){return this.range1_max_;}

  //Minimal range 2 min
  set range2_min(value){
    this.range2_min_ = value
    this.skala();
  }
  get range2_min(){return this.range2_min_;}

  //Maximal range 2 max
  set range2_max(value){
    this.range2_max_ = value
    this.skala();
  }
  get range2_max(){return this.range2_max_;}

  //Minimal range 3 min
  set range3_min(value){
    this.range3_min_ = value
    this.skala();
  }
  get range3_min(){return this.range3_min_;}

  //Maximal range 3 max
  set range3_max(value){
    this.range3_max_ = value
    this.skala();
  }
  get range3_max(){return this.range3_max_;}
}

// **** End AnalogInstrument Class ****
