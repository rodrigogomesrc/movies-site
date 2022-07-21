<script>    
    import Header from "./Header.svelte";
    import Main from "./Main.svelte";
    import {onMount} from 'svelte';

    let openedScreen = "subscriptions";
    let logged = false;
    let user = "";

    const openMovieScreen = () => {
        openedScreen = "movies";
    };

    const openSubscriptionScreen = () => {
        openedScreen = "subscriptions";
    };

    const toggleScreen = () => {
        if (openedScreen === "movies") {
            openSubscriptionScreen();
        } else {
            openMovieScreen();
        }
    };

    const login = (loginUser) => {
        user = loginUser;
        logged = true;
        onLogged();
    }

    const onLogged = () => {
        sessionStorage.setItem('logged','true')
        sessionStorage.setItem('user', user)

    }

    const onLogout = () => {
        sessionStorage.setItem('logged','false')
        user = "";
        logged = false;
    }

    onMount(() => {
        let loggedState = sessionStorage.getItem('logged');
        let loggedUser = sessionStorage.getItem('user');
        if(loggedState == 'true'){
            logged = true;
        }
        if(loggedUser){
            user = loggedUser;
        }
    });

    

</script>

<main>
    <Header toggleScreen={toggleScreen} logged={logged} logout={onLogout}/>
    <Main screen={openedScreen} logged={logged} user={user} login={login} />
</main>

<style>



</style>