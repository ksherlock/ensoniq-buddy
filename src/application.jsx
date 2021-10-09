
// var h = preact.h;



function calc_sr(osc) {
	// iigs is ~7.14Mhz / 8.  Mirage is 8Mhz / 8
	return (28.63636*1000*1000/32) / (osc + 2);
}

function calc_shift(res,ws) {
	return res + 9 - ws;
}

function log2(x) {
	var y = Math.log2(x);
	return (y >> 0) === y ? y : false;
}


function Oscillators(props) {

	var options = []
	for (var i = 1; i < 33; ++i) {
		options.push(<option value={i} key={i}>{i}</option>);
	}
	return <select value={props.value} onChange={props.onChange}>{options}</select>;
}

function WaveSize(props) {

	var options = []
	for (var i = 8; i < 16; ++i) {
		var ext = 1 << i;
		var int = i - 8;
		options.push(<option value={int} key={int}>{ext}</option>);
	}
	return <select value={props.value} onChange={props.onChange}>{options}</select>;
}

function Resolution(props) {

	var options = []
	for (var i = 0; i < 8; ++i) {
		options.push(<option value={i} key={i}>{i}</option>);
	}
	return <select value={props.value} onChange={props.onChange}>{options}</select>;
}

function Frequency(props) {

	/* number, min, max are not as strict as they ought to be */
	return <input type="number" min="0" max="65535" value={props.value} onChange={props.onChange} />;
}


function nmultiply(x) {
	if (x == 0) return 0;
	if (x == 1) return <i>n</i>;
	return <span>{x} * <i>n</i></span>;
	// return paren ? <span>({x} * <i>n</i>)</span> : <span>{x} * <i>n</i></span>;
}
function SampleDisplay(props) {

	var { shift, freq } = props;


	var freq2 = log2(freq);

	var fspan = <span title="Frequency">{freq}</span>;

	var rv = [];

	rv.push(
		<div>
			Sample<sub>n</sub> = RAM[ ({fspan} * <i>n</i>) >> {shift} ]
		</div>
	);
	rv.push(
		<div>
			Sample<sub>n</sub> = RAM[ ({fspan} * <i>n</i>) / {1 << shift} ]
		</div>
	);

	if (freq2) {
		if (freq2 >= shift) {
			rv.push(
				<div>
					Sample<sub>n</sub> = RAM[ { nmultiply(freq / ( 1 << shift)) } ]
				</div>
			);
		} else {
			rv.push(
				<div>
					Sample<sub>n</sub> = RAM[ { nmultiply(freq >> freq2) } >> {shift - freq2} ]
				</div>
			);
			rv.push(
				<div>
					Sample<sub>n</sub> = RAM[ { nmultiply(freq >> freq2) } / { 1 << (shift - freq2) } ]
				</div>
			);
		}
	}
	return rv;
}



// oscillators generate addresses, not samples.
// accumulator is 24-bit.
// frequency is 16-bit.
// accumulator n = freq * n
// sample n = memory[(freq * n) >> res. shift]

export class Application extends preact.Component {

	constructor(props) {
		super(props);

		this._oscChange = this.oscChange.bind(this);
		this._waveChange = this.waveChange.bind(this);
		this._resChange = this.resChange.bind(this);
		this._freqChange = this.freqChange.bind(this);

		this.state = { osc: 32, wave: 0, res: 0, freq: 512 };
	}

	oscChange(e) {
		e.preventDefault();
		var v = +e.target.value || 0;
		this.setState( { osc: v } );
	}

	waveChange(e) {
		e.preventDefault();
		var v = +e.target.value || 0;
		this.setState( { wave: v } );
	}

	resChange(e) {
		e.preventDefault();
		var v = +e.target.value || 0;
		this.setState( { res: v } );
	}

	freqChange(e) {
		e.preventDefault();
		var v = +e.target.value >> 0;
		if (v < 0) v = 0;
		if (v > 65535) v = 65535;
		this.setState( { freq: v } );
	}

	form() {

		var { osc, wave, res, freq } = this.state;

		return (
			<div id="form">
				<div>
					<label>Oscillators</label> <Oscillators value={osc} onChange={this._oscChange} />
				</div>
				<div>
					<label>Wave Size</label> <WaveSize value={wave} onChange={this._waveChange} />
				</div>
				<div>
					<label>Resolution</label> <Resolution value={res} onChange={this._resChange} />
				</div>
				<div>
					<label>Frequency</label> <Frequency value={freq} onChange={this._freqChange} />
				</div>
			</div>
		);
	}

	render() {

		var { osc, wave, res, freq } = this.state;

		var shift = calc_shift(res, wave);

		return (
			<div>
				{ this.form() }

				<div>
					Scan Rate: { (calc_sr(osc) / 1000 ).toFixed(2) } kHz
				</div>

				<SampleDisplay freq={freq} shift={shift} />
			</div>
		);
	}
}

/*
window.addEventListener('load', function(){

    preact.render(
        <Application />,
        document.getElementById('application')
    );
});
*/
