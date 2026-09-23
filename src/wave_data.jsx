

function mod(a,b) {
	return ((a % b) + b) % b;
}

function sine(volume) {

	const p = 256;

	var rv = [];
	for (var n = 0; n < 256; ++n) {
		var x = 128 + Math.round(volume * Math.sin(n * Math.PI / 128));
		rv.push( x || 1 );
	}
	return rv;

}

function square(volume) {

	var rv = [];
	for (var n = 0; n < 128; ++n) rv.push(128 + volume);
	for (var n = 0; n < 128; ++n) rv.push(128 - volume);
	return rv;
}

function triangle(volume) {
	// 0x80 -> 0xff [25%] -> 0x80 [50%] -> 0x01 [75%] -> 0x80 [100%]
	var rv = [];

	const p = 256;
	for (var n = 0; n < 256; ++n) {
		var x = 128 + Math.round(4*volume/p * Math.abs(mod(n-p/4, p) - p/2)) - volume;
		rv.push(x || 1);

	}
	return rv;
}


function sawtooth(volume) {

	var rv = [];

	const p = 256;
	for (var n = 0; n < 256; ++n) {
		var x = 128 + Math.round(volume * 2 * (n/p  - Math.floor(.5 + n/p)));
		rv.push(x || 1);
	}
	return rv;
}


export function WaveData(props) {


	var {assembler, shape, volume} = props;

	if (volume < 1) volume = 1;
	if (volume > 127) volume = 127;

	var data;
	switch(shape) {
		case 0: data = sine(volume); break;
		case 1: data = square(volume); break;
		case 2: data = triangle(volume); break;
		case 3: data = sawtooth(volume); break;
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

	if (assembler == 2) {
		// mpw
		for (var n = 0; n < 32; ++n) {
			var line = "    dc.b $" + hex.slice(n * 8, n * 8 + 8).join(",$") + "\n"
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
