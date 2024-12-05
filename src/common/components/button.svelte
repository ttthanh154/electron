<script>
    let buttonProps = {
        // Setting style class
    class:[$$restProps.class]
    }
</script>

<main>
    <button on:click
    on:mouseenter
    on:mouseleave
    {...buttonProps}>
    <slot/>
    </button>
</main>

<style>
</style>

