<script>
    let inputProps = {
        // Setting style class
        class: [$$restProps.class]
    };
    export let type; //string
    export let value; //number
    export let step; //number
    export let min; //number
    export let max; //number
    
    export let label; //string
    export let id; //string

    const handleChange = (event) => {
        value = event.target.value;
    }
</script>

    {#if type === 'file'}
    <div>
        <label for={id}>{label}</label>
        <input class='input-default' id={id} type="file">
    </div>
    {:else}
        <label for={id}>{label}</label>
        <input class='input' type={type} { ...inputProps } value={value} step={step} min={min} max={max} on:input={handleChange} />
    {/if}

<style>
    .input-default {
    	border: 1px solid transparent; /* Set border to transparent initially */
    }
</style>
