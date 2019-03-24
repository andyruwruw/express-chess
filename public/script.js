var app = new Vue({
  el: '#app',
  data: {
	items: [],
  },
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
  },
  created() {
	this.getItems();
  }
});
