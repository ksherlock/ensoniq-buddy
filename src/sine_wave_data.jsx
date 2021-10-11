

export function SineWaveData() {

	var data = [];
	for (var n = 0; n < 256; ++n) {
		var x = 128 + Math.round(127 * Math.sin(n * Math.PI / 128));
		data.push( x || 1 );
	}

	var hex = data.map( (x) => x < 0x10 ? "0" + x.toString(16) : x.toString(16) );

	var code = [];
	for (var n = 0; n < 16; ++n) {
		var line = "\t hex " + hex.slice(n * 16, n * 16 + 16).join("") + "\n"
		code.push(line);
	}

	return (
		<code>
		<pre>
		{code}
		</pre>
		</code>
	);
}