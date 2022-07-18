<script>    
    import { onMount } from 'svelte';

    import Movies from './Movies.svelte';
    import Subscriptions from './Subscriptions.svelte';
    import Login from './Login.svelte';

    let from = "main component";
    let user = "";
    let logged = false;
    export let screen;

    onMount(async () => {

        
    });

    const login = (loginUser) => {
        user = loginUser;
        logged = true;
    }

</script>

<main>
    <div id="container">
        {#if logged}
        {#if screen === "movies"}
        <Movies user={user}/>
        {/if}
        {#if screen === "subscriptions"}
        <Subscriptions user={user}/>
        {/if}
        {:else}
        <Login login={login}/>
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