"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance 
/** Handles user login and updates the UI if successful. */
async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // Calls User.login to authenticate and get user data
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset"); // Clears the form

  saveUserCredentialsInLocalStorage();  // Saves credentials to localStorage for auto-login
  updateUIOnUserLogin(); // Updates the UI to show user-specific features
}

$loginForm.on("submit", login);

/** Handle signup form submission. */
async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // Registers a new user
  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage(); // Saves credentials for next visit
  updateUIOnUserLogin();  // Updates UI

  $signupForm.trigger("reset"); // Clears form inputs
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear(); // Removes user data from localStorage
  location.reload(); // Refreshes the page to reset state
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */
function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users & profiles
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */
async function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  hidePageComponents(); // Hides other components

  // re-display stories (so that "favorite" stars can appear)
  putStoriesOnPage(); // Displays stories
  $allStoriesList.show(); // Shows the main story list

  updateNavOnLogin(); // Updates nav bar to reflect login status
  generateUserProfile(); // Displays user profile data
  $storiesContainer.show()
}

/** Show a "user profile" part of page built from the current user's info. */

function generateUserProfile() {
  console.debug("generateUserProfile");

  $("#profile-name").text(currentUser.name);
  $("#profile-username").text(currentUser.username);
  $("#profile-account-date").text(currentUser.createdAt.slice(0, 10));  // Formats date
}

// Explanation of user.js Logic
// Purpose: This file manages user authentication, saving credentials, 
// and handling UI updates related to user state.

// Why Save Credentials? Storing login credentials in localStorage enables automatic login, 
// enhancing user experience.

// Why Separate Login and Signup? These processes are different in terms of API requests, 
// so separating them simplifies logic and debugging.