// show pluging UI
figma.showUI(__html__, { themeColors: true, height: 355, width: 450 });

figma.ui.onmessage = (msg: { bbox: string; layerNr: number }) => {
	const selectedEl = figma.currentPage.selection[0];
	if (!selectedEl) return;

	if (msg.bbox === '') {
		figma.notify('Please enter a bbox value', { error: true });
		return;
	}

	// remove any whitespaces or quotation marks before splitting the string
	const bboxValues = msg.bbox.replace(/["\s]/g, '').split(',');

	if (bboxValues.length % 4 !== 0) {
		figma.notify("It seems like you're missing some bbox values, the string is incomplete", { error: true });
		return;
	}

	// define range that is being considered based on the string that is passed
	let startIdx = 0;
	let endIdx = bboxValues.length;

	// is layer number is filled in, take that into account when defining the range
	if (msg.layerNr > 0) {
		startIdx = (msg.layerNr - 1) * 4;
		endIdx = msg.layerNr * 4;

		if (msg.layerNr > bboxValues.length / 4) {
			figma.notify('The layer number you provided is higher than the amount of layers within the image sequence', { error: true });
			return;
		}
	}

	// create frame
	const frame = figma.createFrame();
	frame.x = selectedEl.x;
	frame.y = selectedEl.y;
	frame.resize(selectedEl.width, selectedEl.height);
	frame.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, visible: false }];

	frame.appendChild(selectedEl);
	selectedEl.x = 0;
	selectedEl.y = 0;

	// group values into chunks of 4 and create rectangles based on them
	for (let i = startIdx; i < endIdx; i += 4) {
		const rect = figma.createRectangle();
		rect.x = parseFloat(bboxValues[i]);
		rect.y = parseFloat(bboxValues[i + 1]);
		rect.resize(parseFloat(bboxValues[i + 2]), parseFloat(bboxValues[i + 3]));
		rect.opacity = 0.5;

		frame.appendChild(rect);
	}

	// Make sure to close the plugin, otherwise it will keep running
	figma.closePlugin();
};
