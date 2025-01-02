<script>
    export let message = '';
    export let isOpen = false;
    export let focusInputId = ''; // ID of the input field to focus after closing

    function closeModal() {
        isOpen = false;
        // Focus back to the specified input field
        if (focusInputId) {
            const inputField = document.getElementById(focusInputId);
            if (inputField) {
                inputField.focus();
            }
        }
    }
</script>

<style>
    /* Modal styles */
    .modal {
        display: flex;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
        justify-content: center;
        align-items: center;
    }

    .hidden {
        display: none; /* Hidden when not open */
    }

    .modal-content {
        background-color: white;
        padding: 20px;
        border-radius: 5px;
        text-align: center;
    }

    button {
        margin-top: 10px;
    }
</style>

<div class="modal {isOpen ? '' : 'hidden'}">
    <div class="modal-content">
        <p>{message}</p>
        <button on:click={closeModal}>OK</button>
    </div>
</div>