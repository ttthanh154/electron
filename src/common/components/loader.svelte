<!-- Loader.svelte -->
<script>
    export let isLoading = false;
</script>

{#if isLoading}
<div class="loader active">
    <div class="loader-spinner"></div>
    <p>Waiting for exporting...</p>
</div>
{/if}

<style>
    .loader {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
        z-index: 9999; /* Ensure the loader is on top of everything */
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .loader.active {
        display: flex;
    }

    .loader-spinner {
        border: 8px solid #f3f3f3;
        border-top: 8px solid #5D7D8C;
        border-radius: 50%;
        width: 5em;
        height: 5em;
        animation: spin 2s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    p {
        margin-top: 10px;
        font-weight: bold;
        font-size: 1.2em;
        opacity: 0; /* Initially hidden */
        animation: fadeIn 3s ease infinite; /* Fade-in animation */
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
</style>

