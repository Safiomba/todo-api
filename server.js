var express = require('express');
var _ = require('underscore');
var constants = require('./constants.js');
var bodyParser = require('body-parser');
var db = require('./db.js');
var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var nextId = 1;

app.use(bodyParser.json());


app.get('/', function(req, res) {
	res.send('Todo API Root !')
});

app.get('/todos', function(req, res) {
	var query = req.query;
	var where = {};
	if (query.hasOwnProperty(constants.completed) && query.completed === 'true') {
		where.completed = true;

	} else if (query.hasOwnProperty(constants.completed) && query.completed === 'false') {
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
	/*
	var filteredTodos = todos;
	if (queryParams.hasOwnProperty(constants.completed) && queryParams.completed === 'true') {
		filteredTodos = _.where(filteredTodos, {
			completed: true
		});
	} else if (queryParams.hasOwnProperty(constants.completed) && queryParams.completed === 'false') {
		filteredTodos = _.where(filteredTodos, {
			completed: false
		});
	}
	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
		filteredTodos = _.filter(filteredTodos, function(todo) {
			return todo.description.indexOf(queryParams.q) > -1;
		});
	}
	res.json(filteredTodos);*/

});
app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	db.todo.findById(todoId).then(function(todo) {
		if (todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).json(e);
	});
	/*var todo = _.find(todos, function(item) {
		return item.id === parseInt(req.params.id, 10);
	})
	if (todo) {
		res.json(todo);
	} else {
		res.status(404).send();
	}*/
});
app.post('/todos', function(req, res) {
	var body = _.pick(req.body, constants.description, constants.completed);
	db.todo.create(body).then(function(todo) {
		res.json(todo.toJSON());
	}, function(e) {
		res.status(400).json(e);

	});
	// if (body) {
	// 	if (!_.isBoolean(body.completed) || !_.isString(body.description)) {
	// 		res.status(400).send();
	// 	}
	// 	body.id = nextId;
	// 	todos.push(body);
	// 	nextId = nextId + 1;
	// 	res.json(body);
	// } else {
	// 	res.status(404).send();
	// }
});
app.delete('/todos/:id', function(req, res) {

	var todoId = parseInt(req.params.id, 10);
	var where = {};
	where.id = todoId;
	db.todo.destroy({
		where
	}).then(function(affectedRows) {
		res.json(affectedRows);
	}, function(e) {
		res.status(404).json({
			"error": "no todo find with that id"
		});
	});
	/*var todo = _.findWhere(todos, {
		id: todoId
	});*/
	/*if (!todo) {
		res.status(404).json({
			"error": "no todo find with that id"
		});
	} else {
		todos = _.without(todos, todo);
		res.json(todo);
	}*/
});
app.put('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, constants.description, constants.completed);
	var todo = _.findWhere(todos, {
		id: todoId
	});
	if (!todo) {
		return res.status(404).send();
	}
	var validAtttributes = {};
	if (body.hasOwnProperty(constants.completed) && _.isBoolean(body.completed)) {
		validAtttributes.completed = body.completed
	} else if (body.hasOwnProperty(constants.completed)) {
		res.status(400).send()
	}
	if (body.hasOwnProperty(constants.description) && _.isString(body.description)) {
		validAtttributes.description = body.description
	} else if (body.hasOwnProperty(constants.description)) {
		res.status(400).send()
	}
	_.extend(todo, validAtttributes);
	res.json(todo);
});

sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express server started on port :' + PORT);

	});

});