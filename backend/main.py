from flask import Flask, jsonify, request
from flask_redis import FlaskRedis
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from flask_cors import CORS
import os
import json


load_dotenv()

app = Flask(__name__)
cors = CORS(app)

# configure SQLAlchemy to use Postgres
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
db = SQLAlchemy(app)

# configure FlaskRedis to use Redis
app.config['REDIS_URL'] = os.getenv('CACHE_DATABASE_URL')
redis_store = FlaskRedis(app)

# create the Todo model


class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    completed = db.Column(db.Boolean, nullable=False, default=False)

    def to_dict(self):
        return {'id': self.id, 'title': self.title, 'completed': self.completed}

# create the API routes


@app.route('/api/todo', methods=['GET'])
def get_all_todos():
    # check if the data is cached in Redis
    cached_data = redis_store.get('all_todos')
    if cached_data:
        # return the cached data
        return jsonify(json.loads(cached_data.decode('utf-8')))

    # get all the todos from the database
    todos = Todo.query.all()

    # cache the data in Redis for 60 seconds
    redis_store.set('all_todos', json.dumps(
        [todo.to_dict() for todo in todos]), ex=60)

    # return the todos as JSON
    return jsonify([todo.to_dict() for todo in todos])


@app.route('/api/todo', methods=['POST'])
def create_todo():
    # get the title from the request body
    title = request.json.get('title')

    # create a new todo
    todo = Todo(title=title)

    # add the todo to the database
    db.session.add(todo)
    db.session.commit()

    # invalidate the cache for all todos
    redis_store.delete('all_todos')

    # return the new todo as JSON
    return jsonify(todo.to_dict())


@app.route('/api/todo/<int:id>', methods=['PUT'])
def update_todo_by_id(id):
    # get the todo with the specified id from the database
    todo = Todo.query.get(id)

    if not todo:
        # if the todo doesn't exist, return a 404 error
        return jsonify({'error': 'Todo not found'}), 404

    # update the todo's title and completed status if they were included in the request body
    title = request.json.get('title')
    completed = request.json.get('completed')

    if title is not None:
        todo.title = title

    if completed is not None:
        todo.completed = completed

    # commit the changes to the database
    db.session.commit()

    # invalidate the cache for all todos
    redis_store.delete('all_todos')

    # return the updated todo as JSON
    return jsonify(todo.to_dict())


@app.route('/api/todo/<int:id>', methods=['DELETE'])
def delete_todo_by_id(id):
    # get the todo with the specified id from the database
    todo = Todo.query.get(id)

    if not todo:
        # if the todo doesn't exist, return a 404 error
        return jsonify({'error': 'Todo not found'}), 404

    # delete the todo from the database
    db.session.delete(todo)
    db.session.commit()

    # invalidate the cached data in Redis for this todo
    redis_store.delete(f'all_todos')

    # return a success message as JSON
    return jsonify({'message': 'Todo deleted successfully'})


if __name__ == '__main__':
    with app.app_context():
        db.create_all()

    app.run()
