var express = require('express');
var _ = require('underscore');
var bcrypt = require('bcrypt-nodejs');
var bodyParser = require('body-parser');
var CONSTANTS = require('./constants.js');
var db = require('./db.js');
var middleware = require('./middleware.js')(db);
var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var nextId = 1;

app.use(bodyParser.json()); // like interceptor.


app.get('/', function(req, res) {
	res.send('Todo API Root !')
});
/*Todo CRUD operations*/
app.get('/todos', middleware.requireAuthentication, function(req, res) {
	var query = req.query;
	var where = {
		userId: req.user.id
	};
	if (query.hasOwnProperty(CONSTANTS.COMPLETED) && query.completed === 'true') {
		where.completed = true;

	} else if (query.hasOwnProperty(CONSTANTS.COMPLETED) && query.completed === 'false') {
		where.completed = false;
	}
	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%' + query.q + '%'
		}
	}

	db.todo.findAll({
		where
	}).then(function(todos) {
		if (todos) {
			res.json(todos);
		} else {
			res.status(404).send();
		}

	}, function(e) {
		res.status(500).json(e);
	});

});
// Get todo by id.
app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var where = {
		id: todoId,
		userId: req.user.id
	};
	db.todo.findOne({
		where
	}).then(function(todo) {
		if (todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).json(e);
	});
});
// Post todo
app.post('/todos', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, CONSTANTS.DESCRIPTION, CONSTANTS.COMPLETED);
	db.todo.create(body).then(function(todo) {
		req.user.addTodo(todo).then(function() {
			return todo.reload();
		}).then(function(todo) {
			res.json(todo.toJSON());
		});
	}, function(e) {
		res.status(400).json(e);

	});
});
//DELETE todo using id.
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {

	var todoId = parseInt(req.params.id, 10);
	var where = {
		id: todoId,
		userId: req.user.id
	};
	db.todo.destroy({
		where
	}).then(function(affectedRows) {
		if (affectedRows === 0) {
			res.status(404).json({
				"error": "no todo find with that id:" + todoId
			});
		} else {
			res.status(204).send();
		}
	}, function(e) {
		res.status(500).json({
			"error": "no todo find with that id"
		});
	});
});
// UPDATE todo.
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	body = _.pick(req.body, CONSTANTS.DESCRIPTION, CONSTANTS.COMPLETED);
	var attributes = {};
	var where = {
		id: todoId,
		userId: req.user.id
	};
	if (body.hasOwnProperty(CONSTANTS.COMPLETED)) {
		attributes.completed = body.completed
	}
	if (body.hasOwnProperty(CONSTANTS.DESCRIPTION)) {
		attributes.description = body.description
	}
	db.todo.findOne({
		where
	}).then(function(todo) {
		if (todo) {
			todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());
			}, function(e) {
				res.status(400).json(e);
			})
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	});
});
/**********************************USER CRUD OPERATIONS ************************************************************************/
app.post('/users', function(req, res) {
	var body = _.pick(req.body, CONSTANTS.EMAIL, CONSTANTS.PASSWORD);
	db.user.create(body).then(function(user) {
		res.json(user.toPublicJSON());
	}, function(e) {
		res.status(400).json(e);

	});
});

app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, CONSTANTS.EMAIL, CONSTANTS.PASSWORD);
	var userInstance;
	db.user.authenticate(body).then(function(user) {
		var token = user.generateToken('authentication');
		userInstance = user;
		return db.token.create({
			token: token
		});
	}).then(function(tokenInstance) {
		res.header('Auth', tokenInstance.token).json(userInstance.toPublicJSON());
	}).catch(function() {
		res.status(401).json();
	});
});

app.delete('/users/login', middleware.requireAuthentication, function(req, res) {
	req.token.destroy().then(function() {
		res.status(204).send();
	}).catch(function() {
		res.status(500).send();
	});
});

sequelize.sync({
	force: true
}).then(function() {
	app.listen(PORT, function() {
		console.log('Express server started on port :' + PORT);

	});

});