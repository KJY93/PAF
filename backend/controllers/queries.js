// Dependencies
const config = require('../models/config');
const mysql = require('mysql2/promise');
const MongoClient = require('mongodb').MongoClient;
const AWS = require('aws-sdk');
const multer = require('multer');
const fs = require('fs-extra');
const { AWS_ACCESS_CONTROL_LIST, MONGO_COLLECTION } = require('../models/config');
const sha1 = require('sha1');

/////////////////////////////////////////////////
//////////        MYSQL                //////////        
/////////////////////////////////////////////////
// MySQL Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || config.DB_DEFAULT_HOST,
    port: process.env.DB_PORT || config.DB_DEFAULT_PORT,
    database: process.env.DB_NAME || config.DB_DEFAULT_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionLimit: config.DB_DEFAULT_CONNECTION_LIMIT,
    timezone: config.DB_DEFAULT_TIMEZONE
});

// MySQL checking pool connection
async function checkMySQLPoolConnection() {
    let isConnected = false;
    const conn = await pool.getConnection();
    try {
        console.info(config.info(`Pinging database...`));
        await conn.ping();
        isConnected = !isConnected;
    }
    catch (err) {
        console.error((config.error(`Cannot ping database...: ', err`)));
        return Promise.reject({ connectionState: 'fail', errMsg: err })
    }
    finally {
        conn.release();
        console.info(config.info(`MySQL connection released...`));
        if (isConnected) {
            return Promise.resolve({ connectionState: 'ready' })
        }
    };
};

/////////////////////////////////////////////////
//////////        MONGODB              //////////        
/////////////////////////////////////////////////
// MongoDB Pool
const MONGO_URI = config.MONGO_URI;
const mongoClient = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// MongoDB checking pool connection
async function checkMongoDBPoolConnection() {
    try {
        await mongoClient.connect();
        return Promise.resolve({ connectionState: 'ready' });
    }
    catch (err) {
        return Promise.reject({ connectionState: 'fail', errMsg: err });
    }
};

/////////////////////////////////////////////////
//////////          S3                 //////////        
/////////////////////////////////////////////////
// S3 Storage
const s3 = new AWS.S3({
    endpoint: new AWS.Endpoint(config.AWS_S3_HOSTNAME),
    accessKeyId: config.AWS_S3_ACCESSKEY_ID,
    secretAccessKey: config.AWS_S3_SECRET_ACCESSKEY
})

const upload = multer({
    dest: config.MULTER_TMP_DIR
});

const readFile = (filePath) => new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, buffer) => {
        if (null != err) reject(err);
        resolve(buffer);
    });
});

const putObject = (file, buffer, s3) => new Promise((resolve, reject) => {
        const params = {
            Bucket: config.AWS_BUCKET_NAME,
            Key: file.filename,
            Body: buffer,
            ACL: config.AWS_ACCESS_CONTROL_LIST,
            ContentType: file.mimetype,
            ContentLength: file.size,
            Metadata: {
                originalName: file.originalname,
                update: '' + (new Date().getTime())
            }
        };
        s3.putObject(params, (err, result) => {
            if (null != err) {
                // reject(err);
                reject({ S3ErrorMessage: err });
            }
            resolve(result);
        });
    });


const getObject = (function (s3) {
    // id from req.params
    return (id) => new Promise((resolve, reject) => {
        const params = {
            Bucket: config.AWS_BUCKET_NAME,
            Key: id
        }
        s3.getObject(params, (err, data) => {
            if (err) { 
                console.error('S3 error', err)
                reject(err);
            }
            resolve(data);
        })
    })
})(s3);


/////////////////////////////////////////////////
//////////          Middlewares        //////////        
/////////////////////////////////////////////////
/// Validating User
const getUser = async(req, res, next) => {
    const username = req.body.username;
    const password = sha1(req.body.password); 
    const conn = await pool.getConnection();
    const SQL_GET_USER_BY_ID = `SELECT * from user WHERE user_id = ? and password = ?`;

    try {
        let results = await conn.query(SQL_GET_USER_BY_ID, [username , password]);

        if (results[0].length > 0) {
            res.type('application/json');
            res.status(200).json({
                status: 200,
                message: 'authenticated'
            });
        }
        else {
            let err = new Error('Invalid credentials.');
            err.status = 401;
            next(err);    
        }
    }
    catch(err) {
        next(err);
    }
};

const createPost = (params, image) => {
    return {
        timeStamp: new Date(),
        title: params.title,
        comments: params.comments,
        imgUrl: config.AWS_UPLOADED_FILE_BASE_LINK + `${image}`
    }
}

const uploadPost = (req, res, next) => {
    console.info('>>> req.body: ', req.body);
    console.info('>>> req.file: ', req.file);

    const doc = createPost(req.body, req.file.filename);

    readFile(req.file.path)
        .then(buff => putObject(req.file, buff, s3))
        .then(() => 
            mongoClient.db(config.MONGO_DATABASE).collection(MONGO_COLLECTION)
                .insertOne(doc)
        )
        .then(result => {
            console.info('post created: ', result);
            res.status(200);
            res.json({ id: result.ops[0]._id });
            fs.unlink(req.file.path, () => {});
        })
        .catch(err => {
            if (err.S3ErrorMessage) {
                let err = new Error('Unauthorized');
                err.status = 401;
                next(err);  
            }
            else {
                next(err);
            }
        });
}

module.exports = {
    checkMySQLPoolConnection,
    checkMongoDBPoolConnection,
    getUser,
    upload,
    uploadPost
};