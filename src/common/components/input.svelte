<script>
    let inputProps = {
        // Setting style class
        class: [$$restProps.class]
    };
    export let type;
    export let value;
    export let step;
    export let min;
    export let max;
    
    export let label;
    export let id;

    const handleChange = (event) => {
        value = event.target.value;
    }
</script>

<main>
    {#if type === 'file'}
    <div class="grid">
        <label for={id}>{label}</label>
        <input class='input-default' id={id} type="file">
    </div>
    {:else}
    <div class="grid">
        <label for={id}>{label}</label>
        <input class='input' type={type} { ...inputProps } value={value} step={step} min={min} max={max} on:input={handleChange} />
    </div>
    {/if}
</main>

<style>
     .grid {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1.5rem;
    }

    label {
        display: block;
        font-weight: bold;
        margin-bottom: 0.5rem;
    }

    .input-default {
    	border: 1px solid transparent; /* Set border to transparent initially */
        /* border: 1px solid var(--border); */
    }

</style>
