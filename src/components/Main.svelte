<script>    

    import Movies from './Movies.svelte';
    import Subscriptions from './Subscriptions.svelte';
    import Login from './Login.svelte';
    import {onDestroy} from 'svelte';

    let user = "";
    let logged = false;
    export let screen;

    const login = (loginUser) => {
        user = loginUser;
        logged = true;
        onLogged();
    }

    const onLogged = () => {
        console.log("user", user);
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