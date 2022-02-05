// expressのセットアップ
const express = require("express")
const sqlite3 = require("sqlite3")

const app = express()
app.use(express.json())

const db = new sqlite3.Database("./twitter.db")

// Post and register the user Information
app.post("/users", (req, res) => {
	db.serialize(() => {
		const user = req.body
		db.get("SELECT * FROM users WHERE username = ?", user.username, (err, row) => {
			if (err !== null){
				console.log("In users, SELECT error ocurred")
			} else if (row !== null) {
				res.statusCode = 409
				res.end()
			} else if (row.username == user.username) {
				res.statusCode = 409
				res.end()
			}
		})
		db.run("INSERT INTO users (username, displayName) VALUES (?, ?)", user.username, user.displayName, (err) => {
			if (err !== null){
				console.log(err)
				res.statusCode = 500
				res.json(err)
			} else {
				res.end()
			}
		})
	})
})

// Get the list of the users Information
app.get("/users", (req, res) => {
	db.serialize(() => {
		db.all("SELECT * FROM users;", (err, rows) => {
			if (err !== null){
				console.log(err)
				res.statusCode = 500
				res.json(err)
			} else {
				const tasks = rows.map(row => {
					return {
						id: row.id,
						username: row.username,
						displayName: row.displayName
					}
				})
				res.json(tasks)
			}
		})
	})
})

// Get the user Information
app.get("/users/:username", (req, res) => {
	const username = String(req.params["username"])
	db.serialize(() => {
		db.get("SELECT * FROM users WHERE username = ?", username, (err, row) => {
			if (err !== null){
				console.log(err)
				res.statusCode = 500
				res.json(err)
			} else if (row === undefined){
				res.statusCode = 404
				res.end()
			} else {
				const user = {
					id: row.id,
					username: row.username,
					displayName: row.displayName
				}
				res.json(user)
			}
		})
	})
})

// Delete the user Information
app.delete("/users/:username", (req, res) => {
	const name = String(req.params["username"])
	db.serialize(() => {
		db.run("DELETE FROM users WHERE username = ?", name, (err) => {
			if (err !== null){
				console.log(err)
				res.statusCode = 404
				res.json(err)
			} else {
				res.end()
			}
		})
	})
})

// Post the tweet
app.post("/tweets", (req, res) => {
	db.serialize(() => {
		const tweet = req.body
		console.log(tweet)
		db.run("INSERT INTO tweets (userid, content) VALUES (?, ?)", tweet.userId, tweet.content, (err) => {
			if (err !== null) {
				console.log(err)
				res.statusCode = 500
				res.json(err)
			} else {
				res.end()
			}
		})
	})
})

// Get the list of tweets
app.get("/tweets", (req, res) => {
	db.serialize(() => {
		db.all("SELECT * FROM users JOIN tweets ON users.id == tweets.userId;", (err, rows) => {
			if (err !== null) {
				console.log(err)
				res.statusCode = 500
				res.json(err)
			} else {
				// correct execution
				const tweets = rows.map(row => {
					return {
						id: row.id,
						username: row.username,
						displayName: row.displayName,
						content: row.content
					}
				})
				res.json(tweets)
			}
		})
	})
})

// Get the tweet when the id is equal
app.get("/tweets/:id", (req, res) => {
	const id = Number(req.params["id"])
	db.serialize(() => {
		db.get("SELECT * FROM users JOIN tweets ON users.id == tweets.userId WHERE tweets.id = ?", id, (err, row) => {
			// Console.log(rows)
			if (err !== null) {
				console.log(err)
				res.statusCode = 500
				res.json(err)
			} else if (row === undefined) {
				res.statusCode = 404
				res.end()
			} else {
				const tweet = {
					id: row.id,
					username: row.username,
					displayName: row.displayName,
					content: row.content
				}
				res.json(tweet)
			}
		})
	})
})

// Delete the tweet
app.delete("/tweets/:id", (req, res) => {
	const id = Number(req.params["id"])
	db.serialize(() => {
		db.get("SELECT * FROM tweets WHERE id = ?", id, (err, row) => {
			if (err !== null) {
				console.log(err)
				res.statusCode = 500
				res.json(err)
			} else if (row === undefined) {
				res.statusCode = 404
				res.end()
			}
		})
		db.run("DELETE FROM tweets WHERE id = ?", id, (err) => {
			if (err !== null) {
				console.log(err)
				res.statusCode = 500
				res.json(err)
			} else {
				res.end()
			}
		})
	})
})

// サーバーの起動
app.listen(3000, () => {
    console.log(`server start`)
})
