
function split_value(x) {

	if (x === undefined || x === null) return ["", 0];

	if (typeof(x) == "number") return [x, 0];

	var xx =  x.split(':');

	if (xx.length == 2) return xx;
	if (xx.length == 1) return [x, 0];

	return [ "", 0];
}

export function DurationToSeconds(x) {

	let [ time, unit ] = split_value(x);
	switch (+unit) {
		case 0: return +time; // seconds;
		case 1: return +time / 1000 ; // milliseconds;
		case 2: return +time / 60; // ticks
		default: return 0;
	}
}

export class DurationInput extends preact.Component {

	constructor(props) {
		super(props);

		this._amtChange = this.amtChange.bind(this);
		this._unitChange = this.unitChange.bind(this);

	}

	amtChange(e) {
		e.preventDefault();

		let { value } = this.props;
		var [ time, unit ] = split_value(value);  

		var new_time = e.target.value.replace(/^\s+|\s+$/g,"");

		var n = Number(new_time);
		if (Number.isNaN(n)) {
			e.target.value = time;
			return; // error.
		}


		this.change(new_time, unit);
	}

	unitChange(e) {
		e.preventDefault();

		let { value } = this.props;
		var [ time, unit ] = split_value(value);  
		var new_unit = +e.target.value;


		let s = DurationToSeconds(value);


		if (new_unit == unit) return;
		var new_time = 0;
		switch(new_unit) {
			case 0: new_time = s; break;
			case 1: new_time = s * 1000; break;
			case 2: new_time = s * 60; break;
		}

		this.change(new_time, new_unit);
	}

	change(time, unit) {
		let { onChange } = this.props;

		if (onChange) {
			onChange(time + ":" + unit);
		}
	}



	render() {

		var { value,disabled } = this.props;

		var [ amt, unit ] = split_value(value);  

		var options = ["Seconds", "Milliseconds", "Ticks"].map( (x, ix) => {

			return <option key={ix} value={ix}>{x}</option>
		});

		return (
			<>
				<input type="text" value={amt} disabled={disabled} onChange={this._amtChange} />
				{' '}
				<select value={unit} disabled={disabled} onChange={this._unitChange}>{options}</select>
			</>
		);

	}

}
