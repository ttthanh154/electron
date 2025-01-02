<!-- Tooltip.svelte -->
<script>
    export let text = 'Tooltip Text';
    export let position = 'top-left'; // Default position is top-left
</script>

<style>
    .tooltip {
        position: relative;
        display: inline-block;
    }

    .tooltip .tooltiptext {
        visibility: hidden;
        width: 120px;
        background-color: black;
        color: #fff;
        text-align: center;
        padding: 5px 0;
        border-radius: 6px;
        position: absolute;
        z-index: 1;
        margin: 5px; /* Add margin around the tooltip */
    }

    .tooltip:hover .tooltiptext {
        visibility: visible;
    }

    .top {
        bottom: 100%; /* Position above */
        left: 50%;
        transform: translateX(-50%);
    }

    .bottom {
        top: 100%; /* Position below */
        left: 50%;
        transform: translateX(-50%);
    }

    .left {
        top: 50%;
        right: 100%; /* Position to the left */
        transform: translateY(-50%);
    }

    .right {
        top: 50%;
        left: 100%; /* Position to the right */
        transform: translateY(-50%);
    }

    .tooltip .tooltiptext::after {
        content: " ";
        position: absolute;
        border-width: 5px;
        border-style: solid;
        margin-left: -5px; /* Center the arrow */
    }

    .top::after {
        top: 100%; /* Arrow points down */
        left: 50%;
        border-color: black transparent transparent transparent; /* Arrow color */
    }

    .bottom::after {
        bottom: 100%; /* Arrow points up */
        left: 50%;
        border-color: transparent transparent black transparent; /* Arrow color */
    }

    .left::after {
        left: 104%; /* Arrow points right */
        top: 50%;
        border-color: transparent transparent transparent black; /* Arrow color */
        margin-top: -5px; /* Center the arrow vertically */
    }

    .right::after {
        right: 100%; /* Arrow points left */
        top: 50%;
        border-color: transparent black transparent transparent; /* Arrow color */
        margin-top: -5px; /* Center the arrow vertically */
    }
</style>

<div class="tooltip">
    <div class="tooltiptext {position}">
        {text}
    </div>
    <slot></slot>
</div>