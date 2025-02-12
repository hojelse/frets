<script lang="ts">
	interface ScaleDegree {
		short_name: string;
		color: string;
	}

	let scale_degrees: { [key: number]: ScaleDegree } = {
		0: {
			"short_name": "1",
			"color": "#6665FF"
		},
		1: {
			"short_name": "b2",
			"color": "#92CC55"
		},
		2: {
			"short_name": "2",
			"color": "#FE63FE"
		},
		3: {
			"short_name": "b3",
			"color": "#60FFB6"
		},
		4: {
			"short_name": "3",
			"color": "#EB595B"
		},
		5: {
			"short_name": "4",
			"color": "#65B6FF"
		},
		6: {
			"short_name": "#4",
			"color": "#BDBD4F"
		},
		7: {
			"short_name": "5",
			"color": "#B662FF"
		},
		8: {
			"short_name": "b6",
			"color": "#5CEA5B"
		},
		9: {
			"short_name": "6",
			"color": "#FD63B7"
		},
		10: {
			"short_name": "b7",
			"color": "#64FFFF"
		},
		11: {
			"short_name": "7",
			"color": "#CC8F53"
		}
	}
	let fret_count = 18;
	let strings_tuning = [0, 7, 3, 10, 5, 0];

	$: grid = strings_tuning.map(tuning => 
		Array.from({length: fret_count}, (_, j) => (tuning + j) % 12)
	);

	let key = "111111111111";

	function toggleDegree(index: number) {
		const keyArray = key.split('');
		keyArray[index] = keyArray[index] === "1" ? "0" : "1";
		key = keyArray.join('');
		key = key; // trigger reactivity
	}

	let degrees_to_chord_name: { [key: string]: string } = {
		"111111111111": "Chromatic Scale",
		// "101011010101": "Diatonic Scale",
		// "101010010100": "Major Pentatonic Scale",
		// "100101010010": "Minor Pentatonic Scale",
		// "101101010101": "Melodic Minor Scale",
		// "101101011001": "Harmonic Minor Scale",
		// "101010101010": "Whole-tone scale",
		"100010010000": "M",
		"100010010100": "6",
		"100010010010": "7",
		"101010010010": "9",
		"101011010010": "11",
		"101011010110": "13",
		"100010010001": "maj7",
		"101010010001": "maj9",
		"100100010000": "m",
		"100100010100": "m6",
		"100100010010": "m7",
		"101100010010": "m9",
		"101101010010": "m11",
		"101101010110": "m13",
		"100100010001": "min/maj7",
		"101100010001": "min/maj9",
		"100100100000": "dim",
		"100100100100": "dim7",
		"100100100010": "half-dim",
		"100010001000": "aug",
		"100010001010": "aug7",
		"101000010000": "sus2",
		"100001010000": "sus4",
		"100001010010": "7sus4",
		"101001010000": "sus4 add9",
		"101010010000": "add9",
		"101100010000": "m add9",
		"100010010110": "7add6",
		"100000010000": "omit3",
		"100000010010": "7omit3",
		"100010000000": "omit5",
		"100010100010": "7(b5)",
		"110010010010": "7(b9)",
		"100110010010": "7(#9)",
		"101010110010": "7(#11)",
		"110010011010": "7(b9b13)",
		"100100011010": "m7(b13)",
		"110110101010": "7alt",
	}

	function openTuningModal(idx: number): any {
		strings_tuning[idx] = (strings_tuning[idx] + 1) % 12;
		strings_tuning = strings_tuning; // trigger reactivity
		grid = grid; // trigger reactivity
	}
</script>

<div class="page">
	<div class="fret-controls">
		<button 
			class="fret-button"
			on:click={() => {
				if (fret_count > 1) {
					fret_count--;
					strings_tuning = strings_tuning; // trigger reactivity
					grid = grid; // trigger reactivity
				}
			}}
		>
			Decrease Frets
		</button>
		<button
			class="fret-button" 
			on:click={() => {
				fret_count++;
				strings_tuning = strings_tuning; // trigger reactivity
				grid = grid; // trigger reactivity
			}}
		>
			Increase Frets
		</button>
	</div>

	<div class="guitar-container">
		<div class="tuning-container">
			{#each strings_tuning as id, idx}
				<label class="scale-checkbox">
					<input
						type="checkbox"
						checked={key[id] === "1"}
						on:change={() => openTuningModal(idx)}
						style:display="none"
					/>
					<div 
						style:border={`1px solid ${scale_degrees[id].color}`}
						class="circle"
					>
						{scale_degrees[id].short_name}
					</div>
				</label>
			{/each}
		</div>
		<div class="circle-container">
			{#each grid as string}
				<div class="string">
					{#each string as id}
						<label class="scale-checkbox">
							<input
								type="checkbox"
								checked={key[id] === "1"}
								on:change={() => toggleDegree(id)}
								style:display="none"
							/>
							<div
								style:background-color={!(key[id] === "1") ? "transparent" : scale_degrees[id].color}
								class="circle"
							>
								{scale_degrees[id].short_name}
							</div>
						</label>
					{/each}
				</div>
			{/each}
			<div class="chord-name">
				{#if key in degrees_to_chord_name}
					{degrees_to_chord_name[key]}
				{/if}
			</div>
		</div>
	</div>

</div>

<style>
	.scale-selector {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		justify-content: center;
		margin-bottom: 1rem;
		user-select: none;
	}

	.scale-checkbox {
		display: flex;
		align-items: center;
		cursor: pointer;
	}

	:global(body) {
		background-color: #323232;
		margin: 0;
		padding: 0;
	}

	.guitar-container {
		display: flex;
		flex-direction: row;
	}

	.circle-container {
		display: grid;
		grid-template-rows: repeat(6, 25px);
		gap: 10px;
		justify-content: center;
		padding: 1rem;
	}

	.string {
		display: grid;
		grid-template-columns: repeat(24, 25px);
		gap: 10px;
		justify-content: center;
		user-select: none;
	}
	
	.tuning-container {
		display: grid;
		grid-template-columns: repeat(1, 25px);
		grid-template-rows: repeat(6, 25px);
		gap: 10px;
		justify-content: center;
		padding: 1rem;
		user-select: none;
	}

	.circle {
		width: 25px;
		height: 25px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		color: white;
		font-weight: bold;
		font-size: 0.8em;
		user-select: none;
	}

	.chord-name {
		font-size: 1.5em;
		font-weight: bold;
		color: white;
		text-align: center;
	}
</style>
