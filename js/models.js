"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {
    /**
     * Represents a story.
     * - Stores data about a single story (title, author, URL, etc.)
     * - Provides methods to process story data (e.g., extract hostname).
     */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }
  
  /**
   * Extracts the hostname from the URL for display purposes.
   * Example: If URL is 'https://example.com/article', this returns 'example.com'.
   * 
   *  Why:
   * - Provides a more concise view of where the story originates from.
   */
  getHostName() {
    return new URL(this.url).host;
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 * - Represents a list of stories.
 * - Handles fetching, adding, and removing stories using API calls. 
 */
class StoryList {
  constructor(stories) {
    this.stories = stories; // Array of Story instances
  }
  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */


   
  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    /**
       * Fetches stories from the API and returns an instance of StoryList.
       * Logic:
       * - Static methods are called on the class itself, not on an instance. This makes sense here 
       *   because getting a list of stories is independent of any specific instance of StoryList.
      */
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

   /**
   * Adds a new story to the list and updates the API.
   * @param {User} user - The user who is adding the story.
   * @param {Object} storyData - Contains title, author, and URL of the new story.
   * 
   * Logic:
   * - Updates the local list of stories and also sends a request to the API.
   * - Keeps user-specific lists (e.g., their own stories) in sync.
   */

  async addStory(user, { title, author, url }) {
    const token = user.loginToken;
    const response = await axios({
      method: "POST",
      url: `${BASE_URL}/stories`,
      data: { token, story: { title, author, url } },
    });

    const story = new Story(response.data.story);
    this.stories.unshift(story);
    user.ownStories.unshift(story);

    return story;
  }


   /**
   * Removes a story from both the API and the local list.
   * @param {User} user - The user who is removing the story.
   * @param {string} storyId - ID of the story to be removed.
   * 
   * Logic:
   * - Makes an API call to remove the story from the server.
   * - Also updates local lists to ensure consistency, in that it keeps data consistent between client and server.
   */

  async removeStory(user, storyId) {
    const token = user.loginToken;
    await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "DELETE",
      data: { token: user.loginToken }
    });

    // filter out the story whose ID we are removing
    this.stories = this.stories.filter(story => story.storyId !== storyId);

    // do the same thing for the user's list of stories & their favorites
    user.ownStories = user.ownStories.filter(s => s.storyId !== storyId);
    user.favorites = user.favorites.filter(s => s.storyId !== storyId);
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
    - Represents a user, with methods for logging in, signing up, and managing favorites.
    - Contains data about the user's stories and favorite stories.
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.
    * Logs in an existing user via the API.
    * Returns an instance of User.
   
    * - username: an existing user's username
    * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *  we can log them in automatically. This function does that
   * Logs in a user based on stored credentials (token, username).
   * Returns an instance of User or null on failure.
   * .
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  /** Add a story to the list of user favorites and update the API
   * - story: a Story instance to add to favorites
   */

  async addFavorite(story) {
    this.favorites.push(story);
    await this._addOrRemoveFavorite("add", story)
  }

  /** Remove a story to the list of user favorites and update the API
   * - story: the Story instance to remove from favorites
   */

  async removeFavorite(story) {
    this.favorites = this.favorites.filter(s => s.storyId !== story.storyId);
    await this._addOrRemoveFavorite("remove", story);
  }

  /** Update API with favorite/not-favorite.
   *   - newState: "add" or "remove"
   *   - story: Story instance to make favorite / not favorite
   * */

  async _addOrRemoveFavorite(newState, story) {
    const method = newState === "add" ? "POST" : "DELETE";
    const token = this.loginToken;
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: method,
      data: { token },
    });
  }

  /**
   * Checks if a story is in the user's favorites.
   * @param {Story} story - The story to check.
   * @returns {boolean} True if the story is a favorite, false otherwise.
   */

  isFavorite(story) {
    return this.favorites.some(s => (s.storyId === story.storyId));
  }
}
// Explanation of models.js Logic
// Why Classes? Classes allow encapsulating data and behavior related to stories and users. 
// This keeps the logic modular and makes it easy to manage related operations.
// 
// Why Static Methods? Static methods, like getStories(), work on the class itself, not specific instances. 
// This makes them great for tasks like fetching data that isn't tied to any particular StoryList object.

// Why Use Constructors? Constructors make it easy to create new instances 
// with all necessary properties, like a user's favorites or stories.