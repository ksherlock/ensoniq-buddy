

const _notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const _base = [ 27.5, 55, 110, 220, 440, 880, ]

function split_value(value) {
	return [ value % 12, (value / 12) >> 0 ];
}

export function NoteName(value) {

	var [note, octave] = split_value(value);

	return _notes[note] + ' ' + octave;
}

export function NoteFrequency(value) {

	var [note, octave] = split_value(value);

	var n = (note + 3 ) % 12;
	if (n >= 3) octave -= 1;
	var base = 27.5 * (2 ** octave);

	return base * 2 ** (n/12);
}

export class NoteInput extends preact.Component {
	
	constructor(props) {
		super(props);

		this._noteChange = this.noteChange.bind(this);
		this._octaveChange = this.octaveChange.bind(this);

	}

	noteChange(e) {
		e.preventDefault();

		var [note, octave] = split_value(this.props.value);
		note = +e.target.value;
		this.change(note, octave);
	}

	octaveChange(e) {
		e.preventDefault();

		var [note, octave] = split_value(this.props.value);
		octave = +e.target.value;
		this.change(note, octave);
	}

	change(note, octave) {
		var {onChange} = this.props;
		if (onChange) {
			var value = note + (12 * octave);
			onChange(value);
		}
	}

	render() {

		var { onChange, value } = this.props;

		var notes = _notes.map( (x, ix) => {
			return <option key={ix} value={ix}>{x}</option>;
		});

		var octaves = [];
		for (var i = 0; i < 8; ++i) {
			octaves.push(
				<option key={i} value={i}>{i}</option>
			);
		}

		var [note, octave] = split_value(value);

		return (
			<>
				<select onChange={this._noteChange} value={note}>{notes}</select>
				{ ' ' }
				<select onChange={this._octaveChange} value={octave}>{octaves}</select>
				{ ' ' }
				{ NoteFrequency(value).toFixed(2) } Hz
		</>);
	}

}
