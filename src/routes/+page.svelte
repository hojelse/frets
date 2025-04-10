<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	// Default values
	let tuning = new URLSearchParams(browser ? window.location.search : '').get('tuning') || "073a50";
	$: tuning, updateURL()
	
	let key = new URLSearchParams(browser ? window.location.search : '').get('key') || "100010010000";
	$: key, updateURL()

	function updateURL() {
		if (browser) {
			const params = new URLSearchParams(window.location.search);
			params.set('key', key);
			params.set('tuning', tuning);
			goto(`?${params}`);
		}
	}

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

	let fret_count = 24;

	let tuning_hex_to_array = (tuning: string) => {
		return tuning.split('').map(char => parseInt(char, 16));
	}

	$: grid = tuning_hex_to_array(tuning).map(tuning => 
		Array.from({length: fret_count}, (_, j) => (tuning + j) % 12)
	);

	function toggleDegree(index: number) {
		const keyArray = key.split('');
		keyArray[index] = keyArray[index] === "1" ? "0" : "1";
		key = keyArray.join('');
		key = key; // trigger reactivity
	}

	let key_to_name: { [key: string]: { name: string } } = {
		"100010010000": { "name": "Major Triad" },
		"100010010100": { "name": "6" },
		"100010010010": { "name": "7" },
		"101010010010": { "name": "9" },
		"101011010010": { "name": "11" },
		// "101011010110": { "name": "13" },
		"100010010001": { "name": "maj7" },
		"101010010001": { "name": "maj9" },
		"100100010000": { "name": "m" },
		"100100010100": { "name": "m6" },
		"100100010010": { "name": "m7" },
		"101100010010": { "name": "m9" },
		"101101010010": { "name": "m11" },
		// "101101010110": { "name": "m13" },
		"100100010001": { "name": "min/maj7" },
		"101100010001": { "name": "min/maj9" },
		"100100100000": { "name": "dim" },
		"100100100100": { "name": "dim7" },
		"100100100010": { "name": "half-dim" },
		"100010001000": { "name": "aug" },
		"100010001010": { "name": "aug7" },
		"101000010000": { "name": "sus2" },
		"100001010000": { "name": "sus4" },
		"100001010010": { "name": "7sus4" },
		"101001010000": { "name": "sus4 add9" },
		"101010010000": { "name": "add9" },
		"101100010000": { "name": "m add9" },
		"100010010110": { "name": "7add6" },
		"100000010000": { "name": "omit3" },
		"100000010010": { "name": "7omit3" },
		"100010000000": { "name": "omit5" },
		"100010100010": { "name": "7(b5)" },
		"110010010010": { "name": "7(b9)" },
		"100110010010": { "name": "7(#9)" },
		"101010110010": { "name": "7(#11)" },
		"110010011010": { "name": "7(b9b13)" },
		"100100011010": { "name": "m7(b13)" },
		"110110101010": { "name": "7alt" },

		"111111111111": { "name": "Chromatic Scale" },
		"101011010101": { "name": "Major Scale (Ionian Mode)" },
		"101101010110": { "name": "Major Scale (Dorian Mode)" },
		"110101011010": { "name": "Major Scale (Phrygian Mode)" },
		"101010110101": { "name": "Major Scale (Lydian Mode)" },
		"101011010110": { "name": "Major Scale (Mixolydian Mode)" },
		"101101011010": { "name": "Minor Scale (Aeolian Mode)" },
		"110101101010": { "name": "Major Scale (Locrian Mode)" },
		"101010010100": { "name": "Major Pentatonic Scale" },
		"100101010010": { "name": "Minor Pentatonic Scale" },
		"101101010101": { "name": "Melodic Minor Scale" },
		"101101011001": { "name": "Harmonic Minor Scale" },
		"100101110010": { "name": "Minor Blues Scale (b5)" },
		"100111010010": { "name": "Minor Blues Scale (3)" },
		"100101010011": { "name": "Minor Blues Scale (7)" },
		"100101110001": { "name": "Minor Blues Scale (b5, 7)" },
		"100101110100": { "name": "Voodoo Blues Scale" },
		"101110010100": { "name": "Major Blues Scale" },
		"101111110110": { "name": "Mixolydian Blues Scale"},
		"101011011101": { "name": "Major Bebop Scale" },
		"101111010110": { "name": "Dorian Bebop Scale" },
		"101011010111": { "name": "Dominant Bebop Scale" },
		"110101111010": { "name": "Locrian Bebop Scale" },
		"110011011011": { "name": "Phrygian Dominant Bebop Scale" },
		"101101010111": { "name": "Dorian Melodic Bebop Scale" },
		"101101011011": { "name": "Harmonic Minor Bebop Scale" },
		"101101011101": { "name": "Melodic Minor Bebop Scale" },
		"101101101101": { "name": "Whole Half Diminished Scale" },
		"110110110110": { "name": "Half Whole Diminished Scale" },
		"101010101010": { "name": "Whole-Tone Scale" },
	}


	let showModal = false;

	function addString() {
		tuning = tuning + "0";
	}

	function removeString() {
		if (tuning.length > 1) {
			tuning = tuning.slice(0, -1);
		}
	}
