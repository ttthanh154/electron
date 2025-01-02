<!-- Input.svelte -->
<script>
    export let type; // string
    export let value; // number
    export let step; // number
    export let min; // number
    export let max; // number
    export let label; // string
    export let id; // string


    const handleChange = (event) => {
        let newValue = parseFloat(event.target.value);
    
        if (isNaN(newValue)) {
            return value = min; // Return the initial value if newValue is NaN
        }

        if (newValue > max) {
            value = max;
        } else if (newValue < max && event.target.value.length <= max.toString().length) {
            value = newValue;
        }
    };

    const increment = () => {
        let floatNumber = Math.min(max, parseFloat(value) + parseFloat(step)).toFixed(1);
        
        if (Number.isInteger(parseFloat(floatNumber))) {
            let integerNumber = parseFloat(floatNumber);
            return value = integerNumber;
        }
        value = floatNumber;
    };

    const decrement = () => {
        let floatNumber = Math.max(min, parseFloat(value) - parseFloat(step)).toFixed(1);
        
        if (Number.isInteger(parseFloat(floatNumber))) {
            let integerNumber = parseFloat(floatNumber);
            return value = integerNumber;
        }
        value = floatNumber;
    };
</script>

{#if type === 'number'}
    <div class="number-container">
        <label class='input-label' for={id}>{label}</label>
        <div class="custom-number-input">
            <input class='number-input' id={id} type="number" bind:value={value} on:input={handleChange} step={step} min={min} max={max}>
            <div class='input-arrow'>
                <button on:click={increment}><i class="fa-solid fa-arrow-up"></i></button>
                <button on:click={decrement}><i class="fa-solid fa-arrow-down"></i></button>
            </div>
        </div>
    </div>
{:else if type === 'file-text'}
    <input class='file-text-input' type='text' value={value} disabled placeholder="Choose a file..." on:input={handleChange}>
{:else}
    <input class='input' type={type} value={value} on:input={handleChange}>
{/if}

<style>
    .number-container {
        display: flex;
        justify-content: center;
        gap: 1em;
    }

    .input-label {
        font-weight: bold;
        font-size: larger;
    }

    .file-text-input {
        background-color: 1px solid red;
    }

    input[type=text] {
        background-color: #5D7D8C;
        color: white;
        outline: none;
        border: none;
    }

    ::placeholder {
        color: #FFFFFF;
        opacity: 1; /* Firefox */
    }

    ::-ms-input-placeholder { /* Edge 12 -18 */
        color: FFFFFF;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    .custom-number-input {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5em;
    }

    .custom-number-input button {
        background: #AEBFC6;
        border: none;
        cursor: pointer;
    }

    .custom-number-input button i {
        padding: 2px 0px;
    }

    .custom-number-input button:first-child {
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
    }

    .custom-number-input button:last-child {
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;    
    }

    .custom-number-input button:first-child:active {
        background-color: #CED9DB;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
        opacity: 0.8;
    }

    .custom-number-input button:last-child:active {
        background-color: #CED9DB;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
        opacity: 0.8;
    }

    .input-arrow {
        display: flex;
        flex-direction: column;
        gap: 0.4em;
        background-color: #AEBFC6;
        border-radius: 5px;
    }

    .number-input {
        display: inline-flex;
        align-items: center;
        width: 60px;
        height: 45px;
        text-align: center;
        border-radius: 5px;
        background-color: #AEBFC6;
    }

    input[type=number] {
        color: #000000 !important;
        background-color: #AEBFC6 !important;
        border: none;
        width: 100%;
        padding: 0;
        outline: none;
        font-size: large;
        font-weight: bold;
    }
</style>