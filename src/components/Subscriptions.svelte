<script>
    import Subscription from "./Subscription.svelte";
    import Subscribe from "./Subscribe.svelte";
    import Notification from "./Notification.svelte";
    import MoviesNotificationHeader from "./MoviesNotificationHeader.svelte";

    import { onMount } from 'svelte';
    import { getNotifications, 
        removeNotification, 
        subscribeToGenre, 
        unsubscribeFromGenre, 
        getSubscriptions } from '../services/api';

    export let user;
    let notifications = [];
    let subscriptions = [];

    onMount(async () => {
        console.log("user", user);
        notifications = await getNotifications(user);
        subscriptions = await getSubscriptions(user);
    });

    const delNotification = async (id) => {
        let response = await removeNotification(id, user);
        notifications = await getNotifications(user);
       
    };

    const delSubscription = async (id) => {
        let response = await unsubscribeFromGenre(id, user);
        subscriptions = await getSubscriptions(user);
    };

    const subscribe = async (genre) => {
        let response = await subscribeToGenre(genre, user);
        subscriptions = await getSubscriptions(user);
    };

</script>

<main>
    <h1 class="title">Inscrições</h1>
    <div id="sides-holder">
        <div id="left-side" class="side">
            <h2>Adicionar Inscrição</h2>
            <Subscribe subscribe={subscribe} user={user}/>
            <h2>Subscrições</h2>
            {#each subscriptions as genre, index}
            <Subscription genre={genre} unsubscribe={delSubscription} />
            {/each}

        </div>
        <div id="right-side" class="side">
            <h2>Notificações</h2>
            <MoviesNotificationHeader />
            {#each notifications as notification, index}
            <Notification movie={notification} delNotification={delNotification}/>
            {/each}
            
        </div>
    </div>

</main>


<style>

    #sides-holder {
        display: flex;
        justify-content: space-around;
        width: 100%;
        padding: 10px;
    }

    .side {
        width: 100%;
        padding: 15px;
    }

    #left-side {
        margin-right: 10px;
    } 

    #right-side {
        margin-left: 10px;
    }

</style>