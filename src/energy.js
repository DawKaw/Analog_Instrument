var voltMeterObj;
var amperMeterObj;
var wattMeterObj;
var barMeterObj;
var cnt = 0;

document.addEventListener("DOMContentLoaded", function(event) { 
  //Volt meter
  voltMeterObj = new AnalogInstrument("voltMeter",
				   {minVal: 200, 
					maxVal: 260,
					unit: "V",
					//type: "round",
					//range1_min: 180,
					//range1_max: 210,
					//range1_color: "#34ebe2",
					range2_min: 210,
					range2_max: 250,
					range3_min: 250,
					range3_max: 260,
					pointer_count: 3,
					dialLineStep: 1,
					dialNumbersStep: 10,
					valPrefix0: "L1 ",
					valPrefix1: "L2 ",
					valPrefix2: "L3 ",                                
				   });
  voltMeterObj.setValue(230.5, 0);
  voltMeterObj.setValue(229.5, 1);
  voltMeterObj.setValue(233.7, 2);	
	
  //Amper meter;
  amperMeterObj = new AnalogInstrument("amperMeter",
				   {minVal: 0, 
					maxVal: 50,
					unit: "A",
					//type: "round",
					range3_min: 45,
					range3_max: 50,
					pointer_count: 3,
					dialLineStep: 1,
					dialNumbersStep: 10,
					valPrefix0: "L1 ",
					valPrefix1: "L2 ",
					valPrefix2: "L3 ",
				   });
  amperMeterObj.setValue(20.5, 0);
  amperMeterObj.setValue(25.3, 1);
  amperMeterObj.setValue(30.7, 2);

  //Watt meter
  wattMeterObj = new AnalogInstrument("wattMeter",
				   {minVal: 0, 
					maxVal: 100,
					unit: "kW",
					//type: "round",
					pointer_count: 2,
					pointer0_color: "#000000",
					pointer1_color: "#db4d1a",
					dialLineStep: 1,
					dialNumbersStep: 10,
					valPrefix0: "P ",
					valPrefix1: "Q ",
				   });
  wattMeterObj.setValue(50.5, 0);
  wattMeterObj.setValue(60.5, 1);

  //Bar meter
  barMeterObj = new AnalogInstrument("barMeter",
				   {minVal: 0, 
					maxVal: 50,
					type: "round",
					unit: "bar",
					range1_min: 2,
					range1_max: 15,
					range1_color: "#ebba34",
					range2_min: 20,
					range2_max: 35,
					range2_color: "#34eb43",
					range3_min: 40,
					range3_max: 50,
					range3_color: "#eb3474",
					pointer_count: 1,
					dialLineStep: 1,
					dialNumbersStep: 10,
					valPrefix0: "bar ",
				   });
  barMeterObj.setValue(22.5);
  
  setInterval(function()
	{   //Set randomized value with properly range.
		const arrObj = [voltMeterObj, amperMeterObj, wattMeterObj, barMeterObj];
		arrObj[cnt].setValue(randomVal(cnt), 0);
		arrObj[cnt].setValue(randomVal(cnt), 1);
		arrObj[cnt].setValue(randomVal(cnt), 2);
		if (++cnt >= arrObj.length) cnt = 0;  
	}, 3500);

});


function randomVal(index){
	switch(index){
		case 0:
			return Math.floor(Math.random()*600)/10+200;
		break;
			
		case 1:
			return Math.floor(Math.random()*500)/10;
		break;

		case 2:
			return Math.floor(Math.random()*1000)/10;
		break;

		case 3:
			return Math.floor(Math.random()*500)/10;
		break;						
	}
		
}