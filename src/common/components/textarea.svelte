<!-- Textarea.svelte -->
<script>
    export let placeholder = 'Enter your text here';
    export let rows = 4;
    export let cols = 50;
    export let value = '';

    const handleChange = (event) => {
        value = event.target.value;
    };
</script>

<main>
    <textarea placeholder={placeholder} rows={rows} cols={cols} bind:value on:input={handleChange}></textarea>
</main>

<style>
    
</style>