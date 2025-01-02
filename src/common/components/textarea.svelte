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
    textarea {
        padding: 0.5em; 
        font-size: 1em; 
        background-color: #CED9DB;
        border: 1px solid #FFFFFF;
        border-radius: 5px;
        resize: none;
    }

    textarea:focus {
        outline: none !important;
        border: 1px solid #000000;
    }
</style>