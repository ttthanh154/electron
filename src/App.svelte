<script>
	import { SvelteToast } from '@zerodevx/svelte-toast'
    import Loader from '../src/common/components/loader.svelte';
	import Execute from './modules/Excute.module.svelte';
    import { DispatchEnum } from '../src/enums/DispatchEnum.svelte';

	const options = {
	duration: 4000,       // duration of progress bar tween to the `next` value
	initial: 1,           // initial progress bar value
	next: 0,              // next progress value
	pausable: false,      // pause progress bar tween on mouse hover
	dismissable: true,    // allow dismiss with close button
	reversed: false,      // insert new toast to bottom of stack
	intro: { x: 256 },    // toast intro fly animation settings
	theme: {},            // css var overrides
	classes: []           // user-defined classes
	}

	let isLoading = DispatchEnum.TURN_OFF;
	
	const setIsLoading = (event) => {
        isLoading = event.detail; // Get the value from the child
    }
</script>	

<main>
    <Loader isLoading={isLoading}/>
	<Execute on:isLoading={setIsLoading}></Execute>
	<SvelteToast options={options}/>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
