var express = require('express');
var _=require('underscore');
var app = express();
var PORT = process.env.PORT || 3000;

var todos =[{
	id:1,
	description:'Take launch with mom',
	completed:false

},{
	id:2,
	description:'Learn node js ',
	completed:false
}
]

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

app.listen(PORT , function(){
	console.log('Express server started on port :' + PORT);

});