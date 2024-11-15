"use strict";

// So we don't have to keep re-finding things on page, find DOM elements once:
// Cache commonly used DOM elements to avoid repeatedly finding them
const $body = $("body");

const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");
const $favoritedStories = $("#favorited-stories");
const $ownStories = $("#my-stories");
const $storiesContainer = $("#stories-container")


const $storiesLists = $(".stories-list");


// Forms and navigation bar elements
const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");

const $submitForm = $("#submit-form");

const $navSubmitStory = $("#nav-submit-story");
const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");
const $userProfile = $("#user-profile");


/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 

* Hides all major components on the page. Useful for displaying only one section at a time.
* 
* Logic:
* - This function clears out the screen before showing a new component.
* - Useful for page transitions and keeping only relevant elements visible to the user.
*/

function hidePageComponents() {
  const components = [
    $storiesLists,
    $submitForm,
    $loginForm,
    $signupForm,
    $userProfile
  ];
  components.forEach(c => c.hide());
}

/** Overall function to kick off the app. */

/**
 * Main function that runs when the app starts.
 * - It checks if a user is already logged in and retrieves stored data if available.
 * - It loads stories from the server to display to all users.
 * - If a user is logged in, it updates the page to reflect the user-specific content.
 * 
 * Logic:
 * - Splitting tasks like fetching data, checking login status, and updating UI into smaller, 
 *   individual tasks keeps this function focused and manageable.
 */
async function start() {
  console.debug("start");

  // "Remember logged-in user" and log in, if credentials in localStorage
  await checkForRememberedUser();
  await getAndShowStoriesOnStart();

  // if we got a logged-in user
  if (currentUser) updateUIOnUserLogin();
}

// Once the DOM is entirely loaded, begin the app


console.warn("HEY STUDENT: This program sends many debug messages to" +
  " the console. If you don't see the message 'start' below this, you're not" +
  " seeing those helpful debug messages. In your browser console, click on" +
  " menu 'Default Levels' and add Verbose");
  // Start the app when the DOM is fully loaded
  $(start);

  // Explanation of main.js Logic
  // Purpose: The main.js file serves as the entry point for the app, responsible for setting up and managing the overall behavior of the page when it loads.
  // Why Hide Components: Hiding elements ensures that only relevant sections are visible to users. This prevents confusion and makes for a smoother user experience when switching views.
  // Why Separate Start Logic: By breaking down tasks like fetching stories and updating UI, it becomes easier to maintain and modify the app's behavior without causing unintended side effects.