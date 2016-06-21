var express = require('express');
var _=require('underscore');
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
	res.json(todos);

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
	var body = req.body;
	if(body){
		body.id = nextId;
		todos.push(body);
		nextId = nextId + 1;
	}
	console.log('body',body);
	res.json(body);
});
app.listen(PORT , function(){
	console.log('Express server started on port :' + PORT);

});