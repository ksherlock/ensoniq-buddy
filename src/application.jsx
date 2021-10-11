
// var h = preact.h;

import { NoteInput, NoteFrequency } from './note_input';
import { RadioGroup } from './radio_group';


function calc_sr(osc) {
	// iigs is ~7.14Mhz / 8.  Mirage is 8Mhz / 8
	// return (28.63636*1000*1000/32) / (osc + 2);
	return (28_636_360/32) / (osc + 2);
}

function calc_shift(res,ws) {
	return res + 9 - ws;
}

function log2(x) {
	var y = Math.log2(x);
	return (y >> 0) === y ? y : false;
}


var _onames = [];
function Oscillators(props) {

	if (!_onames.length) {
		for (var i = 1; i < 33; ++i) {
			var x  = (calc_sr(i) / 1000 ).toFixed(2) + " kHz";
			_onames.push(x)
		}
	}
	var options = _onames.map( (x, ix) => {
		var i = ix + 1;
		return <option value={i} key={i}>{i} – {x}</option>
	});
	// for (var i = 1; i < 33; ++i) {
	// 	options.push(<option value={i} key={i}>{i}</option>);
	// }
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

function SineWave() {

	var rv = [];
	for (n = 0; n < 256; ++n) {
		var x = 128 + Math.round(127 * Math.sin(n * Math.PI / 128));
		var y = x.toString(16); if (y.length < 2) y = "0" + y;
		rv.push( y );
		if ((n & 0x07) == 0x07) rv.push("\n");
		else rv.push(', ');
	}

	return (
		<code>
		<pre>
		{rv}
		</pre>
		</code>
	);
}
function NoteDisplay(props) {


	var { osc, wave, note } = props;

	const sr = calc_sr(osc);
	const note_frq = NoteFrequency(note);

	const f = note_frq / (sr / (1 << (8 + wave)));

	var best_res = 0;
	var best_freq = 0;
	for (var res = 0; res < 8; ++res) {
		var tmp = f * (1 << calc_shift(res, wave));
		if (tmp >= 0x10000) break;
		best_res = res;
		best_freq = tmp;
	}

	return (
		<>
			<div>Resolution: {best_res}</div>
			<div>Frequency: {Math.round(best_freq)}</div>
			<SineWave />
		</>

	);
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
		this._noteChange = this.noteChange.bind(this);
		this._tabChange = this.tabChange.bind(this);

		this.state = { osc: 32, wave: 0, res: 0, freq: 512, tab: 0, note: 4*12 };
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

	tabChange(v) {
		this.setState({ tab: v });
	}

	noteChange(v) {
		this.setState({ note: v });
	}

	sampleChildren() {

		var { osc, wave, res, freq } = this.state;

		var shift = calc_shift(res, wave);

		return (
			<>
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

				<SampleDisplay freq={freq} shift={shift} />
			</>
		);
	}

	noteChildren() {

		var { osc, wave, note } = this.state;

		return (
			<>
				<div>
					<label>Oscillators</label> <Oscillators value={osc} onChange={this._oscChange} />
				</div>
				<div>
					<label>Wave Size</label> <WaveSize value={wave} onChange={this._waveChange} />
				</div>
				<div>
					<label>Note</label> <NoteInput value={note} onChange={this._noteChange} />
				</div>

				<NoteDisplay osc={osc} note={note} wave={wave} />
			</>
		);

	}


	render() {

		var { osc, wave, res, freq, tab } = this.state;

		// var shift = calc_shift(res, wave);

		var children;
		switch(tab){
			case 0: children = this.sampleChildren(); break;
			case 1: children = this.noteChildren(); break;
		}


		return (
			<RadioGroup value={tab} options={["Sample", "Note"]} onClick={this._tabChange }>
				{ children }
			</RadioGroup>
		);
	}
}

