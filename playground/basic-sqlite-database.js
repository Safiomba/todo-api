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

sequelize.sync({
	force: false
}).then(function() {
	console.log('Everythin is sync');
	 Todo.findById(2).then(function(todo){
	 	if (todo) {
	 		console.log(todo.toJSON());
	 	}else{
	 		console.log('not found');
	 	}

	 });
	/*Todo.create({
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