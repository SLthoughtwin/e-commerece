const mongoose = require('mongoose');

const connection = async () => {
  return await mongoose.connect('mongodb://userAdmin:admin12345@127.0.0.1:27017/e-coomerece?authSource=admin',{useNewUrlParser: true,
  useUnifiedTopology: true});
};

module.exports = { connection };
