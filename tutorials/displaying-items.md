# Displaying Items

Now that we have an admin page to upload items for the museum, let's build the front page to display all the items in the museum.

## Front End HTML

To visualize all the items, modify `index.html` so that it contains the following:

```
  <div id="app" class="content">
    <section class="image-gallery">
      <div class="image" v-for="item in items">
        <h2>{{item.title}}</h2>
        <img :src="item.path" />
      </div>
  </div>
```

Here we create a section with the `image-gallery` class. Inside of this section will be a set of divs, each one with class `image`. The CSS in `styles.css` is setup to display this with a masonry format, which is a style of laying out images of different sizes, similar to Pinterest.

We use the `v-for` directive to loop through the items in the museum, showing each item with its title and photo.

## Front End JavaScript

The HTML page in `index.html` uses `script.js` for the Vue code. Let's edit `script.js` and add the following data:

```
  data: {
    items: [],
  },
```

This is just an array to hold all the items in the museum.

Next, add this `created` section:

```
  created() {
    this.getItems();
  },
```

This will run when Vue is loaded on the page and call the `getItems` function.

Now add this method:

```
  methods: {
    async getItems() {
      try {
        let response = await axios.get("/api/items");
        this.items = response.data;
        return true;
      } catch (error) {
        console.log(error);
      }
    },
  }
```

The `getItems` method uses the axios library to get the items from the server and store them in `items`. Because we use `await`, this needs to be an `async` method.

## Back End

On the back end, we need to support this new REST API endpoint for getting items. Add this to `server.js`:

```
// Get a list of all of the items in the museum.
app.get('/api/items', async (req, res) => {
  try {
    let items = await Item.find();
    res.send(items);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});
```

We use `Item.find()` to get the list of all of the items in the `items` collection, and then send them back to the browser. Notice that since we use `await` we need to use `async` for this method. We also use a `try/catch` block to catch any errors. If something goes wrong here, we assume it is a major error for our server, so we return a 500 error code.

## Testing

Since we earlier added some items to the database and verified they were stored properly, you should be able to restart the server:

```
node server.js
```

and then browse to localhost:3000 and see these items on the front page.
