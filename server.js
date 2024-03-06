// Use port number from the PORT environment variable or 3000 if not specified
console.log(process.env.PORT)
const port = process.env.PORT || 3000;

const express = require('express');
const app = express();
app.use(express.static(__dirname))
app.get('/', async(req, res) => {
	res.sendFile(__dirname + '/index.html');
});
app.listen(port, () => {
	console.log("Server successfully running on port " + port);
});