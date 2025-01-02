
<!-- Select.svelte -->
<script>
  import Tooltip from "./tooltip.svelte";

    export let label;
    export let id;
    export let selectedValue = 'medium';
    export let text;
    export let position;

    const handleChange = (event) => {
        selectedValue = event.target.value;
    }
</script>

<div class="select-container">
    {#if text}
    <Tooltip text={text} position={position}>
        <label class='input-label' for={id}>{label}</label>
    </Tooltip>
    {:else}
        <label class='input-label' for={id}>{label}</label>
    {/if}
    <select id={id} bind:value={selectedValue} on:change={handleChange}>
        <slot></slot>
    </select>
    
</div>

<style>
    .select-container {
        display: flex;
        justify-content: center;
        gap: 1em;
    }

    .input-label {
        font-weight: bold;
        font-size: large;
    }

    select {
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        background-color: #AEBFC6;
        font-weight: bold;
        font-size: large;
    }

    select:focus {
        outline: none;
    }
</style>