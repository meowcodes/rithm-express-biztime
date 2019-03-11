# BizTime

BizTime is a REST-ful backend API server for a simple company/invoice tracker. It is an exercise designed by [Rithm School](https://github.com/rithmschool).

## Getting Started

``` bash
git clone https://github.com/meowcodes/rithm-express-biztime.git
``` 

### Prerequisites

Postgres, Node, Nodemon, Jest

``` bash
which brew
which postgres
which node
npm install -g nodemon
npm install -g jest
createdb biztime
psql biztime < data.sql
createdb biztime-test 
psql biztime < data-test.sql
```

### Installing

`npm install` installs remaining dependencies from package.json file.

## Running the application

### Running the server

`nodemon --inspect server.js`

Below message signifies that the server has started.

`listening on 3000`

### Accessingg the application

Go to `localhost:3000` to visit the app.

### Accessingg the debugger

Go to `about:inspect` on Google Chrome and find the app under 'Remote Target'

## Running the tests

`jest --watchAll` runs all the tests.

## Using the API

## Deployment

## Built with

* [Node](https://nodejs.org/en/) - The server-side environment user
* [Express](https://expressjs.com/) - The web framework used
* [Postgres](https://www.postgresql.org/) - The database managemenet system used

## Authors

* **Lena Ryoo** - *Contributor* - [meowcodes](https://github.com/meowcodes)
* **Chengsi Gao** - *Initial work* - [chengsig](https://github.com/chengsig)

See also the list of [contributors](https://github.com/meowcodes/rithm-express-lunchly/graphs/contributors) who participated in this project.

## Acknowledgments

* [Rithm School](https://github.com/rithmschool)
* [Elie](https://github.com/elie) - Rithm School Instructor
* [Joel](https://github.com/joelburton) - Rithm School Instructor
* [Alissa](https://github.com/alissarenz) - Rithm School Instructor