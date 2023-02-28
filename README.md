# React Authentication

![](https://healthitsecurity.com/images/site/features/_normal/GettyImages-1206964126.jpg)

## Overview

In this lesson, we'll learn how to integrate authentication into our React client, how to persist an authenticated user, and how to protect resources from unauthenticated users. This app was built with a React UI library called _Semantic UI_, but we'll only be focusing on integrating the `axios` calls.

## Getting Started

- `fork` and `clone`
- `npm install` to install our back-end dependencies
- `npm run dev` to spin up our Express server (it will be interacting with our database we set up in the [last lesson](https://github.com/SEI-R-1-9/u3_lesson_sequelize_auth))
- `cd client` to move into our front-end
- `npm install` to install our front-end dependencies
- `npm start` to spin up our React app

## Understanding The localStorage API

In order to persist a users token, we'll need to use something called `localStorage`. `localStorage` is an in-browser memory store.

### What Is localStorage?

> localStorage is an API that allows JavaScript sites and apps to save key/value pairs in a web browser with no expiration date. This means the data stored in the browser will persist even after the browser window is closed.

### How Does localStorage Work?

To use `localStorage` in your web applications, there are five methods to choose from:

1. `setItem()`: Add a key and value to localStorage
2. `getItem()`: Get stored items from localStorage
3. `removeItem()`: Remove an item by key from localStorage
4. `clear()`: Clear all localStorage
5. `key()`: Passed a number to retrieve the key of a localStorage

We'll utilize `localStorage` to save the users `JWT` once they've signed into our app.

## Frontend State and Security

Contrary to popular belief, most front-ends are not secure to the extent of our back-end data. The purpose of the front-end is to display information to a user. As long as our back-end is secure, the front-end will only conditionally display information based on certain criteria. With React, we'll use _state_ and a protected route to conditionally render specific parts of our UI once the user has successfully signed in. More often than not, your back-end server will have more resources available to perform expensive computations and logic checks. We'll use that along with React's fast UI updates to build a seamless application for our users.

### Managing Visibility With State

Open your `App.js` file located within the `client` directory. At the top of the component, you'll find **1** critical piece of state:

```js
const [user, setUser] = useState(null)
```

This state is going to control the visibility of _private_ components for our entire application.

We'll use the `user` state, to actually toggle the UI and store some kind of information about our user.

### Registering A User

Let's start by registering a user. Open the `Register` component located in the `pages` folder.

This component has been mostly filled out for you, however a very important aspect is still missing. Our `handleSubmit` function is currently incomplete:

```js
const handleSubmit = async (e) => {
  e.preventDefault()
}
```

In order to complete this function, we'll need to do a few things:

- Submit the users information to our back-end via a service function
- Reset the populated form to empty once the request completes successfully
- Redirect the user to the login page. **(Never sign in a user after registering!)**

We'll start by importing our `RegisterUser` function from `services`:

```js
import { RegisterUser } from '../services/Auth'
```

The `RegisterUser` function accepts one argument of `data`. This `data` argument will be an object with the following information about our user:

- name
- email
- password

Next we'll invoke this function in our `handleSubmit` and pass in the information from our form:

```js
await RegisterUser({
  name: formValues.name,
  email: formValues.email,
  password: formValues.password
})
```

After the API request succeeds, we'll reset the current state to it's initial value:

```js
setFormValues({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})
```

Finally, we'll redirect the user to our Sign In page with useNavigate:

```js
import { useNavigate } from 'react-router-dom'
```

```js
let navigate = useNavigate()
```

Back inside our handleSubmit...

```js
navigate('/signin')
```

At this point, you can try to register a user.

The final handleSubmit function in **Register** should look like this:

```js
const handleSubmit = async (e) => {
  e.preventDefault()
  await RegisterUser({
    name: formValues.name,
    email: formValues.email,
    password: formValues.password
  })
  setFormValues({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  navigate('/signin')
}
```

### Signing In A User

Now that our registration functionality is set up, we can focus on letting a user sign in to our application.

We'll start by providing `setUser` to the `SignIn` component as props in `App.js`:

```jsx
<SignIn setUser={setUser} />
```

We'll utilize this method to:

- Tell our protected route that someone is signed in.
- Update our UI to display different information in the `Nav` component.

Once we've passed this prop to `SignIn`, open the `SignIn` component and accept the prop (don't forget).
Just like the `Register` component, this one is just about done as well.

We need to make a few changes to this component before our app can function.

Start by importing `SignInUser` from `services`:

```js
import { SignInUser } from '../services/Auth'
```

`SignInUser` accepts one argument of `data`. Similar to Register, `data` is an object containing the following information:

- email
- password

In the `handleSubmit`, we'll invoke the `SignInUser` function, provide the `formValues` state as an argument, and capture the return value with a variable called `payload`:

```js
const payload = await SignInUser(formValues)
```

Next we'll reset the form once the request completes successfully:

```js
setFormValues({ email: '', password: '' })
```

We then take the `payload` and use it to update our `user` state in `App.js` with the `setUser` method we passed in as props:

```js
props.setUser(payload)
```

Once our user has been set, our user is temporarily authenticated simply by being signed in.

Finally, we'll redirect the user to a protected page with a URL of `/feed`. We'll need to import useNavigate again as well:

```js
import { useNavigate } from 'react-router-dom'
```

```js
let navigate = useNavigate()
```

Back inside our handleSubmit...

```js
navigate('/feed')
```

The final handleSubmit function in **SignIn** should look like this:

```js
const handleSubmit = async (e) => {
  e.preventDefault()
  const payload = await SignInUser(formValues)
  setFormValues({ email: '', password: '' })
  props.setUser(payload)
  navigate('/feed')
}
```

Now that our `handleSubmit` is set up, we should be able to sign in successfully. However, one problem: we never stored the users token!

### Storing the JWT

Open the `Auth.js` file located in `services`. We need to make a change to `SignInUser`.

In this function, our API is returning two things:

- a user object
- a JWT

We're already returning the `user` object from this function, however it's also a good idea to store the token at this point. Add the following to `SignInUser` **_before_** the return statement:

```js
localStorage.setItem('token', res.data.token)
```

Here, we're using the `localStorage` API to store the user's authentication token with a key of `token`. `setItem` takes two arguments. **The order matters**:

- Key to reference the data we store. In this case we're using `token`.
- Value to store. **(The value must always be a string)**

Now that we've set the ability to store the token, let's try signing in with the user you created earlier.

## Protected Routes

At this point, we should be automatically navigated to `http://localhost:3000/feed` once we sign in. However, our user could still navigate to routes without being signed in. We'll use our `user` state to conditionally render the components we want to keep hidden from unauthorized users.

> Protected Routes are routes that can only be accessed if a condition is met (usually, if user is properly authenticated). It returns the component or redirects a user to another route based on a set condition.

In `App.js`, let's pass our `user` state as prop to our Feed component...

```js
<Route path="/feed" element={<Feed user={user} />} />
```

Over in `Feed.js`, let's be sure and pass the prop in. We'll destructure it...

```js
const Feed = ({ user }) => {
...
```

We're going to wrap the JSX in our return statement in a ternary that checks if a) our user exists and b) that they are authenticated based on the `user` state. If authenticated, we'll show the posts on the feed! If not, we need to send our user back to the Sign In page.

First, let's set up that ternary. We want to check if both conditions are true, based on whether a `user` exists in state:

```js
return user ? (
  <div className="grid col-4">
    {posts.map((post) => (
      <div className="card" key={post.id}>
        <h3>{post.title}</h3>
        <div>
          <img src={post.image} alt="post"/>
        </div>
        <p>{post.body.substring(0, 80)}...</p>
      </div>
    ))}
  </div>
  ) : (
  // This is where we'll put our JSX that our unauthenticated user will see...
)
```

We'll need useNavigate again for this next part:

```js
import { useNavigate } from 'react-router-dom'
```

```js
let navigate = useNavigate()
```

Next, we'll set up the JSX for an unauthenticated user:

```js
) : (
    <div className="protected">
      <h3>Oops! You must be signed in to do that!</h3>
      <button onClick={()=> navigate('/signin')}>Sign In</button>
    </div>
  )
```

Let's try signing in again. Once you've signed in successfully, you should be redirected to the `/feed` path and a list of information should appear. Pay close attention to the navigation as well. The UI will change at this point.

Now that we can access the `Feed` component, we've completed our App! Well, not really. There's a slight problem. Refresh your browser and observe the behavior...

How about if we cheat and navigate directly to the `Feed` component by changing the URL?

This brings us to the next part of our lesson and one of the most important ones!

## Persisting Logged In Users

Nothing is more frustrating to a user than an application that constantly kicks them back to a log in screen when they refresh. Luckily, that's a simple fix.

Open the `App.js` file.

What we'll do here is add some logic to check if a token is already stored in localStorage. If it is, we'll make a request to a route in our back-end that will validate and decrypt the currently stored token. This decrypted token will contain the same information about the user that we stored after signing in.

We'll start by importing the `CheckSession` function from our auth service:

```js
import { CheckSession } from './services/Auth'
```

Next, we'll create a method called `checkToken` that will make a `GET` request to our back-end with the currently stored token to check it's validity:

```js
const checkToken = async () => {
  //If a token exists, sends token to localStorage to persist logged in user
}
```

Here, we'll invoke the `CheckSession` function and store the returned information in a variable called `user`:

```js
const user = await CheckSession()
```

Next, we'll store this returned user in state using the `setUser` method:

```js
setUser(user)
```

We now need a way to trigger this function once our app loads. Let's import `useEffect` from React.

```js
import { useState, useEffect } from 'react'
```

We'll utilize `useEffect` to check if a token exists currently. If and **only** if a token exists, we'll invoke our `checkToken` function:

```js
useEffect(() => {
  const token = localStorage.getItem('token')
  // Check if token exists before requesting to validate the token
  if (token) {
    checkToken()
  }
}, [])
```

Let's try refreshing one more time...

Uh-oh, it's still not working! Luckily it's a simple problem to solve. Right now, we are sending a request to our back-end to check the current token stored in localStorage... However, we never sent this token to the backend!

### Enter Interceptors

Lucky for us, we're using `axios`. `axios` has a really cool feature called `interceptors` that allows us to catch each request or response as we send or receive them and modify certain information in the request/response!

Open the `api.js` file located in `services`.

Let's add the following **above** our export of `Client` and **below** our `Client` instance:

```js
// Intercepts every request axios makes
Client.interceptors.request.use(
  (config) => {
    // Reads the token in localStorage
    const token = localStorage.getItem('token')
    // if the token exists, we set the authorization header
    if (token) {
      config.headers['authorization'] = `Bearer ${token}`
    }
    return config // We return the new config if the token exists or the default config if no token exists.
    // Provides the token to each request that passes through axios
  },
  (error) => Promise.reject(error)
)
```

With this bit of code we'll accomplish the following:

- Intercept every request our `Client`/instance of axios makes
- Read the configuration for the request
- Read the token in `localStorage`
- If the token exists, we modify the request headers and provide our token in the `authorization` header with the standard JWT format of `Bearer {token}`
- We then return the config so that the request can complete successfully
- The second function will give us back any errors that occur during a request as normal

Let's try refreshing one more time. You should now be able to access the `Feed` page successfully!

## Recap

In this lesson we learned how to integrate authentication and authorization into our client. Our client's view changes based on some kind of state that we store to track changes. Our client-facing application is not meant to be secure, thus we must rely on our back-end to make sure that the requests are legitimate and authorized.

## Resources

- [Local Storage MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
