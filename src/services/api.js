const endpoint = 'http://127.0.0.1:9000';

export const getMovies = async () => {
    const response = await fetch(endpoint + '/movies');
    const data = await response.json();
    return data;
}

export const getNotifications = async (user) => {
    const response = await fetch(endpoint + '/notifications' + "/" + user);
    const data = await response.json();
    return data;
}

export const removeNotification = async (id, user) => {
    const response = await fetch(endpoint + '/notification/' + id + "/" + user, {
        method: 'DELETE'
    });
    return await response.text();
}

export const subscribeToGenre = async (genre, user) => {
    const data = await fetch(endpoint + '/subscribe/' + genre + "/" + user, {
        method: 'POST'
    });
    return await data.text();
}


export const unsubscribeFromGenre = async (genre, user) => {
    const response = await fetch(endpoint + '/unsubscribe/' + genre + "/" + user, {
        method: 'GET'
    });
    return await response.text();
}

export const getSubscriptions = async (user) => {
    const response = await fetch(endpoint + '/subscriptions' + "/" + user);
    const data = await response.json();
    return data;
}