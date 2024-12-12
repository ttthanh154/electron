<script>
    let buttonProps = {
        // Setting style class
    class:[$$restProps.class]
    }
</script>

<button 
    on:click
    on:mouseenter
    on:mouseleave
    {...buttonProps}>
    <slot/>
</button>

<style>
</style>

