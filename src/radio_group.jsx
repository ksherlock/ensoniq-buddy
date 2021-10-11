

export function RadioGroup(props) {

	var { options, value, onClick } = props;
	var legend = [];
	if (options) {

		legend = options.map( (o, ix) => {
			let _onClick = function(e) { e.preventDefault(); onClick(ix); }
			return <a onClick={ _onClick } class={ ix == value ? "selected" : ""}>{o}</a>;
		});

	}

	return (
		<fieldset class="radio-group" id="form">
			<legend>{legend}</legend>
			{props.children}
		</fieldset>
	);

}
