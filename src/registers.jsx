
import { CheckBox, NumberInput, Mode, WaveSize, Resolution } from './input';
/*
bit 6 = doc/ram radio button
bit 5 = auto-increment check box
*/

function to_bin(x) {
	var i;
	rv = []

	for (i = 0; i < 8; ++i) {
		rv.push(x & 0x01)
		x >>= 1
	}
	rv.push('%')
	return rv.reverse().join('')
}

class SoundControl extends preact.Component {

	constructor(props) {
		super(props);
		this._docramChange = this.docramChange.bind(this);
		this._autoincChange = this.autoincChange.bind(this);

		this.state = {
			docram: 1,
			autoinc: true
		};
	}

	docramChange(e) {
		this.setState({docram: +e.target.value});
	}

	autoincChange(e) {
		this.setState({autoinc: e.target.checked});
	}


	render() {
		const {docram, autoinc} = this.state;

		let x = 0;
		let or_value = 0;
		let and_value = 0;

		if (docram) or_value |= 0x40;
		else and_value |= 0x40;

		if (autoinc) or_value |= 0x20;
		else and_value |= 0x20;

		x = [+docram, +autoinc].join('')

		var code = []
		code.push("    lda $C03C\n")
		if (and_value)
			code.push(`    and #${to_bin(and_value)}\n`)
		if (or_value)
			code.push(`    ora #${to_bin(or_value)}\n`)
		code.push("    sta $C03C\n")

		return <>
			<h3 class="register">Sound Control Register ($C03C)</h3>
			<div><label>DOC</label> <input type="radio" value="0" name="docram" onClick={this._docramChange} checked={docram === 0} /></div>
			<div><label>RAM</label> <input type="radio" value="1" name="docram" onClick={this._docramChange} checked={docram === 1} /></div>
			<div><label>Increment</label> <CheckBox onClick={this._autoincChange} checked={autoinc} /></div>

			<div><label>Value</label> <code>%0{x}xxxxx</code></div>

		</>;
	}

}

/*
bits 7-4 = channel address (number 0-15)
3 = interrupt enable checkbox
2/1 = osc mode radio buttons
0 = halted checkbox
*/

class OscillatorControl extends preact.Component {

	constructor(props) {
		super(props);
		this._channelChange = this.channelChange.bind(this);
		this._interruptChange = this.interruptChange.bind(this);
		this._modeChange = this.modeChange.bind(this);
		this._haltedChange = this.haltedChange.bind(this);

		this.state = {
			channel: 0,
			interrupt: false,
			mode: 0,
			halted: false
		};
	}

	channelChange(e) {
		let v = e.target.value;
		if (v < 0) v = 0;
		if (v > 15) v = 15;
		this.setState({channel: v});
	}

	modeChange(e) {
		this.setState({mode: +e.target.value});
	}

	haltedChange(e) {
		this.setState({halted: e.target.checked });
	}
	interruptChange(e) {
		this.setState({interrupt: e.target.checked });
	}



	render() {
		const {channel, interrupt, mode, halted} = this.state;

		let x = 0;
		// let code = [];

		x = channel << 4;
		x |= mode << 1;
		if (interrupt) x |= 0x08;
		if (halted) x |= 1;
		// code.push(to_bin(x));

		return <>
			<h3 class="register">Oscillator Control Register ($A0-$BF)</h3>
			<div><label>Mode</label> <Mode onChange={this._modeChange} value={mode} /></div>
			<div><label>Channel</label> <NumberInput onChange={this._channelChange} value={channel} /></div>
			<div><label>Interrupt</label> <CheckBox onChange={this._interruptChange} checked={interrupt} /></div>
			<div><label>Halted</label> <CheckBox onChange={this._haltedChange} checked={halted} /></div>
			<div><label>Value</label> <code>{to_bin(x)}</code></div>
		</>

	}
}


class WaveTableSize extends preact.Component {

	constructor(props) {
		super(props);
		this._sizeChange = this.sizeChange.bind(this);
		this._resChange = this.resChange.bind(this);

		this.state = {
			res: 0,
			size: 0,
		};
	}

	sizeChange(e) {
		this.setState({size: e.target.value });
	}

	resChange(e) {
		this.setState({res: e.target.value });
	}

	render() {
		const {res, size} = this.state;

		let x = 0;
		x = res;
		x |= size << 3;

		return <>
			<h3 class="register">Wavetable Size Register ($C0-$DF)</h3>
			<div><label>Size</label> <WaveSize value={size} onChange={this._sizeChange} /></div>
			<div><label>Resolution</label> <Resolution value={res} onChange={this._resChange} /></div>
			<div><label>Value</label> <code>{to_bin(x)}</code></div>
		</>;
	}

}

export function RegisterTable() {

	return (<>

		<table>
			<caption>IIgs Registers</caption>
			<colgroup>
				<col class="first" />
				<col />
			</colgroup>
			<tr>
				<td>$C03C</td>
				<td>Sound Control Register</td>
			</tr>
			<tr>
				<td>$C03D</td>
				<td>Data Register</td>
			</tr>

			<tr>
				<td>$C03E-$C03F</td>
				<td>Address Register</td>
			</tr>
		</table>

		<table>
			<caption>Ensoniq Registers</caption>
			<colgroup>
				<col class="first" />
				<col />
			</colgroup>
			<tr>
				<td>$00-$1F</td>
				<td>Frequency Low</td>
			</tr>
			<tr>
				<td>$20-$3F</td>
				<td>Frequency High</td>
			</tr>
			<tr>
				<td>$40-$5F</td>
				<td>Volume</td>
			</tr>

			<tr>
				<td>$60-$7F</td>
				<td>Wavetable Data Sample</td>
			</tr>

			<tr>
				<td>$80-$9F</td>
				<td>Wavetable Pointer</td>
			</tr>

			<tr>
				<td>$A0-$BF</td>
				<td>Control</td>
			</tr>

			<tr>
				<td>$C0-$DF</td>
				<td>Wavetable Size</td>
			</tr>

			<tr>
				<td>$E0</td>
				<td>Oscillator Interrupt Register</td>
			</tr>
			<tr>
				<td>$E1</td>
				<td>Oscillator Enable Register</td>
			</tr>
			<tr>
				<td>$E2</td>
				<td>A/D Converter</td>
			</tr>
		</table>
		<SoundControl />
		<OscillatorControl />
		<WaveTableSize />
	</>);
}
