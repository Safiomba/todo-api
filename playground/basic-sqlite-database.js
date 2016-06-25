var Sequelize = require('sequelize');

sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			len: [1, 250]
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false

	}

});
var User = sequelize.define('user',{
	email : Sequelize.STRING

});
Todo.belongsTo(User);
User.hasMany(Todo);

sequelize.sync({
	force: true
}).then(function() {
	console.log('Everythin is sync');
	User.create({email:'ansou@gmail.com'}).then(function(){
		return Todo.create({
			description:'clean yard',
			completed:false
		});

	}).then(function(todo){
		User.findById(1).then(function(user){
			console.log('user -->',user);
			user.addTodo(todo);
		})
			
	})
	 /*Todo.findById(2).then(function(todo){
	 	if (todo) {
	 		console.log(todo.toJSON());
	 	}else{
	 		console.log('not found');
	 	}

	 });
	Todo.create({
		description: 'Go bed',
		completed: false
	}).then(function(todo) {
		return Todo.create({
			description: 'trash oh'
		});
	}).then(function(todo) {
		//return Todo.findById(1);
		return Todo.findAll({
			where: {
				completed: false,
				description: {
					$like: '%trash%'
				}
			}
		});
	}).then(function(todos) {
		if (todos) {
			todos.forEach(function(todo) {
				console.log(todo.toJSON());
			});
		}
	}).catch(function(e) {
		console.log(e);
	});*/
});