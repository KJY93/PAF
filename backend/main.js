// Dependencies
const express = require('express');
const morgan = require('morgan');
const { checkMySQLPoolConnection,
	   checkMongoDBPoolConnection,
	   getUser,
	   uploadPost,
	   upload } = require('./controllers/queries');
const config = require('./models/config');

// Express instance
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/frontend'))

// Logger
if (app.get('env') !== 'production') app.use(morgan('combined'));

// Resources
const router = express.Router();

// Routes
router.route('/users')
	  .post(getUser)

router.route('/upload')
	  .post(upload.single('image-file'), uploadPost)

app.use('/api', router);

// Error handler
app.use((err, req, res, next) => {
	err.status = err.status || 500; 
    res.status(err.status).json({
        status: err.status,
        message: err.message,
    });
});

// Start application
Promise.all([checkMySQLPoolConnection(), checkMongoDBPoolConnection()])
    .then(results => {
        console.info(config.success(`Mysql connection ${results[0]['connectionState']}...`))
        console.info(config.success(`MongoDB connection ${results[1]['connectionState']}...`))
        app.listen(config.PORT, () => {
            console.info(config.info(`App running on PORT ${config.PORT} at ${new Date()}`));
        });        
    })
    .catch(err => console.error(config.error(err)));