"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 *  * This file contains functions that respond to user actions in the navigation bar, such as displaying stories, submitting new stories, and logging in.
 */


/** Show main list of all stories when click site name 
 *  Displays the main list of all stories when the site name is clicked.
*/
function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

// Shows the form to submit a new story when "submit" is clicked in the nav bar.
function navSubmitStoryClick(evt) {
  console.debug("navSubmitStoryClick", evt);
  hidePageComponents();
  $allStoriesList.show();
  $submitForm.show();
}

$navSubmitStory.on("click", navSubmitStoryClick);

/** Displays the user's favorite stories when "favorites" is clicked. */
function navFavoritesClick(evt) {
  console.debug("navFavoritesClick", evt);
  hidePageComponents();
  putFavoritesListOnPage();
}

$body.on("click", "#nav-favorites", navFavoritesClick);

/** Show My Stories on clicking "my stories" */

/** Displays the user's own stories when "my stories" is clicked. */
function navMyStories(evt) {
  console.debug("navMyStories", evt);
  hidePageComponents();
  putUserStoriesOnPage();
  $ownStories.show();
}

$body.on("click", "#nav-my-stories", navMyStories);

/* Shows the login/signup form when "login" is clicked */
function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
  $storiesContainer.hide()
}

$navLogin.on("click", navLoginClick);

/* Shows the user's profile when the profile link is clicked. */
function navProfileClick(evt) {
  console.debug("navProfileClick", evt);
  hidePageComponents();
  $userProfile.show();
}

$navUserProfile.on("click", navProfileClick);

/* Updates the nav bar to reflect the user being logged in.*/
function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").css('display', 'flex');;
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}
// Explanation of nav.js Logic
// Purpose: This file handles all user interactions with the navigation bar. 
// Each function responds to specific clicks and updates the UI accordingly.

// Why Hide Other Components? By hiding other elements before showing the new content, 
// the page remains clean and focused on the relevant section, reducing visual clutter.

// Why Update Nav on Login? When a user logs in, the navigation bar changes to show user-specific options, 
// such as their profile and a logout option. This function ensures the nav bar reflects the user's logged-in status.