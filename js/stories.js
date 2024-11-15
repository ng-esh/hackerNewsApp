"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories(); // Fetches stories from the server
  $storiesLoadingMsg.remove();  // Removes the loading message

  putStoriesOnPage();  // Displays the stories on the page
}

/**
 * Creates the HTML structure for an individual story.
 * @param {Story} story - An instance of the Story class.
 * @param {boolean} showDeleteBtn - Whether to show the delete button for this story.
 * 
 * Logic:
 * - Creates a list item with the story details (title, author, etc.).
 * - Optionally adds a delete button and a star icon for favoriting/unfavoriting.
 */
function generateStoryMarkup(story, showDeleteBtn = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  // if a user is logged in, show favorite/not-favorite star
  const showStar = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
        <div>
        ${showDeleteBtn ? getDeleteBtnHTML() : ""}
        ${showStar ? getStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <div class="story-author">by ${story.author}</div>
        <div class="story-user">posted by ${story.username}</div>
        </div>
      </li>
    `);
}

/** Make delete button HTML for story 
 * /** Generates the HTML for the delete button. */
function getDeleteBtnHTML() {
  return `
      <span class="trash-can">
        <i class="fas fa-trash-alt"></i>
      </span>`;
}

/** Make favorite/not-favorite star for story */
function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story); // Checks if the story is favorited
  const starType = isFavorite ? "fas" : "far"; // Uses different star icons based on state
  return `
      <span class="star">
        <i class="${starType} fa-star"></i>
      </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page.
 * /** Fetches stories and displays them on the page. */
function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty(); // Clears any existing stories

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story); // Adds the story to the page
  }

  $allStoriesList.show();  // Displays the list of stories
}

/** Handle deleting a story. */

async function deleteStory(evt) {
  console.debug("deleteStory");

  const $closestLi = $(evt.target).closest("li"); // Finds the closest list item (story)
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId);  // Removes the story from the server and local list

  // re-generate story list
  await putUserStoriesOnPage(); // Updates the user's stories on the page
}

$ownStories.on("click", ".trash-can", deleteStory);

/** Handle submitting new story form. */
async function submitNewStory(evt) {
  console.debug("submitNewStory");
  evt.preventDefault();

  // grab all info from form
  const title = $("#create-title").val();
  const url = $("#create-url").val();
  const author = $("#create-author").val();
  const username = currentUser.username
  const storyData = { title, url, author, username };

  const story = await storyList.addStory(currentUser, storyData);  // Adds the story to the server

  const $story = generateStoryMarkup(story); // Generates HTML for the new story
  $allStoriesList.prepend($story);  // Adds it to the top of the list

  // hide the form and reset it
  $submitForm.slideUp("slow");
  $submitForm.trigger("reset");
}

$submitForm.on("submit", submitNewStory);

/******************************************************************************
 * Functionality for list of user's own stories, 
 * Displays the user's stories on the page.
 */
function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  $ownStories.empty(); // Clears any existing content

  if (currentUser.ownStories.length === 0) {
    $ownStories.append("<h5>No stories added by user yet!</h5>");  // Shows a message if no stories
  } else {
    // loop through all of users stories and generate HTML for them
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true); // Generates markup with delete button
      $ownStories.append($story);
    }
  }

  $ownStories.show();  // Displays the user's stories
}

/******************************************************************************
 * Functionality for favorites list and starr/un-starr a story
 */

/** Put favorites list on page. */
function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");

  $favoritedStories.empty(); // Clears the existing list

  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h5>No favorites added!</h5>"); // Shows a message if no favorites
  } else {
    // loop through all of users favorites and generate HTML for them
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story); // Generates HTML for each favorite
      $favoritedStories.append($story);
    }
  }

  $favoritedStories.show(); // Displays the list of favorites
}

/** Handle favorite/un-favorite a story */

async function toggleStoryFavorite(evt) {
  console.debug("toggleStoryFavorite");

  const $tgt = $(evt.target); // Gets the clicked element
  const $closestLi = $tgt.closest("li"); // Finds the closest story element
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId); // Finds the story object

  // see if the item is already favorited (checking by presence of star)
  if ($tgt.hasClass("fas")) {
    // currently a favorite: remove from user's fav list and change star
    await currentUser.removeFavorite(story);
    $tgt.closest("i").toggleClass("fas far"); // Toggles between filled and outlined star
  } else {
    // currently not a favorite: do the opposite
    await currentUser.addFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  }
}

$storiesLists.on("click", ".star", toggleStoryFavorite);

// Explanation of stories.js Logic
// Purpose: This file focuses on fetching and displaying stories, 
// handling user story actions, and updating the UI.

// Why Use Global Story List? The global variable storyList makes it easy 
// to access and manipulate the list of stories across different functions.

// Why Use Markup Generators? Functions like generateStoryMarkup() 
// create consistent HTML for displaying stories. This keeps the code modular and easy to maintain.

// Form Handling and Story Management: The app integrates user interactions like adding, deleting, and favoriting 
// stories with API calls to keep data in sync.