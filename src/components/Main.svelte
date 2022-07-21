<script>    

    import Movies from './Movies.svelte';
    import Subscriptions from './Subscriptions.svelte';
    import Login from './Login.svelte';

    export let user;
    export let logged = false;
    export let screen;
    export let login;

    
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