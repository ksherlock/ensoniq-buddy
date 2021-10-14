
import { calc_sr } from './utils'

var _onames = [];
export function Oscillators(props) {

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

export function WaveSize(props) {

	var options = []
	for (var i = 8; i < 16; ++i) {
		var ext = 1 << i;
		var int = i - 8;
		options.push(<option value={int} key={int}>{ext}</option>);
	}
	return <select value={props.value} onChange={props.onChange}>{options}</select>;
}

export function Resolution(props) {

	var options = []
	for (var i = 0; i < 8; ++i) {
		options.push(<option value={i} key={i}>{i}</option>);
	}
	return <select value={props.value} onChange={props.onChange}>{options}</select>;
}

export function Frequency(props) {

	/* number, min, max are not as strict as they ought to be */
	return <input type="number" min="0" max="65535" value={props.value} onChange={props.onChange} />;
}



export function Assembler(props) {

	var options = ["Merlin", "ORCA/M", "MPW"].map( (o, ix) => {
		return <option key={ix} value={ix}>{o}</option>;
	});

	return <select {...props}>{options}</select>;
}

export function WaveShape(props) {

	var options = ["Sine", "Square", "Triangle", "Sawtooth"].map( (o, ix) => {
		return <option key={ix} value={ix}>{o}</option>;
	});

	return <select {...props}>{options}</select>;	
}
