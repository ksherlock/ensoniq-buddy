
export function calc_sr(osc) {
	// iigs is ~7.14Mhz / 8.  Mirage is 8Mhz / 8
	// return (28.63636*1000*1000/32) / (osc + 2);
	return (28_636_360/32) / (osc + 2);
}

export function calc_shift(res,ws) {
	return res + 9 - ws;
}

export function log2(x) {
	var y = Math.log2(x);
	return (y >> 0) === y ? y : false;
}
