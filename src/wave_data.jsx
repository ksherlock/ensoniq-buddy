



function sine() {

	var rv = [];
	for (var n = 0; n < 256; ++n) {
		var x = 128 + Math.round(127 * Math.sin(n * Math.PI / 128));
		rv.push( x || 1 );
	}
	return rv;

}

function square() {

	var rv = [];
	for (var n = 0; n < 128; ++n) rv.push(255);
	for (var n = 0; n < 128; ++n) rv.push(1);
	return rv;
}

function triangle() {
	// 0x80 -> 0xff [25%] -> 0x80 [50%] -> 0x01 [75%] -> 0x80 [100%]
	var rv = [];
	for (var n = 0; n < 64; ++n) rv.push(0x80 + n * 2);
	for (var n = 0; n < 128; ++n) rv.push(0xff - n * 2);
	for (var n = 0; n < 64; ++n) rv.push(0x01 + n * 2);
	return rv;
}


function sawtooth() {

	var rv = [];
	for (var n = 0; n < 128; ++n) rv.push(0x80 + n);
	for (var n = 0; n < 128; ++n) rv.push(0x01 + n);
	return rv;
}


export function WaveData(props) {


	var {assembler, shape} = props;

	var data;
	switch(shape) {
		case 0: data = sine(); break;
		case 1: data = square(); break;
		case 2: data = triangle(); break;
		case 3: data = sawtooth(); break;
	}

	var hex = data.map( (x) => x < 0x10 ? "0" + x.toString(16) : x.toString(16) );

	var code = [];
	if (assembler == 0) {
		// merlin
		for (var n = 0; n < 16; ++n) {
			var line = "    hex " + hex.slice(n * 16, n * 16 + 16).join("") + "\n"
			code.push(line);
		}
	}

	if (assembler == 1) {
		// orca/m
		for (var n = 0; n < 16; ++n) {
			var line = "    dc h'" + hex.slice(n * 16, n * 16 + 16).join("") + "'\n"
			code.push(line);
		}
	}

	return (
		<code>
		<pre>
		{code}
		</pre>
		</code>
	);
}
