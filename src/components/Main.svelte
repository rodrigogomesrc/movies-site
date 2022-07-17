<script>    
    import { onMount } from 'svelte';

    import Movies from './Movies.svelte';
    import Subscriptions from './Subscriptions.svelte';

    let from = "main component";
    export let screen;

    onMount(async () => {

        
    });

</script>

<main>
    <div id="container">
        {#if screen === "movies"}
        <Movies/>
        {/if}
        {#if screen === "subscriptions"}
        <Subscriptions />
        {/if}
    </div>
  
</main>

<style>

    #container {
        padding: 15px;
        max-width: 1200px;
        margin: 0 auto;
    }

</style>