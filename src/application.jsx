
// var h = preact.h;

import { calc_sr, calc_shift, log2 } from './utils';

import { NoteInput, NoteFrequency } from './note_input';
import { WaveData } from './wave_data';

import { Oscillators, WaveSize, Resolution, Frequency, Assembler, WaveShape, CheckBox } from './input';

import { DurationInput, DurationSplit } from './duration_input';

const C4 = 4*12;


function nmultiply(x) {
	if (x == 0) return 0;
	if (x == 1) return <i>n</i>;
	return <>{x} * <i>n</i></>;
	// return paren ? <span>({x} * <i>n</i>)</span> : <span>{x} * <i>n</i></span>;
}

function simplify(res, freq) {
	while (res && !(freq & 0x01)) {
		freq >>= 1;
		--res;
	}
	return [res, freq];
}

function SampleDisplay(props) {

	var { shift, freq } = props;

	if (freq == 0) return [];

	var freq2 = log2(freq);

	var fspan = <span title="Frequency">{freq}</span>;

	var fspann = freq == 1 ? <i>n</i> : <>({fspan} * <i>n</i>)</>;

	var rv = [];

	rv.push(
		<div>
			Sample<sub>n</sub> = RAM[ {fspann} &gt;&gt; {shift} ]
		</div>
	);
	rv.push(
		<div>
			Sample<sub>n</sub> = RAM[ {fspann} / {1 << shift} ]
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
					Sample<sub>n</sub> = RAM[ { nmultiply(freq >> freq2) } &gt;&gt; {shift - freq2} ]
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


/*
function NoteDisplay(props) {


	var { osc, note } = props;

	const wave = 0; // 256

	const sr = calc_sr(osc);
	const note_frq = NoteFrequency(note);

	const f = note_frq / (sr / (1 << (8 + wave)));

	// best_res = 7 - Math.ceil(Math.log2(f)) ?
	// best_freq = f * (1 << calc_shift(best_res, 0)) ?

	var best_res = 0;
	var best_freq = 0;
	for (var res = 0; res < 8; ++res) {
		const shift = (1 << calc_shift(res, wave));
		const tmp = Math.round(f * shift);
		if (tmp >= 0x10000) break;
		best_res = res;
		best_freq = tmp;
	}

	[best_res, best_freq] = simplify(best_res, best_freq);

	return (
		<>
			<RateDisplay wave={0} osc={osc} freq={best_freq} res={best_res} />
			<div>Wave Size: 256</div>
			<div>Resolution: {best_res}</div>
			<div>Frequency: {best_freq}</div>
		</>

	);
}
*/
function NoteDisplay(props) {
	const { osc, note } = props;
	return PitchDisplay({osc: osc, pitch: NoteFrequency(note)});
}
function PitchDisplay(props) {


	var { osc, pitch } = props;

	const wave = 0; // 256

	const sr = calc_sr(osc);

	const f = pitch / (sr / (1 << (8 + wave)));

	// best_res = 7 - Math.ceil(Math.log2(f)) ?
	// best_freq = f * (1 << calc_shift(best_res, 0)) ?

	var best_res = 0;
	var best_freq = 0;
	for (var res = 0; res < 8; ++res) {
		const shift = (1 << calc_shift(res, wave));
		const tmp = Math.round(f * shift);
		if (tmp >= 0x10000) break;
		best_res = res;
		best_freq = tmp;
	}

	[best_res, best_freq] = simplify(best_res, best_freq);

	return (
		<>
			<RateDisplay wave={0} osc={osc} freq={best_freq} res={best_res} />
			<div>Wave Size: 256</div>
			<div>Resolution: {best_res}</div>
			<div>Frequency: {best_freq}</div>
		</>

	);
}


function RateDisplay(props) {
	const { osc, wave, freq, res} = props;

	const sr = calc_sr(osc);

	const shift = (1 << calc_shift(res, wave));
	const size = 256 << wave;

	const rate = sr / (size * shift / freq);

	return <div>Rate: {rate.toFixed(2)} Hz</div>;
}


function ResampleDisplay(props) {

	var { osc, size, freq } = props;
	const sr = calc_sr(osc);

	const f = freq / sr;

	var best_res = 0;
	var best_freq = 0;

	for (var res = 0; res < 8; ++res) {
		var tmp = Math.round(f * (1 << calc_shift(res, size)));
		if (tmp >= 0x10000) break;
		best_res = res;
		best_freq = tmp;		
	}

	[best_res, best_freq] = simplify(best_res, best_freq);

	var best_shift = calc_shift(best_res, size);


	return (
		<>
			<div>Resolution: {best_res}</div>
			<div>Frequency: {best_freq}</div>
			<SampleDisplay freq={best_freq} shift={best_shift} />
		</>
	);
}


function HyperDisplay(props) {

	var { pitch, freq } = props;

	// 26_320 = SR w/ 32 oscillators.
	// 261.63 = C4
	// 3072 = 12 * 256 (12 = octave)

	// "The high byte of this word is a semitone value; the low byte is a fractional semitone."

	const r = (freq * 261.63 )/ (26_320 * pitch);

	const offset = Math.round(3072 * Math.log2(r));

	const relative = offset < 0 ? -offset + 0x8000 : offset;

	return (
		<div>Relative: {relative}</div>
	);
}


function TimerDisplay(props) {
	var {osc, duration } = props;


	const [time, units] = DurationSplit(duration);
	const sr = calc_sr(osc);

	const cycles = time * sr;


	// (f * 256) / shift = cycles
	// f * 256 = cycles * shift
	// f = (cycles  * shift) / 256

	// should calculate min. wave size.  eg, 256k sample has min. shift / 512, 32768 has min shift of / 2

	const size = 0; // 256

	var best_res = 0;
	var best_freq = 0;
	var actual = 0;

	best = []
	for (var res = 0; res < 8; ++res) {
		var shift = 1 << calc_shift(res, size);
		var f = Math.round(shift * 256 / cycles);
		if (f >= 0x10000) continue; // break;

		actual = Math.ceil(256 * shift / f);

		best_res = res;
		best_freq = f;
	}

	[best_res, best_freq] = simplify(best_res, best_freq);
	var best_shift = calc_shift(best_res, size);

	switch(units) {
	case "s": break;
	case "ms": actual *= 1000; break;
	case "ticks": actual *= 60; break;
	}

	return (
		<>
			<div>Time: { actual ? (actual / sr).toFixed(2) + " " + units : "N/A" }</div>
			<div>Resolution: {best_res ? best_res : "N/A"}</div>
			<div>Frequency: {best_freq ? best_freq : "N/A"}</div>
			<SampleDisplay freq={best_freq} shift={best_shift} />
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
		this._pitchChange = this.pitchChange.bind(this);
		this._durationChange = this.durationChange.bind(this);
		this._tabChange = this.tabChange.bind(this);
		this._asmChange = this.asmChange.bind(this);
		this._shapeChange = this.shapeChange.bind(this);
		this._inFreqChange = this.inFreqChange.bind(this);
		this._inSizeChange = this.inSizeChange.bind(this);
		this._indeterminateChange = this.indeterminateChange.bind(this);

		this.state = {
			osc: 32, wave: 0, res: 0, freq: 512, tab: 0, 
			note: C4, assembler: 0, shape: 0,
			in_freq: 44100, in_size: 0,
			indeterminate: false,
			pitch: 440,
		};
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

	pitchChange(e) {
		e.preventDefault();
		var v = +e.target.value;
		if (v < 0) v = 0;
		if (v > 65535) v = 65535;
		this.setState( { pitch: v } );
	}


	freqChange(e) {
		e.preventDefault();
		var v = +e.target.value >> 0;
		if (v < 0) v = 0;
		if (v > 65535) v = 65535;
		this.setState( { freq: v } );
	}


	inFreqChange(e) {
		e.preventDefault();
		var v = +e.target.value >> 0;
		if (v < 0) v = 0;
		if (v > 65535) v = 65535;
		this.setState( { in_freq: v } );
	}

	inSizeChange(e) {
		e.preventDefault();
		var v = +e.target.value || 0;
		this.setState( { in_size: v } );
	}


	tabChange(e) {
		e.preventDefault();
		var v = +e.target.value;
		this.setState({ tab: v });
	}

	noteChange(v) {
		this.setState({ note: v });
	}

	durationChange(v) {
		this.setState({ duration: v });
	}

	asmChange(e) {
		e.preventDefault();
		var v = +e.target.value;
		this.setState({ assembler: v});
	}

	shapeChange(e) {
		e.preventDefault();
		var v = +e.target.value;
		this.setState({ shape: v});
	}

	indeterminateChange(e) {
		e.preventDefault();
		var v = !!e.target.checked;
		this.setState({ indeterminate: v });
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

				<RateDisplay wave={wave} osc={osc} freq={freq} shift={shift} res={res} />

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
					<label>Note</label> <NoteInput value={note} onChange={this._noteChange} />
				</div>

				<NoteDisplay osc={osc} note={note} wave={wave} />
			</>
		);

	}

	pitchChildren() {

		var { osc, wave, pitch } = this.state;

		return (
			<>
				<div>
					<label>Oscillators</label> <Oscillators value={osc} onChange={this._oscChange} />
				</div>
				<div>
					<label>Pitch</label> <Frequency value={pitch} onChange={this._pitchChange} /> Hz
				</div>

				<PitchDisplay osc={osc} pitch={pitch} wave={wave} />
			</>
		);


	}

	waveChildren() {

		var { assembler, shape } = this.state;
		return (
			<>
				<div>
					<label>Assembler</label> <Assembler value={assembler} onChange={this._asmChange} />
				</div>

				<div>
					<label>Wave Type</label> <WaveShape value={shape} onChange={this._shapeChange} />
				</div>

				<WaveData assembler={assembler} shape={shape} />
			</>
		);
	}

	resampleChildren() {

		var { osc, in_freq, in_size } = this.state;

		// freq not limited to 65,535 ?
		return (
			<>
				<div>
					<label>Oscillators</label> <Oscillators value={osc} onChange={this._oscChange} />
				</div>

				<div>
					<label>In Frequency</label> <Frequency value={in_freq} onChange={this._inFreqChange} />
				</div>

				<div>
					<label>In Size</label> <WaveSize value={in_size} onChange={this._inSizeChange} />
				</div>

				<ResampleDisplay osc={osc} size={in_size} freq={in_freq} />
			</>
		);
	}

	timerChildren() {
		var { osc, duration } = this.state;

		return (
			<>
				<div>
					<label>Oscillators</label> <Oscillators value={osc} onChange={this._oscChange} />
				</div>

				<div>
					<label>Duration</label> <DurationInput value={duration} onChange={this._durationChange} />
				</div>

				<TimerDisplay osc={osc} duration={duration} />
			</>
		);
	}

	hyperChildren() {

		var { in_freq, note, indeterminate } = this.state;


		if (indeterminate) note = C4;
		return (
			<>

				<div>
					<label>Oscillators</label> <Oscillators value={32} disabled={true} />
				</div>

				<div>
					<label>In Frequency</label> <Frequency value={in_freq} onChange={this._inFreqChange} />
				</div>

				<div>
					<label>Indeterminate</label>
					<CheckBox checked={indeterminate} onChange={ this._indeterminateChange } />
				</div>

				<div style={indeterminate ? { display: "none" } : ""}>
					<label>Pitch</label> <NoteInput value={note} onChange={this._noteChange}
						disabled={indeterminate} />
				</div>	


				<HyperDisplay freq={in_freq} pitch={NoteFrequency(note)} />

			</>
		);

	}


	render() {

		var { osc, wave, res, freq, tab } = this.state;

		// var shift = calc_shift(res, wave);

		var children;
		switch(tab){
			case 0: children = this.sampleChildren(); break;
			case 1: children = this.resampleChildren(); break;
			case 2: children = this.noteChildren(); break;
			case 3: children = this.pitchChildren(); break;
			case 4: children = this.waveChildren(); break;
			case 5: children = this.timerChildren(); break;
			case 6: children = this.hyperChildren(); break;
		}

		const Labels = ["Sample", "Resample", "Note", "Pitch", "Wave", "Timer", "HyperCard Pitch"];
		var options = Labels.map( (o, ix) => {
			return <option key={ix} value={ix}>{o}</option>;
		});

		return (
			<fieldset>
				<legend><select value={tab} onChange={this._tabChange}>{options}</select></legend>
				{children}
			</fieldset>
		);
	}
}