</script>

<div class="page">
	<div class="guitar-container">
		<div class="circle-container">
			{#each grid as string}
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
			{/each}
		</div>
	</div>

	<div class="chord-name">
		<div class="chord-name-text">
			Key:
			{#if key_to_name[key]}
				{ key_to_name[key].name }
			{:else}
				Unknown
			{/if}
		</div>
		<button class="modal-button" on:click={() => showModal = true}>Change Key</button>
	</div>

	{#if showModal}
		<div 
			class="modal-backdrop" 
			on:click={() => showModal = false}
			on:keydown={() => showModal = false}
			role="button"
			tabindex="0"
		>
			<div 
				class="modal-content" 
				on:click|stopPropagation 
				on:keydown|stopPropagation
				role="button"
				tabindex="0"
			>
				<div class="scale-selector">
					<h2>Select Scale or Chord</h2>
					{#each Object.entries(key_to_name) as [degrees, o]}
						<label class="scale-checkbox">
							<input
								type="radio" 
								name="chord"
								checked={key === degrees}
								on:change={() => {
									key = degrees;
									showModal = false;
								}}
								style:display="none"
							/>
							<div class="chord-button" class:selected={key === degrees}>
								{o.name}
								<div class="chord-degrees-container">
									{#each degrees.split('') as x, idx}
										{#if x === "1"}
											<div
												style:background-color={!(x === "1") ? "transparent" : scale_degrees[idx].color}
												class="circle"
										>
											{scale_degrees[idx].short_name}
											</div>
										{/if}
									{/each}
								</div>
							</div>
						</label>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.scale-selector {
		user-select: none;
		color: white;
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
		grid-template-columns: repeat(24, 25px);
		gap: 10px;
		justify-content: center;
		padding: 1rem;
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

	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.modal-content {
		background: #424242;
		padding: 2rem;
		border-radius: 8px;
		max-height: 80vh;
		overflow-y: auto;
		width: 80%;
		max-width: 500px;
	}

	.modal-button {
		background: #525252;
		border: none;
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		margin-left: 1rem;
	}

	.chord-name {
		display: flex;
		flex-direction: row;
	}

	.chord-name-text {
		background: none;
		border: 2px solid #525252;
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		margin-left: 1rem;
	}

	.chord-button {
		padding: 0.5rem 1rem;
		margin: 0.25rem;
		border-radius: 4px;
		background: #525252;
		color: white;
		cursor: pointer;
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		width: 100%;
		justify-content: space-between;
	}

	.chord-degrees-container {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.chord-button.selected {
		background: #727272;
	}

	.scale-selector {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

</style>
