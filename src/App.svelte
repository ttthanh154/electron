<script>
    import Loader from '../src/common/components/loader.svelte';
	import Execute from './modules/Excute.module.svelte';
    import { DispatchEnum } from '../src/enums/DispatchEnum.svelte';

	let isLoading = DispatchEnum.TURN_OFF;

	const setIsLoading = (event) => {
        isLoading = event.detail; // Get the value from the child
    }
</script>	

<main>
    <Loader isLoading={isLoading}/>
	<Execute on:isLoading={setIsLoading}></Execute>
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
