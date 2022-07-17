let endpoint = 'http://127.0.0.1:9000';

export const getMovies = () => {
    return fetch(endpoint + '/movies')
        .then(response => response.json())
        .then(data => {
            return data;
        })
}

export const getNotifications = () => {
    return fetch(endpoint + '/notifications')
        .then(response => response.json())
        .then(data => {
            return data;
        })
}

export const removeNotification = (id) => {
    return fetch(endpoint + '/notification/' + id, {
        method: 'DELETE'
    })
    .then(response => {
        return response.text();
    })
}

export const subscribeToGenre = (genre) => {
    return fetch(endpoint + '/subscribe/' + genre, {
        method: 'POST'
    })
        .then(response => response.json())
        .then(data => {
            return data;
        })
}


export const unsubscribeFromGenre = (genre) => {
    return fetch(endpoint + '/unsubscribe/' + genre, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(data => {
            return data;
        })
}

export const getSubscriptions = () => {
    return fetch(endpoint + '/subscriptions')
        .then(response => response.json())
        .then(data => {
            return data;
        })
}