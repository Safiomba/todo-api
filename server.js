var express = require('express');
var _= require('underscore');
var bodyParser = require('body-parser');
var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var nextId = 1;

app.use(bodyParser.json());

app.get('/', function(req,res){
	res.send('Todo API Root !');
});

app.get('/todos', function(req,res){
	var queryParams = req.query;
	var filteredTodos = todos;
	if(queryParams.hasOwnProperty('completed') && queryParams.completed ==='true'){
		filteredTodos = _.where(filteredTodos, {completed:true});
	}else if(queryParams.hasOwnProperty('completed') && queryParams.completed ==='false'){
		filteredTodos = _.where(filteredTodos, {completed:false});
	}
	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
		filteredTodos = _.filter(filteredTodos , function(todo){
			return todo.description.indexOf(queryParams.q) > -1 ;
		});
	}
	res.json(filteredTodos);

});

app.get('/todos/:id', function(req, res){
	//res.send('Asking for todo with id :' + req.params.id);
	var todo = _.find(todos, function(item){
		return item.id === parseInt(req.params.id,10);
	})
	if(todo){
		res.json(todo);
	}else{
		res.status(404).send();
	}	
});
app.post('/todos', function(req,res){
	var body = _.pick(req.body,'description' , 'completed');
	if(body){
		if( !_.isBoolean(body.completed) || !_.isString(body.description)){
			res.status(400).send();
		}
		body.id = nextId;
		todos.push(body);
		nextId = nextId + 1;
		res.json(body);
	}else {
		res.status(404).send();
	}
});
app.delete('/todos/:id',function(req,res){

	var todoId = parseInt(req.params.id,10);
	var todo = _.findWhere(todos,{id:todoId});
	if(!todo){
		res.status(404).json({"error": "no todo find with that id"});
	}else {
		todos = _.without(todos, todo);
		res.json(todo);
	}
});
app.put('/todos/:id',function(req,res){
	var todoId = parseInt(req.params.id,10);
	var body = _.pick(req.body,'description' , 'completed');
	var todo = _.findWhere(todos,{id:todoId});
	if(!todo){
		return res.status(404).send();
	}
	var validAtttributes = {};
	if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
		validAtttributes.completed = body.completed
	}else if(body.hasOwnProperty('completed')){
		res.status(400).send()
	}
	if(body.hasOwnProperty('description') && _.isString(body.description)){
		validAtttributes.description = body.description
	}else if(body.hasOwnProperty('description')){
		res.status(400).send()
	}
	_.extend(todo, validAtttributes);
	res.json(todo);



});
app.listen(PORT , function(){
	console.log('Express server started on port :' + PORT);

});