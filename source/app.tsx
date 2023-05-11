import React, { useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import clipboard from 'clipboardy';

function clamp(a: number, min: number, max: number): number {
	return Math.min(Math.max(a, min), max);
};

const LENGTH_CAP = Infinity;
// const DEFAULT_STR = "++++++++++[>+++++++>++++++++++>+++>+<<<<-]>++.>+.+++++++..+++.>++.<<+++++++++++++++.>.+++.------.--------.>+.>."

const DEFAULT_STR = "++++++++++[>+++++++>++++++++++>+++>+<<<<-]>++.>+.+++++++..+++.>++.<<+++++++++++++++.>.+++.------.--------.>+.>."

export default function App() {
	const [data, setData] = useState<number[]>([]);
	const [dataPointer, setDataPointer] = useState(0);

	const [autoExecute, setAutoExecute] = useState(true);

	const [tape, setTape] = useState<string[]>(DEFAULT_STR.split(""));
	const [carretPos, setCarretPos] = useState(0);
	const [autoMove, setAutoMove] = useState(false);
	const [insertMode, setInsertMode] = useState(false);
	const [execute, setExecute] = useState(false);

	const [message, setMessage] = useState("");

	function setDataAt(pos: number, val: number) {
		setData((data) => {
			let newData = [...data];
			newData[pos] = val;
			return newData;
		});
	}

	useInput((input, key) => {
		if (key.shift && input == "C") {
			// reset vars
			setDataPointer(0);
			setData([]);
			setTape([]);
			setCarretPos(0);
			setAutoMove(false);
			setInsertMode(false);
			setExecute(false);
			setMessage("");
			return;
		}

		if (key.shift && input == "V") {
			setTape(clipboard.readSync().split(""));
			return;
		}

		if (key.ctrl && input == "e") {
			// setDataPointer(0);
			// setData([]);
			setExecute(true);
			return;
		}

		if (input == "=") {
			setAutoExecute(!autoExecute);
			return;
		}

		if (key.ctrl && input == "a") {
			setAutoMove(!autoMove);
			return;
		}

		if (key.tab) {
			setInsertMode(!insertMode);
			return;
		}

		if (key.leftArrow) setCarretPos((pos) => clamp(pos - 1, 0, LENGTH_CAP));
		if (key.rightArrow) setCarretPos((pos) => clamp(pos + 1, 0, LENGTH_CAP));

		if (input == "") return;
		let newTape = [...tape];
		if (insertMode) {
			newTape.splice(carretPos, 0, input);
		} else {
			newTape[carretPos] = input;
		}
		setTape(newTape)

		if (autoMove) setCarretPos((pos) => clamp(pos + 1, 0, LENGTH_CAP));
	});

	useEffect(() => {
		if (execute == false) return;

		function executeStep() {
			if (tape[carretPos] == ">") return setDataPointer((p) => clamp(p + 1, 0, LENGTH_CAP));
			if (tape[carretPos] == "<") return setDataPointer((p) => clamp(p - 1, 0, LENGTH_CAP));
			if (tape[carretPos] == "+") return setDataAt(dataPointer, (data[dataPointer] ?? 0) + 1);
			if (tape[carretPos] == "-") return setDataAt(dataPointer, (data[dataPointer] ?? 0) - 1);
			if (tape[carretPos] == "[") return setCarretPos((p) => data[dataPointer] == 0 ? tape.indexOf("]", carretPos) : p);
			if (tape[carretPos] == "]") return setCarretPos((p) => data[dataPointer] != 0 ? tape.lastIndexOf("[", carretPos) : p);
			if (tape[carretPos] == ".") return setMessage((m) => m + String.fromCharCode(data[dataPointer] ?? 0));
			return true;
		}

		if (executeStep()) return setExecute(false);
		if (autoExecute) {
			let i = setTimeout(() => setCarretPos((p) => clamp(p + 1, 0, LENGTH_CAP)), 1000/60);
			return () => clearTimeout(i);
		}
	// }, [execute, tape, carretPos, dataPointer, data, message]);
	}, [execute, carretPos]);

	return (
		<Box flexDirection="column">
			{data.length > 0 && <Text>{dataPointer} [{data.join(", ")}]</Text>}
			<Box flexDirection="row">
				{/* {tape.flatMap((mem, i) => <Text key={i}>{mem != undefined ? mem : "s"}</Text>)} */}
				{new Array(tape.length).fill(0).map((_, i) => <Text key={i} color={tape[i] == undefined ? `gray` : `white`}>{tape[i] != undefined ? tape[i] : "*"}</Text>)}
			</Box>
			<Box paddingLeft={carretPos}>
				<Text color="green">*</Text>
			</Box>
			<Box>
				<Text color={autoMove ? `green` : `red`} bold italic>{autoMove ? `Auto Move Active` : `Auto Move In-Active`}</Text>
			</Box>
			<Box>
				<Text color={insertMode ? `green` : `red`} bold italic>{insertMode ? `Insert Move Active` : `Insert Move In-Active`}</Text>
			</Box>
			<Box flexDirection="column">
				<Text>SHIFT + C	| RESET ALL DATA</Text>
				<Text>SHIFT + V	| Set String from Clipboard</Text>
				<Text>CTRL + A 	| Toggle AutoMove</Text>
				<Text>TAB 		| Toggle Insert</Text>
				<Text>CTRL + E 	| Execute Array</Text>
				<Text>← → | Move Pointer/Manual Execute</Text>
				<Text>= | Switch Execution Mode</Text>
				<Box flexDirection="row">
					<Text bold color={autoExecute ? `green` : `red`}>FPS</Text>
					<Text color="gray"> | </Text>
					<Text bold color={!autoExecute ? `green` : `red`}>Manual</Text>
				</Box>
			</Box>
			<Box>
				<Text italic>{message}</Text>
			</Box>
		</Box>
	);
}
