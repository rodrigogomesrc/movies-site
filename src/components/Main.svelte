<script>    

    import Movies from './Movies.svelte';
    import Subscriptions from './Subscriptions.svelte';
    import Login from './Login.svelte';

    let from = "main component";
    let user = "";
    let logged = false;
    export let screen;
    const endpoint = 'http://127.0.0.1:9000';

    const login = (loginUser) => {
        user = loginUser;
        logged = true;
        onLogged();
    }

    const onLogged = () => {
        console.log("funcion after logged");
        const notification_source = new EventSourcePollyfill(endpoint + '/subscribe' + "/" + user, 
            {
                heartbeatTimeout: Number.MAX_SAFE_INTEGER
            }
        );
        console.log("notification source configured");

        notification_source.onmessage = function(event) {
            console.log(from, "notification_source.onmessage", event);
            let notification = JSON.parse(event.data);
            console.log(from, "notification_source.onmessage", notification);
        };

        console.log("after configuring the onmessage");
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