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

	let grid: number[] = [];
	let tuning_degrees = [0, 5, 10, 3, 7, 0].reverse();
	for (let i = 0; i < tuning_degrees.length; i++) {
		for (let j = 0; j < 18; j++) {
			grid.push((tuning_degrees[i] + j) % 12);
		}
	}

	let key = "111111111111";

	function toggleDegree(index: number) {
		const keyArray = key.split('');
		keyArray[index] = keyArray[index] === "1" ? "0" : "1";
		key = keyArray.join('');
		key = key; // trigger reactivity
	}

	let degrees_to_chord_name: { [key: string]: string } = {
		"100010010000": "M",
		"100010010100": "6",
		"100010010010": "7",
		"101010010010": "9",
		"101011010010": "11",
		"100010010001": "maj7",
		"100010001000": "aug",
		"100010001010": "aug7",
		"100100010000": "m",
		"100100010100": "m6",
		"100100010010": "m7",
		"100100010001": "min/maj7",
		"100100100000": "dim",
		"100100100100": "dim7",
		"100100100010": "ø",
	}

</script>

<div class="page">
	<div class="chord-name">
		{#if key in degrees_to_chord_name}
			{degrees_to_chord_name[key]}
		{/if}
	</div>

	<div class="scale-selector">
		{#each Object.entries(scale_degrees) as [index, degree]}
			<label class="scale-checkbox">
				<input
					type="checkbox"
					checked={key[parseInt(index)] === "1"}
					on:change={() => toggleDegree(parseInt(index))}
					style:display="none"
				/>
				<div 
					style:background-color={!(key[parseInt(index)] === "1") ? "transparent" : degree.color}
					class="circle"
				>
					{degree.short_name}
				</div>
			</label>
		{/each}
	</div>

	<div class="circle-container">
		{#each grid as id}
			<div 
				class="circle"
				style:background-color={!(key[id] === "1") ? "transparent" : scale_degrees[id].color}
			>
				{scale_degrees[id].short_name}
			</div>
		{/each}
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

	.circle-container {
		display: grid;
		grid-template-columns: repeat(18, 25px);
		grid-template-rows: repeat(6, 25px);
		gap: 4px;
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
