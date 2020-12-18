// Dependencies
const chalk = require("chalk");

module.exports = {
    // MYSQL config options
    DB_DEFAULT_PORT: 3306,
    DB_DEFAULT_CONNECTION_LIMIT: 5,
    DB_DEFAULT_TIMEZONE: '+08:00',
    DB_DEFAULT_HOST: 'localhost',
    DB_DEFAULT_NAME: 'paf2020', 

    // MongoDB config options
    MONGO_URI: 'mongodb://localhost:27017',
    MONGO_DATABASE: 'users', 
    MONGO_COLLECTION: 'posts',
 
    // Express
    PORT: process.env.PORT || 3000, 

    // Chalk Logging
    error: chalk.bold.redBright,
    info: chalk.bold.cyanBright,
    success: chalk.bold.greenBright,

    // Multer temporary storage destination
    MULTER_TMP_DIR: process.env.TMP_DIR || '/Users/jy/Desktop/uploads',

    // S3 Storage
    AWS_S3_HOSTNAME: process.env.AWS_S3_HOSTNAME,
    AWS_S3_ACCESSKEY_ID: process.env.AWS_S3_ACCESSKEY_ID,
    AWS_S3_SECRET_ACCESSKEY: process.env.AWS_S3_SECRET_ACCESSKEY,
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
    AWS_ACCESS_CONTROL_LIST: 'public-read', 
    AWS_REGION: process.env.AWS_REGION_NAME,
    AWS_UPLOADED_FILE_BASE_LINK: `https://${process.env.AWS_BUCKET_NAME}.${process.env.AWS_REGION}.digitaloceanspaces.com/`
};